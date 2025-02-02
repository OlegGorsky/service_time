/*
  # Fix Storage Policies

  1. Changes
    - Drop all existing storage policies
    - Create new simplified policies for verification photos
    - Update bucket configuration
  
  2. Security
    - Enable RLS on storage.objects
    - Add policies for:
      - Public read access
      - Authenticated upload access
      - Authenticated delete access
*/

-- Drop all existing storage policies
DO $$ 
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Ensure the bucket exists with correct configuration
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

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'verifications');

CREATE POLICY "Authenticated upload access"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verifications');

CREATE POLICY "Authenticated delete access"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'verifications');