# Password Recovery Email Setup

## Root Cause
Password recovery emails were not being sent because there was no custom edge function to handle them (unlike signup confirmations which have a working edge function).

## Fix Applied
✅ Created `send-password-recovery` edge function with Resend integration
✅ Added function configuration to `supabase/config.toml`

## Required Manual Configuration in Supabase Dashboard

**CRITICAL:** You must configure Supabase Auth to use the custom password recovery function:

1. Go to: https://supabase.com/dashboard/project/jzkzqpeorsehwvwcyjkf/auth/templates

2. Find the **"Reset Password"** email template

3. Click **"Use custom SMTP"** or **"Use webhook"** 

4. Set the webhook URL to:
   ```
   https://jzkzqpeorsehwvwcyjkf.supabase.co/functions/v1/send-password-recovery
   ```

5. Save changes

## Testing Steps

1. Go to login page and click "Forgot Password"
2. Enter a valid KIIT email address
3. Check email inbox within 60 seconds
4. Verify you receive a "Reset Your KIIT Saathi Password" email
5. Click the reset link and confirm it redirects properly
6. Set new password and verify you can login

## Expected Result
- Password recovery email arrives within 60 seconds
- Email has KIIT Saathi branding with gradient button
- Reset link works and expires in 1 hour
- User can successfully reset password and login

## Logs
Check edge function logs at: https://supabase.com/dashboard/project/jzkzqpeorsehwvwcyjkf/functions/send-password-recovery/logs
