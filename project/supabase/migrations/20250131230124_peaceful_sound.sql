/*
  # Create orders table

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `client_phone` (text, required)
      - `client_address` (text, required)
      - `vehicle_year` (integer, required)
      - `amount` (decimal, required)
      - `commission` (decimal, required)
      - `comment` (text)
      - `created_at` (timestamptz)
      - `taken_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `created_by` (text, references users.telegram_id)
      - `taken_by` (text, references users.telegram_id)
      - `status` (text, enum: 'available', 'in_progress', 'cancelled', 'completed', 'pending_confirmation')
      - Additional fields from user profile for filtering:
        - `districts` (text[])
        - `specialization` (text[])
        - `passenger_car_brands` (text[])
        - `truck_brands` (text[])
        - `locksmith_services` (text[])
        - `roadside_services` (text[])
        - `special_vehicles` (boolean)
        - `motorcycles` (boolean)

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
*/

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_phone text NOT NULL,
  client_address text NOT NULL,
  vehicle_year integer NOT NULL,
  amount decimal(10,2) NOT NULL,
  commission decimal(10,2) NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  taken_at timestamptz,
  completed_at timestamptz,
  created_by text REFERENCES users(telegram_id),
  taken_by text REFERENCES users(telegram_id),
  status text NOT NULL DEFAULT 'available',
  districts text[],
  specialization text[],
  passenger_car_brands text[],
  truck_brands text[],
  locksmith_services text[],
  roadside_services text[],
  special_vehicles boolean DEFAULT false,
  motorcycles boolean DEFAULT false,
  
  -- Add constraint for status values
  CONSTRAINT valid_status CHECK (status IN (
    'available',
    'in_progress',
    'cancelled',
    'completed',
    'pending_confirmation'
  ))
);

-- Create indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_orders_taken_by ON orders(taken_by);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can read available orders"
ON orders FOR SELECT
TO authenticated
USING (
  status = 'available' OR
  created_by = auth.uid()::text OR
  taken_by = auth.uid()::text
);

CREATE POLICY "Users can update their own orders"
ON orders FOR UPDATE
TO authenticated
USING (created_by = auth.uid()::text)
WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Users can update orders they've taken"
ON orders FOR UPDATE
TO authenticated
USING (taken_by = auth.uid()::text)
WITH CHECK (taken_by = auth.uid()::text);

-- Create function to take an order
CREATE OR REPLACE FUNCTION take_order(order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE orders
  SET 
    status = 'in_progress',
    taken_by = auth.uid()::text,
    taken_at = now()
  WHERE 
    id = order_id AND
    status = 'available';
END;
$$;

-- Create function to complete an order
CREATE OR REPLACE FUNCTION complete_order(order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE orders
  SET 
    status = 'pending_confirmation',
    completed_at = now()
  WHERE 
    id = order_id AND
    status = 'in_progress' AND
    taken_by = auth.uid()::text;
END;
$$;

-- Create function to confirm order completion
CREATE OR REPLACE FUNCTION confirm_order_completion(order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE orders
  SET status = 'completed'
  WHERE 
    id = order_id AND
    status = 'pending_confirmation' AND
    created_by = auth.uid()::text;
END;
$$;

-- Create function to cancel order
CREATE OR REPLACE FUNCTION cancel_order(order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE orders
  SET 
    status = 'cancelled',
    taken_by = NULL,
    taken_at = NULL,
    completed_at = NULL
  WHERE 
    id = order_id AND
    (created_by = auth.uid()::text OR taken_by = auth.uid()::text);
END;
$$;