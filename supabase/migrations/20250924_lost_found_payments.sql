-- Create payment_orders table for tracking all payment orders
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL UNIQUE,
  payment_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(50) NOT NULL DEFAULT 'created',
  service_type VARCHAR(100) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lost_found_contact_unlocks table for tracking contact detail unlocks
CREATE TABLE IF NOT EXISTS public.lost_found_contact_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id VARCHAR(255) NOT NULL,
  payer_user_id VARCHAR(255) NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  poster_reward DECIMAL(10,2) NOT NULL,
  payment_id VARCHAR(255) NOT NULL,
  order_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one payment per user per item
  UNIQUE(item_id, payer_user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_service_type ON public.payment_orders(service_type);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_lost_found_unlocks_item_id ON public.lost_found_contact_unlocks(item_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_unlocks_payer ON public.lost_found_contact_unlocks(payer_user_id);

-- Enable Row Level Security
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_contact_unlocks ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_orders
CREATE POLICY "Users can view their own payment orders" 
  ON public.payment_orders FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service can insert payment orders" 
  ON public.payment_orders FOR INSERT 
  WITH CHECK (true); -- Backend service will insert with service role

CREATE POLICY "Service can update payment orders" 
  ON public.payment_orders FOR UPDATE 
  USING (true); -- Backend service will update with service role

-- Create policies for lost_found_contact_unlocks
CREATE POLICY "Users can view their own contact unlocks" 
  ON public.lost_found_contact_unlocks FOR SELECT 
  USING (auth.uid()::text = payer_user_id);

CREATE POLICY "Service can insert contact unlocks" 
  ON public.lost_found_contact_unlocks FOR INSERT 
  WITH CHECK (true); -- Backend service will insert with service role

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_payment_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_payment_orders_updated_at
  BEFORE UPDATE ON public.payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_orders_updated_at();