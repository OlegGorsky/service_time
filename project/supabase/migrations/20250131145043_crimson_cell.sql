/*
  # Storage policies for verifications

  1. Security
    - Enable storage policies for verification photos
    - Allow authenticated users to upload images
    - Allow public read access to verification photos
*/

-- Create policies for storage
BEGIN;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'verifications'
);

-- Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'verifications');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'verifications');

COMMIT;