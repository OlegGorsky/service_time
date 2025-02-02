/*
  # Add Admin Permissions

  1. Changes
    - Add role column to users table
    - Add admin-specific policies
    - Add admin verification capabilities
  
  2. Security
    - Enable RLS
    - Add policies for admin access
    - Maintain existing user policies
*/

-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'::text;

-- Add check constraint for valid roles
DO $$ 
BEGIN 
  ALTER TABLE users
    ADD CONSTRAINT chk_valid_role 
    CHECK (role IN ('user', 'admin', 'superadmin'));
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Create index for role column
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  DROP POLICY IF EXISTS "Users can update own data" ON users;
  DROP POLICY IF EXISTS "Users can insert own data" ON users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new policies for users table
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
USING (
  auth.uid()::text = telegram_id 
  OR 
  auth.jwt()->>'role' IN ('admin', 'superadmin')
);

CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
USING (
  auth.uid()::text = telegram_id 
  OR 
  auth.jwt()->>'role' IN ('admin', 'superadmin')
)
WITH CHECK (
  auth.uid()::text = telegram_id 
  OR 
  auth.jwt()->>'role' IN ('admin', 'superadmin')
);

CREATE POLICY "Users can insert own data"
ON users
FOR INSERT
WITH CHECK (
  auth.uid()::text = telegram_id 
  OR 
  auth.jwt()->>'role' IN ('admin', 'superadmin')
);

-- Create admin-specific policies for storage
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow all operations" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new storage policies
CREATE POLICY "Admin full access"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'verifications' 
  AND 
  (
    auth.jwt()->>'role' IN ('admin', 'superadmin')
    OR
    (SPLIT_PART(name, '/', 2) = auth.uid()::text)
  )
)
WITH CHECK (
  bucket_id = 'verifications'
  AND 
  (
    auth.jwt()->>'role' IN ('admin', 'superadmin')
    OR
    (SPLIT_PART(name, '/', 2) = auth.uid()::text)
  )
);

CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'verifications');

-- Create function to promote user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_telegram_id text, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT (SELECT auth.jwt()->>'role' = 'superadmin') THEN
    RAISE EXCEPTION 'Only superadmin can promote users';
  END IF;

  IF new_role NOT IN ('admin', 'user') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  UPDATE users 
  SET role = new_role 
  WHERE telegram_id = user_telegram_id;
END;
$$;

-- Create function to verify user
CREATE OR REPLACE FUNCTION verify_user(user_telegram_id text, approve boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT (SELECT auth.jwt()->>'role' IN ('admin', 'superadmin')) THEN
    RAISE EXCEPTION 'Only admins can verify users';
  END IF;

  UPDATE users 
  SET 
    is_verified = approve,
    verification_status = CASE WHEN approve THEN 'verified' ELSE 'rejected' END,
    verification_processed_at = now(),
    verification_processed_by = auth.uid()::text
  WHERE telegram_id = user_telegram_id;
END;
$$;