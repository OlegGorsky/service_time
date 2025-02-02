-- Drop existing update policies
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders they've taken" ON orders;

-- Create new update policies
CREATE POLICY "Users can update their own orders"
ON orders FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()::text AND
  status = 'available'
)
WITH CHECK (
  created_by = auth.uid()::text AND
  status = 'available'
);

CREATE POLICY "Users can update orders they've taken"
ON orders FOR UPDATE
TO authenticated
USING (
  taken_by = auth.uid()::text AND
  status = 'in_progress'
)
WITH CHECK (
  taken_by = auth.uid()::text AND
  status = 'in_progress'
);

-- Add policy for cancelling orders
CREATE POLICY "Users can cancel their own orders"
ON orders FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()::text AND
  status = 'available'
)
WITH CHECK (
  created_by = auth.uid()::text AND
  status = 'cancelled'
);
