-- Create food_orders table for food and micro-essential items
CREATE TABLE public.food_orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  special_notes TEXT,
  items JSONB NOT NULL,
  total_mrp NUMERIC(10,2) NOT NULL,
  delivery_charge_percent NUMERIC(5,2) NOT NULL DEFAULT 10,
  total_payable NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  customer_id UUID REFERENCES auth.users(id),
  helper_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;

-- Customers can create their own orders
CREATE POLICY "Customers can create their own food orders"
ON public.food_orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);

-- Customers can view their own orders
CREATE POLICY "Customers can view their own food orders"
ON public.food_orders
FOR SELECT
TO authenticated
USING (auth.uid() = customer_id);

-- Helpers can view all pending orders
CREATE POLICY "Helpers can view pending food orders"
ON public.food_orders
FOR SELECT
TO authenticated
USING (
  status = 'pending' OR 
  auth.uid() = helper_id OR 
  auth.uid() = customer_id OR
  get_current_user_role() = 'helper'
);

-- Helpers can accept orders (update to accepted status and assign themselves)
CREATE POLICY "Helpers can accept food orders"
ON public.food_orders
FOR UPDATE
TO authenticated
USING (
  status = 'pending' AND 
  (get_current_user_role() = 'helper' OR get_current_user_role() = 'admin')
)
WITH CHECK (
  status IN ('accepted', 'delivered') AND 
  helper_id = auth.uid()
);

-- Helpers can update status of their accepted orders
CREATE POLICY "Helpers can update their accepted food orders"
ON public.food_orders
FOR UPDATE
TO authenticated
USING (auth.uid() = helper_id)
WITH CHECK (auth.uid() = helper_id);

-- Add trigger for updated_at
CREATE TRIGGER update_food_orders_updated_at
  BEFORE UPDATE ON public.food_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();