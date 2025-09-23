-- Create function to calculate group member balances
CREATE OR REPLACE FUNCTION public.calculate_group_balances(_group_id uuid)
RETURNS TABLE (
  member_id uuid,
  member_name text,
  member_email text,
  total_paid numeric,
  total_share numeric,
  net_balance numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  WITH member_payments AS (
    SELECT 
      gm.id as member_id,
      gm.name as member_name,
      gm.email_phone as member_email,
      COALESCE(SUM(e.amount), 0) as total_paid
    FROM group_members gm
    LEFT JOIN expenses e ON e.paid_by_member_id = gm.id AND e.group_id = _group_id
    WHERE gm.group_id = _group_id
    GROUP BY gm.id, gm.name, gm.email_phone
  ),
  member_shares AS (
    SELECT 
      es.member_id,
      COALESCE(SUM(es.amount), 0) as total_share
    FROM expense_splits es
    JOIN expenses e ON e.id = es.expense_id
    WHERE e.group_id = _group_id
    GROUP BY es.member_id
  )
  SELECT 
    mp.member_id,
    mp.member_name,
    mp.member_email,
    mp.total_paid,
    COALESCE(ms.total_share, 0) as total_share,
    mp.total_paid - COALESCE(ms.total_share, 0) as net_balance
  FROM member_payments mp
  LEFT JOIN member_shares ms ON ms.member_id = mp.member_id
  ORDER BY mp.member_name;
$$;

-- Create function to simplify debts using the classic debt simplification algorithm
CREATE OR REPLACE FUNCTION public.simplify_group_debts(_group_id uuid)
RETURNS TABLE (
  from_member_id uuid,
  from_member_name text,
  to_member_id uuid,
  to_member_name text,
  amount numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  balance_record RECORD;
  debtor_record RECORD;
  creditor_record RECORD;
  settlement_amount numeric;
  debtors numeric[] := '{}';
  creditors numeric[] := '{}';
  debtor_ids uuid[] := '{}';
  creditor_ids uuid[] := '{}';
  debtor_names text[] := '{}';
  creditor_names text[] := '{}';
  i integer := 1;
  j integer := 1;
BEGIN
  -- Create temporary tables for processing
  CREATE TEMP TABLE temp_balances AS
  SELECT * FROM public.calculate_group_balances(_group_id);
  
  CREATE TEMP TABLE temp_settlements (
    from_id uuid,
    from_name text,
    to_id uuid,
    to_name text,
    settlement_amount numeric
  );
  
  -- Separate debtors (negative balance) and creditors (positive balance)
  FOR balance_record IN 
    SELECT * FROM temp_balances WHERE net_balance < 0 ORDER BY net_balance
  LOOP
    debtors := debtors || (-1 * balance_record.net_balance);
    debtor_ids := debtor_ids || balance_record.member_id;
    debtor_names := debtor_names || balance_record.member_name;
  END LOOP;
  
  FOR balance_record IN 
    SELECT * FROM temp_balances WHERE net_balance > 0 ORDER BY net_balance DESC
  LOOP
    creditors := creditors || balance_record.net_balance;
    creditor_ids := creditor_ids || balance_record.member_id;
    creditor_names := creditor_names || balance_record.member_name;
  END LOOP;
  
  -- Simplify debts using the classic algorithm
  i := 1;
  j := 1;
  
  WHILE i <= array_length(debtors, 1) AND j <= array_length(creditors, 1) LOOP
    settlement_amount := LEAST(debtors[i], creditors[j]);
    
    IF settlement_amount > 0.01 THEN -- Ignore tiny amounts
      INSERT INTO temp_settlements VALUES (
        debtor_ids[i],
        debtor_names[i],
        creditor_ids[j],
        creditor_names[j],
        settlement_amount
      );
    END IF;
    
    debtors[i] := debtors[i] - settlement_amount;
    creditors[j] := creditors[j] - settlement_amount;
    
    IF debtors[i] <= 0.01 THEN
      i := i + 1;
    END IF;
    
    IF creditors[j] <= 0.01 THEN
      j := j + 1;
    END IF;
  END LOOP;
  
  -- Return the settlements
  RETURN QUERY SELECT * FROM temp_settlements WHERE settlement_amount > 0.01;
  
  DROP TABLE temp_balances;
  DROP TABLE temp_settlements;
END;
$$;

-- Create function to export group summary data
CREATE OR REPLACE FUNCTION public.export_group_summary(_group_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'group_info', (
      SELECT jsonb_build_object(
        'id', g.id,
        'name', g.name,
        'description', g.description,
        'currency', g.currency,
        'created_at', g.created_at
      )
      FROM groups g WHERE g.id = _group_id
    ),
    'members', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', gm.id,
          'name', gm.name,
          'email_phone', gm.email_phone
        )
      )
      FROM group_members gm WHERE gm.group_id = _group_id
    ),
    'expenses', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'title', e.title,
          'amount', e.amount,
          'date', e.date,
          'notes', e.notes,
          'paid_by', gm.name,
          'splits', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'member_name', gm2.name,
                'amount', es.amount
              )
            )
            FROM expense_splits es
            JOIN group_members gm2 ON gm2.id = es.member_id
            WHERE es.expense_id = e.id
          )
        ) ORDER BY e.date DESC
      )
      FROM expenses e
      JOIN group_members gm ON gm.id = e.paid_by_member_id
      WHERE e.group_id = _group_id
    ),
    'balances', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'member_name', cb.member_name,
          'total_paid', cb.total_paid,
          'total_share', cb.total_share,
          'net_balance', cb.net_balance
        )
      )
      FROM public.calculate_group_balances(_group_id) cb
    ),
    'simplified_debts', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'from', sgd.from_member_name,
          'to', sgd.to_member_name,
          'amount', sgd.amount
        )
      )
      FROM public.simplify_group_debts(_group_id) sgd
    )
  );
$$;