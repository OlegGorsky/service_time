/*
  # Update RLS policies for users table

  1. Security Changes
    - Drop existing RLS policies
    - Create new policy for full access to users table
    - Enable RLS on users table
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop all policies on users table
  DROP POLICY IF EXISTS "Full access to users" ON users;
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  DROP POLICY IF EXISTS "Users can update own data" ON users;
END $$;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policy for full access
CREATE POLICY "Full access to users"
  ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);