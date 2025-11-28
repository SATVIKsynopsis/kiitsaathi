# Food Stalls & Restaurants Database Schema

This directory contains the database migration files for the KIIT Food Stalls & Restaurants system.

## Migration Files

### 20241128000001_create_food_stalls_tables.sql
Creates the core tables:
- `shops` - Food shops/restaurants information
- `coupon_batches` - Coupon campaign management
- `coupons` - Individual generated coupons
- `redemptions` - Coupon redemption tracking
- `shop_staff` - Shopkeeper assignments
- `shopkeeper_emails` - Pre-approved shopkeeper emails
- `shop_views` - Analytics tracking
- `flagged_attempts` - Security tracking
- `user_roles` - Role-based access control

### 20241128000002_add_indexes_and_rls_policies.sql
Adds:
- Performance indexes for all tables
- Row Level Security (RLS) policies
- Access control rules for different user roles

### 20241128000003_add_helper_functions.sql
Creates utility functions:
- `has_role()` - Check user roles
- `get_shop_avg_rating()` - Get shop ratings (placeholder)
- `get_shop_review_count()` - Get review counts (placeholder)
- `generate_coupon_code()` - Generate unique coupon codes
- `expire_old_coupons()` - Cleanup expired coupons
- `auto_assign_shopkeeper()` - Auto-assign roles on signup
- Update timestamp triggers

### 20241128000004_insert_sample_data.sql
Inserts sample data:
- 6 sample food shops with realistic data
- Coupon batches for each shop
- Permission grants

## How to Use

### Option 1: Run All at Once
Copy all migration files' content into a single script and run in Supabase SQL Editor.

### Option 2: Run Individually
Run each migration file in order (001, 002, 003, 004) in the Supabase SQL Editor.

## Post-Migration Setup

1. **Add Admin Role**: After your admin user signs up, add their role:
   ```sql
   INSERT INTO user_roles (user_id, role) VALUES ('your-user-uuid', 'admin');
   ```

2. **Add Shopkeeper Emails**: Use the admin dashboard to add shopkeeper emails.

3. **Create Auth Trigger**: The auth.users trigger might need manual creation:
   ```sql
   CREATE TRIGGER on_auth_user_created
       AFTER INSERT ON auth.users
       FOR EACH ROW EXECUTE FUNCTION auto_assign_shopkeeper();
   ```

## Edge Functions Required

You'll also need these Supabase Edge Functions:
- `generate-coupon` - Coupon generation logic
- `redeem-coupon` - Coupon redemption logic

## Features Supported

- ✅ Shop management and display
- ✅ Coupon generation and redemption
- ✅ Role-based access (admin, shopkeeper, customer)
- ✅ Analytics tracking
- ✅ Security and fraud prevention
- ✅ QR code integration
- ✅ Multi-shop support
- ✅ Batch coupon management
- ✅ Auto-assignment of shopkeeper roles

## Security Features

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Shopkeeper auto-assignment via email verification
- Audit trails for redemptions
- Flagged attempt tracking for suspicious activity