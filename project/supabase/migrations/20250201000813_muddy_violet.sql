-- Drop existing policies
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can read available orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders they've taken" ON orders;

-- Create a single permissive policy for testing
CREATE POLICY "Allow all operations for testing"
ON orders
FOR ALL
USING (true)
WITH CHECK (true);