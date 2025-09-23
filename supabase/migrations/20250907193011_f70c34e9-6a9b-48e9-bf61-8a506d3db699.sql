-- Update calculate_group_balances to use equal split across all group members
CREATE OR REPLACE FUNCTION public.calculate_group_balances(_group_id uuid)
RETURNS TABLE(
  member_id uuid,
  member_name text,
  member_email text,
  total_paid numeric,
  total_share numeric,
  net_balance numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH totals AS (
    SELECT 
      COALESCE(SUM(e.amount), 0)::numeric AS total_expenses,
      (SELECT COUNT(*) FROM public.group_members gm WHERE gm.group_id = _group_id)::numeric AS member_count
    FROM public.expenses e
    WHERE e.group_id = _group_id
  ),
  member_payments AS (
    SELECT 
      gm.id AS member_id,
      gm.name AS member_name,
      gm.email_phone AS member_email,
      COALESCE(SUM(e.amount), 0)::numeric AS total_paid
    FROM public.group_members gm
    LEFT JOIN public.expenses e 
      ON e.paid_by_member_id = gm.id AND e.group_id = _group_id
    WHERE gm.group_id = _group_id
    GROUP BY gm.id, gm.name, gm.email_phone
  ),
  equal_share AS (
    SELECT 
      CASE WHEN t.member_count > 0 THEN t.total_expenses / t.member_count ELSE 0 END AS per_member_share
    FROM totals t
  )
  SELECT 
    mp.member_id,
    mp.member_name,
    mp.member_email,
    ROUND(mp.total_paid, 2) AS total_paid,
    ROUND(es.per_member_share, 2) AS total_share,
    ROUND(mp.total_paid - es.per_member_share, 2) AS net_balance
  FROM member_payments mp
  CROSS JOIN equal_share es
  ORDER BY mp.member_name;
$function$;