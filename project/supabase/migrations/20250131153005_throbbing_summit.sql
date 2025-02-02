/*
  # Fix Storage Policies

  1. Changes
    - Drop all existing storage policies
    - Create simplified policies for verification photos
    - Enable public read access
    - Allow authenticated users to upload files
  
  2. Security
    - Maintain RLS
    - Allow public read access for verification photos
    - Restrict uploads to authenticated users only
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
INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'verifications', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Allow all operations"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'verifications')
WITH CHECK (bucket_id = 'verifications');

CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'verifications');