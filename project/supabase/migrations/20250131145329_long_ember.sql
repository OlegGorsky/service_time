/*
  # Storage Setup for Verification Photos

  1. Changes
    - Create verifications bucket
    - Enable RLS on storage.objects
    - Set up proper access policies
    
  2. Security
    - Allow public read access for verification photos
    - Restrict uploads to authenticated users
    - Allow users to delete their own files
    - Restrict file types to images
*/

-- Create the verifications bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'Verification Photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Give users access to own folder 1ug3kt_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads 1ug3kt_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes 1ug3kt_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;

-- Create new policies
-- Allow public read access for verification photos
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'verifications');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'verifications' AND
    (LOWER(storage.extension(name)) = 'jpg' OR 
     LOWER(storage.extension(name)) = 'jpeg' OR 
     LOWER(storage.extension(name)) = 'png')
);

-- Allow users to delete their own uploads
CREATE POLICY "Owner Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'verifications' AND
    auth.uid()::text = SPLIT_PART(name, '/', 2)
);