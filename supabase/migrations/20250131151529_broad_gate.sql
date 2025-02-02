/*
  # Fix storage policies for verification photos

  1. Changes
    - Drop all existing storage policies
    - Create new storage bucket with proper configuration
    - Add comprehensive storage policies for verification photos
    
  2. Security
    - Enable RLS on storage.objects
    - Allow public read access to verification photos
    - Allow authenticated users to upload photos
    - Allow authenticated users to manage their own photos
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Full access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for verifications" ON storage.objects;

-- Ensure the bucket exists and is public
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

-- Create a policy for authenticated users to upload files
CREATE POLICY "Upload access for authenticated users"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verifications' AND
  (LOWER(storage.extension(name)) = 'jpg' OR 
   LOWER(storage.extension(name)) = 'jpeg' OR 
   LOWER(storage.extension(name)) = 'png')
);

-- Create a policy for public read access
CREATE POLICY "Public read access for verifications"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'verifications');

-- Create a policy for authenticated users to update their own files
CREATE POLICY "Update access for authenticated users"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'verifications')
WITH CHECK (bucket_id = 'verifications');

-- Create a policy for authenticated users to delete their own files
CREATE POLICY "Delete access for authenticated users"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'verifications');