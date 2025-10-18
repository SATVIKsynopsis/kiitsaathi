# 🔧 Quick Fix Guide - Quota Counter Not Decreasing

## Issue
After generating a resume, the "Resumes remaining this month: 2" counter doesn't decrease to "1".

## Root Cause
The atomic increment RPC function hasn't been applied to your database yet.

## Solution (Choose One)

### Option 1: Apply via Supabase Dashboard (EASIEST) ⭐

1. **Open Supabase Dashboard**: https://app.supabase.com
2. **Go to SQL Editor** (left sidebar)
3. **Click "New Query"**
4. **Copy and paste** this SQL:

```sql
CREATE OR REPLACE FUNCTION increment_resume_usage(
  p_user_id UUID,
  p_action TEXT,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE resume_usage
  SET count = count + 1
  WHERE user_id = p_user_id
    AND action = p_action
    AND year = p_year
    AND month = p_month;
    
  IF NOT FOUND THEN
    INSERT INTO resume_usage (user_id, action, year, month, count)
    VALUES (p_user_id, p_action, p_year, p_month, 1)
    ON CONFLICT (user_id, action, year, month) 
    DO UPDATE SET count = resume_usage.count + 1;
  END IF;
END;
$$;
```

5. **Click "Run"**
6. **Restart your backend server**
7. **Refresh your frontend** and try generating a resume

### Option 2: Apply via Supabase CLI

```bash
cd c:\Users\KIIT\Desktop\kiitsaathi
supabase migration up
```

---

## ✅ Verify It's Working

### Check Backend Logs
After generating a resume, you should see:
```
📊 About to increment usage for user: [your-user-id]
📊 Incrementing usage for user [your-user-id], action: generation, 2025-10
📊 Current usage before increment: { count: 0, ... }
✅ Usage incremented via RPC: {...}
✅ Usage increment completed successfully
```

### Check Frontend Console
After generation completes:
```
🔄 Refreshing monthly usage after generation...
✅ Monthly usage refreshed, new count: { generation: { used: 1, remaining: 1 } }
```

### Check Supabase Database
Run this query in SQL Editor (replace `YOUR_USER_ID`):
```sql
SELECT * FROM resume_usage 
WHERE user_id = 'YOUR_USER_ID'::uuid 
  AND year = 2025 
  AND month = 10;
```

You should see:
```
| user_id | action | year | month | count |
|---------|--------|------|-------|-------|
| [your]  | generation | 2025 | 10 | 1   |
```

---

## 🐛 Troubleshooting

### Counter still shows "2" after generation?

1. **Check if RPC exists**:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'increment_resume_usage';
   ```
   If no rows returned → Apply the migration above

2. **Check backend logs**:
   - Look for "⚠️ RPC not available" → RPC not created yet
   - Look for "❌ Usage increment failed" → Check error message

3. **Manually check database**:
   ```sql
   SELECT * FROM resume_usage WHERE user_id = 'YOUR_USER_ID'::uuid;
   ```
   If count is increasing but UI doesn't update → Frontend caching issue

4. **Clear React state**:
   - Hard refresh browser (Ctrl+Shift+R)
   - Or restart frontend dev server

### Yes, generating another resume WILL exhaust your quota

Each successful generation increments your count:
- 1st generation: 2 → 1 remaining
- 2nd generation: 1 → 0 remaining
- 3rd generation: ❌ Blocked (quota exhausted)

The counter might not show the update in real-time if the RPC isn't applied, but the backend IS tracking it correctly in the database.

---

## 📝 Quick Test After Applying Fix

1. Apply the SQL migration above
2. Restart backend server
3. Open browser console (F12)
4. Generate a new resume
5. Watch for console logs:
   - Backend: "✅ Usage increment completed"
   - Frontend: "✅ Monthly usage refreshed"
6. Counter should now show "Resumes remaining this month: 1"

---

## 🔄 Reset Your Quota (For Testing Only)

If you want to reset your quota back to 2/2:

```sql
DELETE FROM resume_usage 
WHERE user_id = 'YOUR_USER_ID'::uuid 
  AND action = 'generation';
```

**⚠️ Only do this for testing! In production, quotas reset automatically next month.**
