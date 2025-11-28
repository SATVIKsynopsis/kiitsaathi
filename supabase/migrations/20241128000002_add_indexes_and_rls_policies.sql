-- Migration: Add indexes and RLS policies for Food Stalls System
-- Created: 2024-11-28
-- Description: Performance indexes and Row Level Security policies

-- Create indexes for better performance
CREATE INDEX idx_shops_active ON shops(is_active);
CREATE INDEX idx_shops_featured ON shops(featured);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_user ON coupons(generated_by_user_id);
CREATE INDEX idx_coupons_shop ON coupons(shop_id);
CREATE INDEX idx_coupon_batches_active ON coupon_batches(is_active);
CREATE INDEX idx_shop_views_shop ON shop_views(shop_id);
CREATE INDEX idx_shop_views_type ON shop_views(view_type);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Enable Row Level Security (RLS)
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopkeeper_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shops (public read, admin write)
CREATE POLICY "Anyone can view active shops" ON shops FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage shops" ON shops FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for coupon_batches (shop staff and admins)
CREATE POLICY "Shop staff can view their shop batches" ON coupon_batches FOR SELECT USING (
    EXISTS (SELECT 1 FROM shop_staff WHERE user_id = auth.uid() AND shop_id = coupon_batches.shop_id)
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage coupon batches" ON coupon_batches FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for coupons (users can see their own, staff can see shop coupons)
CREATE POLICY "Users can view their own coupons" ON coupons FOR SELECT USING (
    generated_by_user_id = auth.uid()
);
CREATE POLICY "Shop staff can view shop coupons" ON coupons FOR SELECT USING (
    EXISTS (SELECT 1 FROM shop_staff WHERE user_id = auth.uid() AND shop_id = coupons.shop_id)
);
CREATE POLICY "Admins can view all coupons" ON coupons FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authenticated users can generate coupons" ON coupons FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND generated_by_user_id = auth.uid()
);
CREATE POLICY "Staff can update coupon status" ON coupons FOR UPDATE USING (
    EXISTS (SELECT 1 FROM shop_staff WHERE user_id = auth.uid() AND shop_id = coupons.shop_id)
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for redemptions (staff and admins)
CREATE POLICY "Shop staff can view their shop redemptions" ON redemptions FOR SELECT USING (
    EXISTS (SELECT 1 FROM shop_staff WHERE user_id = auth.uid() AND shop_id = redemptions.shop_id)
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Shop staff can create redemptions" ON redemptions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM shop_staff WHERE user_id = auth.uid() AND shop_id = redemptions.shop_id)
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for shop_staff (admins manage, users can view their own)
CREATE POLICY "Users can view their own shop assignments" ON shop_staff FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage shop staff" ON shop_staff FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for shopkeeper_emails (admins only)
CREATE POLICY "Admins can manage shopkeeper emails" ON shopkeeper_emails FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for shop_views (anyone can insert, limited read)
CREATE POLICY "Anyone can track shop views" ON shop_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Shop staff can view their shop analytics" ON shop_views FOR SELECT USING (
    EXISTS (SELECT 1 FROM shop_staff WHERE user_id = auth.uid() AND shop_id = shop_views.shop_id)
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for flagged_attempts (staff and admins)
CREATE POLICY "Staff can view flagged attempts" ON flagged_attempts FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'shopkeeper'))
);
CREATE POLICY "Staff can create flagged attempts" ON flagged_attempts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'shopkeeper'))
);

-- RLS Policies for user_roles (admins manage, users can view their own)
CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON user_roles FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);