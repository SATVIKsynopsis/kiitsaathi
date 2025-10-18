# Resume Saathi Quota System - Testing Checklist

## Pre-Testing Setup
- [ ] Apply the new migration: `supabase/migrations/20251018000000_resume_usage_atomic_increment.sql`
- [ ] Restart backend server
- [ ] Clear browser cache and refresh frontend

## Test Cases

### ✅ Test 1: Resume Generation Counter
- [ ] Check initial counter shows "Resumes remaining this month: 2"
- [ ] Generate 1st resume
- [ ] Counter should update to "Resumes remaining this month: 1"
- [ ] Generate 2nd resume
- [ ] Counter should update to "Resumes remaining this month: 0"
- [ ] Try to generate 3rd resume
- [ ] Should fail with error: "Monthly limit reached"
- [ ] Counter should still show "0"

### ✅ Test 2: Create New Button
- [ ] With quota remaining (1 or 2), "Create New" button should be enabled and green
- [ ] After exhausting quota (0 remaining), "Create New" button should be greyed out
- [ ] Clicking disabled button should do nothing

### ✅ Test 3: Edit Saved Resume
- [ ] Save a resume when you still have quota
- [ ] Go to "My Resumes"
- [ ] With quota remaining, "Edit" button should work normally
- [ ] Exhaust your quota (generate 2 resumes)
- [ ] Go back to "My Resumes"
- [ ] "Edit" button should be greyed out and disabled
- [ ] Clicking it should show error toast: "Monthly limit reached"

### ✅ Test 4: Download Unlimited
- [ ] Generate a resume
- [ ] Download it 10+ times
- [ ] All downloads should work without any limit
- [ ] No "Downloads left" counter should be visible

### ✅ Test 5: Delete All Data
- [ ] Generate 2 resumes (exhaust quota)
- [ ] Verify counter shows "0 remaining"
- [ ] Click "Delete All Data"
- [ ] Confirm deletion
- [ ] Counter should still show "0 remaining" (quota persists in DB)
- [ ] "Create New" should still be disabled

### ✅ Test 6: User Data Preservation
- [ ] Create a resume with:
  - Custom summary text
  - 20 technical skills
  - 5 soft skills
- [ ] Generate resume
- [ ] Verify preview shows:
  - Your exact summary (not AI-generated)
  - All 20 technical skills
  - All 5 soft skills
- [ ] No AI-added skills or summary modifications

### ✅ Test 7: Month Rollover (Optional - Manual DB Test)
- [ ] In Supabase dashboard, manually update `resume_usage` table
- [ ] Change `month` and `year` to last month
- [ ] Refresh frontend
- [ ] Counter should show "2 remaining" (new month = reset)

### ✅ Test 8: Preview and View
- [ ] Even with quota exhausted, "My Resumes" should work
- [ ] "Preview" button should always work
- [ ] View saved resumes without restrictions

## Expected Behavior Summary

| Quota Remaining | Create New | Edit Saved | Preview | Download | Delete |
|----------------|------------|------------|---------|----------|--------|
| 2 | ✅ Enabled | ✅ Enabled | ✅ Works | ✅ Unlimited | ✅ Works |
| 1 | ✅ Enabled | ✅ Enabled | ✅ Works | ✅ Unlimited | ✅ Works |
| 0 | ❌ Disabled | ❌ Disabled | ✅ Works | ✅ Unlimited | ✅ Works |

## Troubleshooting

### Counter not decreasing after generation?
1. Check backend console for "Usage increment failed" warnings
2. Verify migration was applied: Query `SELECT * FROM resume_usage WHERE user_id = 'YOUR_USER_ID'`
3. Check if RPC function exists: `SELECT proname FROM pg_proc WHERE proname = 'increment_resume_usage'`

### Button not disabling?
1. Check browser console for `monthlyUsage.generation?.remaining` value
2. Verify `/usage-summary` endpoint returns correct data
3. Clear React state and reload page

### Download limit still showing?
1. Clear browser cache
2. Verify code changes were saved and rebuilt
3. Check if old bundle is cached

## Database Verification Queries

```sql
-- Check current usage for a user
SELECT * FROM resume_usage 
WHERE user_id = 'YOUR_USER_ID' 
  AND year = EXTRACT(YEAR FROM CURRENT_DATE)
  AND month = EXTRACT(MONTH FROM CURRENT_DATE);

-- Manually reset quota for testing (use carefully!)
DELETE FROM resume_usage WHERE user_id = 'YOUR_USER_ID';

-- Check if RPC exists
SELECT proname FROM pg_proc WHERE proname = 'increment_resume_usage';
```

## Success Criteria
- [ ] All 8 test cases pass
- [ ] Counter accurately reflects remaining generations
- [ ] Buttons disable/enable correctly based on quota
- [ ] Downloads work unlimited times
- [ ] User data (summary, skills) is always preserved
- [ ] Delete All Data does not reset quota
