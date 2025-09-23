# Admin Service Visibility Control

This document describes how to control service visibility on the KIIT Saathi homepage using admin commands.

## Overview

The system allows authorized admins to hide/show services on the homepage while keeping all internal pages and functionality intact. This is useful for temporarily removing services from public view without breaking existing functionality.

## Admin Commands

### Hide Services
To hide specific services and replace "Printout on Demand" with a placeholder:

```bash
curl -X POST https://jzkzqpeorsehwvwcyjkf.supabase.co/functions/v1/admin-visibility-command \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -d '{"command":"Hide the next services again"}'
```

**Exact command text:** `Hide the next services again`

This will:
- Hide 9 specified services from homepage cards
- Replace "Printout on Demand" card with "More Services Coming Soon...." placeholder
- Keep all internal pages accessible via direct URLs

### Restore Services  
To restore all services to their original visibility:

```bash
curl -X POST https://jzkzqpeorsehwvwcyjkf.supabase.co/functions/v1/admin-visibility-command \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -d '{"command":"Get The next services back (Senior Connect, Handwritten Assignments, Tutoring & Counselling, Campus Tour Booking, Carton Packing & Hostel Transfers, Book Buyback & Resale, KIIT Saathi Celebrations ,KIIT Saathi Meetups, Food and micro-essentials delivery)"}'
```

**Exact command text:** `Get The next services back (Senior Connect, Handwritten Assignments, Tutoring & Counselling, Campus Tour Booking, Carton Packing & Hostel Transfers, Book Buyback & Resale, KIIT Saathi Celebrations ,KIIT Saathi Meetups, Food and micro-essentials delivery)`

## Services Affected

When hiding, these services are removed from homepage display:
1. Senior Connect
2. Handwritten Assignments  
3. Tutoring & Counselling
4. Campus Tour Booking
5. Carton Packing & Hostel Transfers
6. Book Buyback & Resale
7. KIIT Saathi Celebrations
8. KIIT Saathi Meetups
9. Food and micro-essentials delivery

Additionally, "Printout on Demand" is replaced with a "More Services Coming Soon...." placeholder card.

## Security

- Commands require the `ADMIN_SECRET` environment variable in the `x-admin-secret` header
- Only exact text matches are accepted for commands (case and space sensitive)
- All admin actions are logged in the `admin_action_logs` table
- Database visibility changes are protected by RLS policies

## Environment Variables

- `ADMIN_SECRET`: Secret key for admin authentication (set in Supabase Edge Functions secrets)

## Database Tables

### service_visibility
Tracks visibility state for each service:
- `service_id`: Unique identifier for each service
- `visible`: Boolean indicating if service should show on homepage
- `replaced_text`: Optional text to show as placeholder (for Printout service)

### admin_action_logs  
Audit trail for admin actions:
- `action`: Type of action performed
- `command`: Full command text used
- `details`: Additional action details (JSON)
- `created_at`: Timestamp of action

## Rollback Instructions

To manually restore all services via database:

```sql
UPDATE public.service_visibility 
SET visible = true, replaced_text = null, updated_at = now();
```

## Rotating ADMIN_SECRET

1. Generate a new secure secret
2. Update the `ADMIN_SECRET` in Supabase Edge Functions secrets
3. Update any scripts/tools that use the secret
4. Test with a command to verify new secret works

## Monitoring

Check admin action logs:
```sql
SELECT * FROM public.admin_action_logs ORDER BY created_at DESC;
```

Check current service visibility:
```sql
SELECT service_id, visible, replaced_text FROM public.service_visibility;
```

## Troubleshooting

- Ensure exact command text matching (copy from this doc)
- Verify ADMIN_SECRET is set correctly in Supabase
- Check Edge Function logs if commands fail
- Confirm network access to Supabase functions endpoint