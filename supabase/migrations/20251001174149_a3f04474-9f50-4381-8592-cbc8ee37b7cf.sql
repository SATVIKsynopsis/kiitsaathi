-- Fix existing groups with 0 members by deleting them
-- These are likely test groups that were created with the validation bug

-- Log groups being deleted for audit
DO $$
DECLARE
  v_group RECORD;
BEGIN
  FOR v_group IN 
    SELECT g.id, g.name, g.created_by, g.created_at
    FROM groups g
    LEFT JOIN group_members gm ON gm.group_id = g.id
    GROUP BY g.id
    HAVING COUNT(gm.id) = 0
  LOOP
    RAISE NOTICE 'Deleting empty group: % (id: %, created_by: %, created_at: %)', 
      v_group.name, v_group.id, v_group.created_by, v_group.created_at;
  END LOOP;
END $$;

-- Delete expenses from empty groups first (if any)
DELETE FROM expenses
WHERE group_id IN (
  SELECT g.id
  FROM groups g
  LEFT JOIN group_members gm ON gm.group_id = g.id
  GROUP BY g.id
  HAVING COUNT(gm.id) = 0
);

-- Delete empty groups
DELETE FROM groups
WHERE id IN (
  SELECT g.id
  FROM groups g
  LEFT JOIN group_members gm ON gm.group_id = g.id
  GROUP BY g.id
  HAVING COUNT(gm.id) = 0
);

-- Add a check to prevent future empty groups (constraint at app level is preferred)
-- This is a safety measure, primary enforcement is in application code
COMMENT ON TABLE groups IS 'Groups must have at least one member in group_members table. Enforced at application level.';