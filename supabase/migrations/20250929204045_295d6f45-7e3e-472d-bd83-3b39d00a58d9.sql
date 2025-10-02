-- Create profiles enhancements for resale
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating_avg NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Listings table
CREATE TABLE IF NOT EXISTS resale_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'used')),
  campus INTEGER CHECK (campus BETWEEN 1 AND 25),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_exchange BOOLEAN DEFAULT false,
  exchange_with JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'sold', 'removed', 'rejected')),
  pickup_option TEXT NOT NULL CHECK (pickup_option IN ('pickup', 'delivery', 'both')),
  delivery_fee NUMERIC DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resale_listings_seller ON resale_listings(seller_id);
CREATE INDEX idx_resale_listings_category ON resale_listings(category);
CREATE INDEX idx_resale_listings_status ON resale_listings(status);
CREATE INDEX idx_resale_listings_created ON resale_listings(created_at DESC);

-- Listing images
CREATE TABLE IF NOT EXISTS resale_listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES resale_listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resale_images_listing ON resale_listing_images(listing_id);

-- Conversations
CREATE TABLE IF NOT EXISTS resale_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES resale_listings(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(listing_id, buyer_id, seller_id)
);

CREATE INDEX idx_resale_conversations_buyer ON resale_conversations(buyer_id);
CREATE INDEX idx_resale_conversations_seller ON resale_conversations(seller_id);

-- Messages
CREATE TABLE IF NOT EXISTS resale_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES resale_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  attachments JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resale_messages_conversation ON resale_messages(conversation_id);
CREATE INDEX idx_resale_messages_created ON resale_messages(created_at DESC);

-- Transactions
CREATE TABLE IF NOT EXISTS resale_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES resale_listings(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'delivered', 'completed', 'refunded', 'disputed')),
  payment_method TEXT CHECK (payment_method IN ('online', 'cash')),
  escrow_status TEXT CHECK (escrow_status IN ('held', 'released', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resale_transactions_buyer ON resale_transactions(buyer_id);
CREATE INDEX idx_resale_transactions_seller ON resale_transactions(seller_id);
CREATE INDEX idx_resale_transactions_status ON resale_transactions(status);

-- Transaction events (audit trail)
CREATE TABLE IF NOT EXISTS resale_transaction_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES resale_transactions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resale_transaction_events_transaction ON resale_transaction_events(transaction_id);

-- Reports
CREATE TABLE IF NOT EXISTS resale_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'user', 'message')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resale_reports_status ON resale_reports(status);
CREATE INDEX idx_resale_reports_target ON resale_reports(target_type, target_id);

-- Reviews
CREATE TABLE IF NOT EXISTS resale_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES resale_transactions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(transaction_id, reviewer_id)
);

CREATE INDEX idx_resale_reviews_reviewee ON resale_reviews(reviewee_id);

-- Favourites
CREATE TABLE IF NOT EXISTS resale_favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES resale_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_resale_favourites_user ON resale_favourites(user_id);

-- Exchange requests
CREATE TABLE IF NOT EXISTS resale_exchange_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requester_listing_id UUID NOT NULL REFERENCES resale_listings(id) ON DELETE CASCADE,
  target_listing_id UUID NOT NULL REFERENCES resale_listings(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resale_exchange_target ON resale_exchange_requests(target_listing_id);

-- Admin actions for resale
CREATE TABLE IF NOT EXISTS resale_admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resale_admin_actions_admin ON resale_admin_actions(admin_id);
CREATE INDEX idx_resale_admin_actions_created ON resale_admin_actions(created_at DESC);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('resale-private', 'resale-private', false),
  ('resale-public', 'resale-public', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies

-- Listings: verified users can insert, anyone can view active listings
ALTER TABLE resale_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified users can create listings"
  ON resale_listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email ILIKE '%@kiit.ac.in'
    )
  );

CREATE POLICY "Anyone can view active listings"
  ON resale_listings FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Sellers and admins can update listings"
  ON resale_listings FOR UPDATE
  USING (seller_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Sellers and admins can delete listings"
  ON resale_listings FOR DELETE
  USING (seller_id = auth.uid() OR get_current_user_role() = 'admin');

-- Listing images
ALTER TABLE resale_listing_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their listing images"
  ON resale_listing_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM resale_listings 
      WHERE resale_listings.id = listing_id 
      AND resale_listings.seller_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view listing images"
  ON resale_listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM resale_listings 
      WHERE resale_listings.id = listing_id 
      AND resale_listings.status = 'active'
    )
  );

-- Conversations
ALTER TABLE resale_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified users can create conversations"
  ON resale_conversations FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email ILIKE '%@kiit.ac.in'
    )
  );

CREATE POLICY "Participants can view conversations"
  ON resale_conversations FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Participants can update conversations"
  ON resale_conversations FOR UPDATE
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Messages
ALTER TABLE resale_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can send messages"
  ON resale_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resale_conversations 
      WHERE resale_conversations.id = conversation_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    ) AND sender_id = auth.uid()
  );

CREATE POLICY "Conversation participants can view messages"
  ON resale_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM resale_conversations 
      WHERE resale_conversations.id = conversation_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can mark their messages as read"
  ON resale_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM resale_conversations 
      WHERE resale_conversations.id = conversation_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- Transactions
ALTER TABLE resale_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their transactions"
  ON resale_transactions FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Participants can update their transactions"
  ON resale_transactions FOR UPDATE
  USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR get_current_user_role() = 'admin');

-- Reports
ALTER TABLE resale_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified users can create reports"
  ON resale_reports FOR INSERT
  WITH CHECK (
    auth.uid() = reporter_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email ILIKE '%@kiit.ac.in'
    )
  );

CREATE POLICY "Users can view their own reports"
  ON resale_reports FOR SELECT
  USING (reporter_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "Admins can update reports"
  ON resale_reports FOR UPDATE
  USING (get_current_user_role() = 'admin');

-- Reviews
ALTER TABLE resale_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transaction participants can create reviews"
  ON resale_reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM resale_transactions 
      WHERE resale_transactions.id = transaction_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
      AND status = 'completed'
    )
  );

CREATE POLICY "Anyone can view reviews"
  ON resale_reviews FOR SELECT
  USING (true);

-- Favourites
ALTER TABLE resale_favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their favourites"
  ON resale_favourites FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Exchange requests
ALTER TABLE resale_exchange_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create exchange requests"
  ON resale_exchange_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Participants can view exchange requests"
  ON resale_exchange_requests FOR SELECT
  USING (
    requester_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM resale_listings 
      WHERE resale_listings.id = target_listing_id 
      AND seller_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update exchange requests"
  ON resale_exchange_requests FOR UPDATE
  USING (
    requester_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM resale_listings 
      WHERE resale_listings.id = target_listing_id 
      AND seller_id = auth.uid()
    )
  );

-- Admin actions
ALTER TABLE resale_admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin actions"
  ON resale_admin_actions FOR ALL
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- Storage policies for resale buckets
CREATE POLICY "Authenticated users can upload to private bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resale-private' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view their own private files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resale-private' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can manage private files"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'resale-private' AND
    get_current_user_role() = 'admin'
  );

CREATE POLICY "Anyone can view public resale files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resale-public');

CREATE POLICY "Authenticated users can upload to public bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resale-public' AND
    auth.role() = 'authenticated'
  );

-- Function to update listing updated_at
CREATE OR REPLACE FUNCTION update_resale_listing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resale_listings_updated_at
  BEFORE UPDATE ON resale_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_resale_listing_updated_at();

-- Function to update transaction updated_at
CREATE OR REPLACE FUNCTION update_resale_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resale_transactions_updated_at
  BEFORE UPDATE ON resale_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_resale_transaction_updated_at();

-- Function to update seller rating after review
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET rating_avg = (
    SELECT AVG(rating)::NUMERIC(3,2)
    FROM resale_reviews
    WHERE reviewee_id = NEW.reviewee_id
  )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seller_rating_trigger
  AFTER INSERT ON resale_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_rating();