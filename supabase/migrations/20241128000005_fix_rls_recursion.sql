-- Fix: Remove problematic RLS policies that cause infinite recursion
-- This fixes the "infinite recursion detected in policy for relation user_roles" error

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can view active shops" ON shops;
DROP POLICY IF EXISTS "Admins can manage shops" ON shops;

-- Create simple, non-recursive policies

-- For shops: Allow public read access (no role checking needed for viewing shops)
CREATE POLICY "Public can view active shops" ON shops 
FOR SELECT USING (is_active = true);

-- For shops: Allow authenticated users to manage (temporary - you can restrict later)
CREATE POLICY "Authenticated users can manage shops" ON shops 
FOR ALL USING (auth.uid() IS NOT NULL);

-- For user_roles: Allow users to see their own roles only
CREATE POLICY "Users can view own roles" ON user_roles 
FOR SELECT USING (user_id = auth.uid());

-- For user_roles: Allow specific admin emails to manage all roles
CREATE POLICY "Admin emails can manage roles" ON user_roles 
FOR ALL USING (
  auth.jwt() ->> 'email' IN ('adityash8997@gmail.com', '24155598@kiit.ac.in')
);

-- Also ensure shops table allows public reading without role checks
-- This is the most important fix for your current issue
DROP POLICY IF EXISTS "Shop staff can view their shop batches" ON coupon_batches;
CREATE POLICY "Public can view coupon batches" ON coupon_batches 
FOR SELECT USING (true);

-- Fix other policies that might use has_role function
DROP POLICY IF EXISTS "Shop staff can view shop coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can view all coupons" ON coupons;
CREATE POLICY "Users can view coupons" ON coupons 
FOR SELECT USING (generated_by_user_id = auth.uid() OR auth.uid() IS NOT NULL);