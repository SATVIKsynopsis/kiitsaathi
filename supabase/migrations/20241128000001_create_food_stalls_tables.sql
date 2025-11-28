-- Migration: Create Food Stalls & Restaurants System Tables
-- Created: 2024-11-28
-- Description: Complete database schema for KIIT Food Stalls & Restaurants feature

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Shops table - Core food shops/restaurants
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    short_desc TEXT,
    full_desc TEXT,
    address TEXT,
    contact_number TEXT,
    photos TEXT[], -- Array of image URLs
    tags TEXT[], -- Array of tags like 'vegetarian', 'fast-food', 'canteen'
    lat DECIMAL(10, 8), -- Latitude for map
    lng DECIMAL(11, 8), -- Longitude for map
    delivery_timings JSONB, -- Store opening hours in JSON format
    featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Coupon Batches table - Manages coupon campaigns
CREATE TABLE coupon_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    batch_name TEXT NOT NULL,
    amount_per_coupon DECIMAL(10, 2) NOT NULL,
    expires_in_days INTEGER DEFAULT 7,
    daily_limit INTEGER, -- Max coupons per day
    per_user_limit INTEGER, -- Max coupons per user
    start_time TIME, -- Valid hours start
    end_time TIME, -- Valid hours end
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Coupons table - Individual generated coupons
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES coupon_batches(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    discount_value DECIMAL(10, 2) NOT NULL,
    generated_by_user_id UUID NOT NULL REFERENCES auth.users(id),
    qr_payload TEXT NOT NULL, -- QR code data
    status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'redeemed', 'expired', 'revoked', 'flagged')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    redeemed_by_staff_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Redemptions table - Track successful redemptions
CREATE TABLE redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES auth.users(id),
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    location TEXT, -- Optional location where redeemed
    notes TEXT, -- Optional notes from staff
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Shop Staff table - Links shopkeepers to their shops
CREATE TABLE shop_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'shopkeeper' CHECK (role IN ('shopkeeper', 'manager')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, shop_id)
);

-- 6. Shopkeeper Emails table - Pre-approved shopkeeper emails
CREATE TABLE shopkeeper_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    assigned BOOLEAN DEFAULT false, -- True when user signs up with this email
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Shop Views table - Analytics tracking
CREATE TABLE shop_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- Null for anonymous views
    view_type TEXT NOT NULL CHECK (view_type IN ('card_click', 'page_view')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Flagged Attempts table - Security tracking
CREATE TABLE flagged_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_code TEXT NOT NULL,
    reason TEXT NOT NULL,
    attempted_by UUID REFERENCES auth.users(id),
    shop_id UUID REFERENCES shops(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. User Roles table - Role-based access control
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'shopkeeper', 'customer')),
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);