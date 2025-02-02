/*
  # Fix storage permissions for verifications

  1. Changes
    - Drop all existing storage policies
    - Create new simplified policies for the verifications bucket
    - Enable public access to the bucket
    - Allow authenticated users full access to the bucket
  
  2. Security
    - Public read access for verification photos
    - Authenticated users can upload/update/delete files
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'verifications', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a policy for full access for authenticated users
CREATE POLICY "Full access for authenticated users"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'verifications')
WITH CHECK (bucket_id = 'verifications');

-- Create a policy for public read access
CREATE POLICY "Public read access for verifications"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'verifications');