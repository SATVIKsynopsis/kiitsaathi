-- Fix search_path for resale trigger functions to address security warnings

DROP FUNCTION IF EXISTS update_resale_listing_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_resale_listing_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER resale_listings_updated_at
  BEFORE UPDATE ON resale_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_resale_listing_updated_at();

DROP FUNCTION IF EXISTS update_resale_transaction_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_resale_transaction_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER resale_transactions_updated_at
  BEFORE UPDATE ON resale_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_resale_transaction_updated_at();

DROP FUNCTION IF EXISTS update_seller_rating() CASCADE;
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE TRIGGER update_seller_rating_trigger
  AFTER INSERT ON resale_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_rating();