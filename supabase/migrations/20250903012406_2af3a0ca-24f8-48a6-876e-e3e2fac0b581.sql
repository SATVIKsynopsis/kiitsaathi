-- Replace expense_splits policies to include group creators and ensure splits target same group
DROP POLICY IF EXISTS "Group members can create expense splits" ON public.expense_splits;
DROP POLICY IF EXISTS "Group members can update expense splits" ON public.expense_splits;
DROP POLICY IF EXISTS "Group members can delete expense splits" ON public.expense_splits;

-- INSERT: actor must be group member OR group creator; row's member must belong to the expense's group
CREATE POLICY "Members or creator can insert expense_splits"
ON public.expense_splits
FOR INSERT
WITH CHECK (
  -- expense exists
  EXISTS (
    SELECT 1 FROM public.expenses e
    WHERE e.id = expense_splits.expense_id
  )
  AND
  -- target member belongs to same group as the expense
  EXISTS (
    SELECT 1
    FROM public.expenses e
    JOIN public.group_members gm_target ON gm_target.id = expense_splits.member_id
    WHERE e.id = expense_splits.expense_id
      AND gm_target.group_id = e.group_id
  )
  AND (
    -- actor is a member of that group
    EXISTS (
      SELECT 1
      FROM public.expenses e
      JOIN public.group_members gm ON gm.group_id = e.group_id
      JOIN public.profiles p ON p.email = gm.email_phone
      WHERE e.id = expense_splits.expense_id
        AND p.id = auth.uid()
    )
    OR
    -- actor is the group creator
    EXISTS (
      SELECT 1
      FROM public.expenses e
      JOIN public.groups g ON g.id = e.group_id
      WHERE e.id = expense_splits.expense_id
        AND g.created_by = auth.uid()
    )
  )
);

-- UPDATE: actor must be group member or creator for that expense's group
CREATE POLICY "Members or creator can update expense_splits"
ON public.expense_splits
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.expenses e
    JOIN public.group_members gm ON gm.group_id = e.group_id
    JOIN public.profiles p ON p.email = gm.email_phone
    WHERE e.id = expense_splits.expense_id
      AND p.id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.expenses e
    JOIN public.groups g ON g.id = e.group_id
    WHERE e.id = expense_splits.expense_id
      AND g.created_by = auth.uid()
  )
);

-- DELETE: same as update
CREATE POLICY "Members or creator can delete expense_splits"
ON public.expense_splits
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.expenses e
    JOIN public.group_members gm ON gm.group_id = e.group_id
    JOIN public.profiles p ON p.email = gm.email_phone
    WHERE e.id = expense_splits.expense_id
      AND p.id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.expenses e
    JOIN public.groups g ON g.id = e.group_id
    WHERE e.id = expense_splits.expense_id
      AND g.created_by = auth.uid()
  )
);

-- SELECT: ensure creators can also view (in addition to existing member policy). Drop and recreate for clarity
DROP POLICY IF EXISTS "Group members can view expense splits" ON public.expense_splits;
CREATE POLICY "Members or creator can view expense_splits"
ON public.expense_splits
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.expenses e
    JOIN public.group_members gm ON gm.group_id = e.group_id
    JOIN public.profiles p ON p.email = gm.email_phone
    WHERE e.id = expense_splits.expense_id
      AND p.id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.expenses e
    JOIN public.groups g ON g.id = e.group_id
    WHERE e.id = expense_splits.expense_id
      AND g.created_by = auth.uid()
  )
);