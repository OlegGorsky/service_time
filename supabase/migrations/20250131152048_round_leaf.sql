/*
  # Complete Access Policies

  1. Changes
    - Set up comprehensive RLS policies for users table
    - Set up comprehensive RLS policies for storage
    - Add proper indexes for performance
  
  2. Security
    - Enable RLS on all tables
    - Restrict access based on user authentication
    - Ensure proper data isolation
*/

-- Users Table Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins have full access" ON users;

-- Create new policies for users table
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid()::text = telegram_id);

CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid()::text = telegram_id)
WITH CHECK (auth.uid()::text = telegram_id);

CREATE POLICY "Users can insert own data"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = telegram_id);

-- Storage Policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies using a safer approach
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON storage.objects;', E'\n')
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects'
  );
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Ensure verifications bucket exists with proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verifications',
  'verifications',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png'];

-- Create comprehensive storage policies
CREATE POLICY "Public read access for verification photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'verifications');

CREATE POLICY "Authenticated users can upload verification photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verifications' AND
  (LOWER(storage.extension(name)) = 'jpg' OR 
   LOWER(storage.extension(name)) = 'jpeg' OR 
   LOWER(storage.extension(name)) = 'png') AND
  -- Ensure users can only upload to their own directory
  (SPLIT_PART(name, '/', 2) = auth.uid()::text)
);

CREATE POLICY "Authenticated users can update own verification photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verifications' AND
  (SPLIT_PART(name, '/', 2) = auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'verifications' AND
  (SPLIT_PART(name, '/', 2) = auth.uid()::text)
);

CREATE POLICY "Authenticated users can delete own verification photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'verifications' AND
  (SPLIT_PART(name, '/', 2) = auth.uid()::text)
);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_storage_bucket_name ON storage.objects(bucket_id, name);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();