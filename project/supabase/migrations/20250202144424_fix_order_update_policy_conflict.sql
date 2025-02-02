-- Drop existing update policies
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders they've taken" ON orders;
DROP POLICY IF EXISTS "Users can cancel their own orders" ON orders;

-- Create a single comprehensive update policy
CREATE POLICY "Users can manage their orders"
ON orders FOR UPDATE
TO authenticated
USING (
  (
    -- Can update their own available orders
    (created_by = auth.uid()::text AND status = 'available') OR
    -- Can update orders they've taken that are in progress
    (taken_by = auth.uid()::text AND status = 'in_progress')
  )
)
WITH CHECK (
  (
    -- Allow updating own available orders while keeping them available
    (created_by = auth.uid()::text AND status = 'available') OR
    -- Allow cancelling own available orders
    (created_by = auth.uid()::text AND status = 'cancelled') OR
    -- Allow updating orders in progress
    (taken_by = auth.uid()::text AND status IN ('in_progress', 'completed'))
  )
);
