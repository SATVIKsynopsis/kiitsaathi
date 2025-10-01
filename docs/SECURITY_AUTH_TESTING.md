# KIIT Saathi - Authentication & Authorization Security Testing Guide

## Overview
This document provides comprehensive testing procedures for the KIIT email-only authentication system with email verification enforcement.

## Test Environment Setup
- **Staging URL**: https://ksaathi.vercel.app (or your preview URL)
- **Admin Email**: adityash8997@gmail.com
- **Test KIIT Emails**: Use test KIIT emails ending with @kiit.ac.in
- **Test Non-KIIT Emails**: test@gmail.com, user@yahoo.com, etc.

## Critical Test Cases

### 1. Sign Up with Non-KIIT Email (Email/Password)
**Test ID**: AUTH-001  
**Priority**: CRITICAL

**Steps**:
1. Navigate to /auth
2. Click "Sign Up" tab
3. Enter:
   - Name: Test User
   - Email: testuser@gmail.com
   - Password: TestPass123!
4. Click "Create Account"

**Expected Result**:
- ❌ Client-side validation shows: "🚫 Access Denied! Please use your official KIIT ID"
- ❌ Button is disabled while error shows
- ✅ No account is created

**Database Check**:
```sql
SELECT * FROM auth_violations WHERE email = 'testuser@gmail.com';
-- Should show violation record with type 'domain_not_allowed'
```

---

### 2. Sign Up with KIIT Email (Email/Password)
**Test ID**: AUTH-002  
**Priority**: CRITICAL

**Steps**:
1. Navigate to /auth
2. Click "Sign Up" tab
3. Enter:
   - Name: Test KIIT User
   - Email: 24155598@kiit.ac.in (or your test KIIT email)
   - Password: TestPass123!
4. Click "Create Account"

**Expected Result**:
- ✅ Success message: "Almost there! Check your email for the confirmation link"
- ✅ Account created in auth.users
- ✅ Profile created with is_email_verified = false
- ✅ Email sent to user inbox

**Database Check**:
```sql
-- Check profile was created with is_email_verified = false
SELECT id, email, is_email_verified, email_verified_at 
FROM profiles 
WHERE email = '24155598@kiit.ac.in';

-- Check auth event was logged
SELECT * FROM auth_events 
WHERE email = '24155598@kiit.ac.in' 
ORDER BY created_at DESC LIMIT 1;

-- Check email was logged
SELECT * FROM email_logs 
WHERE email = '24155598@kiit.ac.in' AND email_type = 'verification'
ORDER BY created_at DESC LIMIT 1;
```

---

### 3. Email Verification Flow
**Test ID**: AUTH-003  
**Priority**: CRITICAL

**Steps**:
1. After signing up (AUTH-002), check email inbox
2. Click the verification link in the email
3. Should redirect to app

**Expected Result**:
- ✅ Redirected to app with success message
- ✅ is_email_verified set to true in profiles
- ✅ email_verified_at timestamp set
- ✅ Auth event logged with type 'verification_success'

**Database Check**:
```sql
-- Verify email is marked as verified
SELECT id, email, is_email_verified, email_verified_at 
FROM profiles 
WHERE email = '24155598@kiit.ac.in';

-- Should show is_email_verified = true and email_verified_at with timestamp
```

---

### 4. Unverified User Attempts Protected Action
**Test ID**: AUTH-004  
**Priority**: CRITICAL

**Steps**:
1. Sign up with KIIT email but DON'T verify email
2. Try to sign in with email/password
3. Navigate to /resale/new-listing (or any protected page)
4. Try to create a new listing

**Expected Result**:
- ✅ Sign-in works BUT notice shown: "Please verify your email"
- ❌ When attempting to create listing: Database INSERT is blocked by RLS policy
- ✅ User sees error: "Email verification required" or similar

**Database Check**:
```sql
-- Attempt to manually insert as unverified user (should fail)
-- This simulates what happens when client tries to create a listing
INSERT INTO resale_listings (user_id, title, description, price)
VALUES ('USER_UUID_HERE', 'Test Item', 'Test Description', 100);
-- Should fail with RLS policy violation
```

---

### 5. Google OAuth with Non-KIIT Email
**Test ID**: AUTH-005  
**Priority**: CRITICAL

**Steps**:
1. Navigate to /auth
2. Click "Sign in with Google"
3. Choose a Google account that does NOT end with @kiit.ac.in

**Expected Result**:
- ❌ OAuth callback processed
- ❌ Server detects non-KIIT email
- ❌ User is signed out immediately
- ❌ User account is deleted from auth.users
- ✅ Violation logged in auth_violations
- ✅ User sees error: "Only KIIT College Email IDs (@kiit.ac.in) are allowed"

**Database Check**:
```sql
-- Check violation was logged
SELECT * FROM auth_violations 
WHERE email = 'test@gmail.com' AND violation_type = 'domain_not_allowed'
ORDER BY created_at DESC LIMIT 1;

-- Check user was deleted (should return 0 rows)
SELECT count(*) FROM auth.users WHERE email = 'test@gmail.com';
```

---

### 6. Google OAuth with KIIT Email
**Test ID**: AUTH-006  
**Priority**: CRITICAL

**Steps**:
1. Navigate to /auth
2. Click "Sign in with Google"
3. Choose a Google account that ENDS with @kiit.ac.in

**Expected Result**:
- ✅ OAuth succeeds
- ✅ User account created
- ✅ Profile created with is_email_verified = true (OAuth emails are pre-verified)
- ✅ User can immediately access all features
- ✅ Auth event logged with provider = 'google'

**Database Check**:
```sql
SELECT id, email, is_email_verified, email_verified_at 
FROM profiles 
WHERE email = 'yourname@kiit.ac.in';
-- Should show is_email_verified = true immediately

SELECT * FROM auth_events 
WHERE email = 'yourname@kiit.ac.in' AND provider = 'google'
ORDER BY created_at DESC LIMIT 1;
```

---

### 7. Client-Side Bypass Attempt
**Test ID**: AUTH-007  
**Priority**: CRITICAL

**Steps**:
1. Open browser dev tools
2. Sign up with non-KIIT email (e.g., test@gmail.com)
3. Before clicking submit, disable JavaScript OR modify HTML to remove disabled attribute from button
4. Submit the form

**Expected Result**:
- ❌ Even if client-side validation is bypassed, server MUST reject
- ❌ Supabase trigger handle_new_user() throws exception
- ❌ Account is NOT created
- ✅ Violation is logged

---

### 8. RLS Policy Tests - Create Listing (Unverified User)
**Test ID**: AUTH-008  
**Priority**: CRITICAL

**Steps**:
1. Sign up and sign in with KIIT email but don't verify
2. Get user UUID from session
3. Use Supabase SQL editor to manually try INSERT:

```sql
-- Replace USER_UUID with actual UUID
INSERT INTO resale_listings (user_id, title, description, price)
VALUES ('USER_UUID', 'Test Item', 'Test', 100);
```

**Expected Result**:
- ❌ INSERT fails with RLS policy violation
- ✅ Error message includes "new row violates row-level security policy"

---

### 9. RLS Policy Tests - Create Listing (Verified User)
**Test ID**: AUTH-009  
**Priority**: CRITICAL

**Steps**:
1. Sign up, verify email, and sign in with KIIT email
2. Navigate to /resale/new-listing
3. Fill out listing form and submit

**Expected Result**:
- ✅ Listing created successfully
- ✅ User can see their listing in /resale/my-listings

**Database Check**:
```sql
SELECT * FROM resale_listings WHERE user_id = 'USER_UUID';
-- Should return the created listing
```

---

### 10. Magic Link Token Reuse Test
**Test ID**: AUTH-010  
**Priority**: HIGH

**Steps**:
1. Sign up with KIIT email
2. Receive verification email
3. Click the magic link once → should verify email
4. Copy the magic link URL
5. Sign out
6. Paste the same magic link URL and try to use it again

**Expected Result**:
- ❌ Second use of magic link should fail
- ✅ Error message: "Link expired or already used"

---

### 11. Email Bounce Handling
**Test ID**: AUTH-011  
**Priority**: MEDIUM

**Steps**:
1. Sign up with invalid KIIT email that will bounce (e.g., nonexistent@kiit.ac.in)
2. Check email_logs table after a few minutes

**Expected Result**:
- ✅ Email log shows status = 'bounced'
- ✅ bounced = true in email_logs

**Database Check**:
```sql
SELECT * FROM email_logs 
WHERE email = 'nonexistent@kiit.ac.in' 
ORDER BY created_at DESC LIMIT 1;
-- Should show bounced = true
```

---

### 12. Auth Monitor - High Rejection Rate Alert
**Test ID**: AUTH-012  
**Priority**: MEDIUM

**Steps**:
1. Trigger 10+ non-KIIT email signup attempts within 10 minutes
2. Manually invoke auth-monitor edge function:

```bash
curl -X POST https://jzkzqpeorsehwvwcyjkf.supabase.co/functions/v1/auth-monitor \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Expected Result**:
- ✅ auth-monitor returns alerts array with HIGH_DOMAIN_REJECTION_RATE
- ✅ Alert logged in admin_action_logs table

**Database Check**:
```sql
SELECT * FROM admin_action_logs 
WHERE action = 'security_alert' 
ORDER BY created_at DESC LIMIT 1;
```

---

### 13. Session Persistence After Email Verification
**Test ID**: AUTH-013  
**Priority**: MEDIUM

**Steps**:
1. Sign up with KIIT email (unverified)
2. Sign in with email/password
3. Verify email via magic link in a NEW browser tab
4. Return to original tab
5. Refresh page

**Expected Result**:
- ✅ User remains signed in
- ✅ User can now access protected features without re-login

---

### 14. Admin Access to Auth Violations Dashboard
**Test ID**: AUTH-014  
**Priority**: MEDIUM

**Steps**:
1. Sign in as admin (adityash8997@gmail.com)
2. Navigate to /admin
3. Look for "Auth Violations" or "Security" tab

**Expected Result**:
- ✅ Admin can see all auth_violations entries
- ✅ Each entry shows: email, violation_type, provider, timestamp
- ✅ Admin can view details and patterns

---

### 15. Multiple Failed Verifications Alert
**Test ID**: AUTH-015  
**Priority**: LOW

**Steps**:
1. Sign up with KIIT email
2. Click verification link 3+ times (or use expired links)
3. Invoke auth-monitor

**Expected Result**:
- ✅ Alert: MULTIPLE_FAILED_VERIFICATIONS
- ✅ Shows user email and attempt count

---

## Automated Test Script (Example)

```typescript
// Example using Playwright or similar
describe('KIIT Auth Security', () => {
  test('should reject non-KIIT email signup', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Sign Up');
    await page.fill('input[type="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.fill('input[placeholder*="name"]', 'Test User');
    
    // Should show error
    await expect(page.locator('text=Access Denied')).toBeVisible();
    
    // Button should be disabled
    await expect(page.locator('button:has-text("Create Account")')).toBeDisabled();
  });

  test('should allow KIIT email signup', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Sign Up');
    await page.fill('input[type="email"]', '24155598@kiit.ac.in');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.fill('input[placeholder*="name"]', 'Test KIIT User');
    await page.click('button:has-text("Create Account")');
    
    await expect(page.locator('text=Check your email')).toBeVisible();
  });
});
```

## Database Monitoring Queries

### Recent Auth Violations (Last 24 Hours)
```sql
SELECT 
  email,
  violation_type,
  provider,
  reason,
  created_at
FROM auth_violations
WHERE created_at > now() - interval '24 hours'
ORDER BY created_at DESC;
```

### Auth Events Summary
```sql
SELECT 
  event_type,
  provider,
  COUNT(*) as count
FROM auth_events
WHERE created_at > now() - interval '7 days'
GROUP BY event_type, provider
ORDER BY count DESC;
```

### Unverified Users (Potential Issues)
```sql
SELECT 
  p.email,
  p.created_at,
  p.is_email_verified,
  p.email_verified_at,
  (now() - p.created_at) as account_age
FROM profiles p
WHERE p.is_email_verified = false
  AND p.email ILIKE '%@kiit.ac.in'
  AND p.created_at < now() - interval '7 days'
ORDER BY p.created_at DESC;
```

### Email Delivery Issues
```sql
SELECT 
  email,
  email_type,
  status,
  attempts,
  bounced,
  last_attempt_at
FROM email_logs
WHERE bounced = true OR attempts > 2
ORDER BY last_attempt_at DESC;
```

## Rollback Plan

If critical issues are found in production:

1. **Immediate Rollback**:
   ```sql
   -- Disable email verification requirement temporarily
   -- (Run in Supabase SQL Editor)
   UPDATE profiles SET is_email_verified = true 
   WHERE email ILIKE '%@kiit.ac.in';
   ```

2. **Revert RLS Policies**:
   ```sql
   -- Drop strict policies, revert to authenticated-only
   DROP POLICY "Verified KIIT users can create resale listings" ON resale_listings;
   CREATE POLICY "Authenticated users can create resale listings"
     ON resale_listings FOR INSERT
     TO authenticated
     WITH CHECK (auth.uid() = user_id);
   -- Repeat for other tables
   ```

3. **Disable Edge Functions**:
   - Disable validate-kiit-email webhook in Supabase Dashboard
   - Disable auth-monitor cron job

4. **Notify Users**:
   - Show banner: "Experiencing authentication issues? We're working on it."

## Success Criteria

All tests must pass with these results:
- ✅ 0 non-KIIT emails can create accounts
- ✅ 0 unverified users can perform protected actions
- ✅ 100% of auth violations are logged
- ✅ Google OAuth correctly enforces KIIT domain
- ✅ Email verification works reliably
- ✅ Magic links are single-use only
- ✅ Admin can view all security logs
- ✅ Alerts fire for suspicious activity

## Post-Deployment Monitoring

**First 24 Hours**:
- Check auth_violations every 2 hours
- Monitor email_logs for bounces
- Review auth_events for anomalies
- Test at least 5 signup flows (2 KIIT, 2 non-KIIT, 1 OAuth)

**First Week**:
- Daily review of auth_violations
- Weekly summary of auth_events
- User feedback on verification flow

## Contact for Issues

If any test fails:
1. Take screenshot/video of failure
2. Check browser console for errors
3. Get database query results for that user
4. Check Supabase Edge Function logs
5. Report with all above information

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-01  
**Status**: Production-Ready