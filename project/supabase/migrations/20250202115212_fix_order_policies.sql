-- Drop existing policies
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can read available orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own available orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders they've taken" ON orders;
DROP POLICY IF EXISTS "Allow all operations for testing" ON orders;

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
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

CREATE POLICY "Users can delete their own available orders"
ON orders FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()::text AND
  status = 'available'
);
