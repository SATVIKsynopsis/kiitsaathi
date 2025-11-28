-- Migration: Add helper functions for Food Stalls System
-- Created: 2024-11-28
-- Description: Utility functions and triggers

-- Function to check user roles
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = _user_id AND role = _role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get shop average rating (placeholder - you'll need a reviews table later)
CREATE OR REPLACE FUNCTION get_shop_avg_rating(shop_uuid UUID)
RETURNS DECIMAL AS $$
BEGIN
    -- Placeholder function - returns 0 for now
    -- You can implement this when you add a reviews system
    RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get shop review count (placeholder)
CREATE OR REPLACE FUNCTION get_shop_review_count(shop_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    -- Placeholder function - returns 0 for now
    -- You can implement this when you add a reviews system
    RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique coupon code
CREATE OR REPLACE FUNCTION generate_coupon_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
BEGIN
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM coupons WHERE code = code) LOOP
        code := upper(substring(md5(random()::text) from 1 for 8));
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically expire old coupons
CREATE OR REPLACE FUNCTION expire_old_coupons()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE coupons 
    SET status = 'expired' 
    WHERE status = 'generated' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically assign shopkeeper role when email matches
CREATE OR REPLACE FUNCTION auto_assign_shopkeeper()
RETURNS TRIGGER AS $$
DECLARE
    shopkeeper_record RECORD;
BEGIN
    -- Check if the new user's email is in shopkeeper_emails
    SELECT * INTO shopkeeper_record 
    FROM shopkeeper_emails 
    WHERE email = NEW.email AND assigned = false;
    
    IF FOUND THEN
        -- Add shopkeeper role
        INSERT INTO user_roles (user_id, role) 
        VALUES (NEW.id, 'shopkeeper')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Assign to shop if shop_id exists
        IF shopkeeper_record.shop_id IS NOT NULL THEN
            INSERT INTO shop_staff (user_id, shop_id, assigned_by) 
            VALUES (NEW.id, shopkeeper_record.shop_id, shopkeeper_record.added_by)
            ON CONFLICT (user_id, shop_id) DO NOTHING;
        END IF;
        
        -- Mark email as assigned
        UPDATE shopkeeper_emails 
        SET assigned = true 
        WHERE email = NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_shops_updated_at
    BEFORE UPDATE ON shops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupon_batches_updated_at
    BEFORE UPDATE ON coupon_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: The auth.users trigger needs to be created manually in Supabase
-- because direct access to auth schema might be restricted
-- You can create this trigger in the Supabase Dashboard SQL Editor:
/*
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION auto_assign_shopkeeper();
*/