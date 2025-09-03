-- Fix RLS policies for expense_splits table to allow group members to insert splits

-- Add INSERT policy for expense_splits
CREATE POLICY "Group members can create expense splits" 
ON public.expense_splits 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM expenses e
    JOIN group_members gm ON gm.group_id = e.group_id
    JOIN profiles p ON p.email = gm.email_phone
    WHERE e.id = expense_splits.expense_id 
    AND p.id = auth.uid()
  )
);

-- Add UPDATE policy for expense_splits (in case needed later)
CREATE POLICY "Group members can update expense splits"
ON public.expense_splits
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM expenses e
    JOIN group_members gm ON gm.group_id = e.group_id
    JOIN profiles p ON p.email = gm.email_phone
    WHERE e.id = expense_splits.expense_id 
    AND p.id = auth.uid()
  )
);

-- Add DELETE policy for expense_splits (in case needed later)  
CREATE POLICY "Group members can delete expense splits"
ON public.expense_splits
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM expenses e
    JOIN group_members gm ON gm.group_id = e.group_id
    JOIN profiles p ON p.email = gm.email_phone
    WHERE e.id = expense_splits.expense_id 
    AND p.id = auth.uid()
  )
);