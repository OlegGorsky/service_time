/*
  # Fix storage policies for verifications

  1. Changes
    - Drop existing policies
    - Create verifications bucket with proper settings
    - Set up new policies for storage access
  
  2. Security
    - Enable RLS on storage.objects
    - Allow public read access for verification photos
    - Allow authenticated users to upload/update/delete
    - Limit file types to images
    - Set 5MB file size limit
*/

-- Drop existing policies using a safer approach
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON storage.objects;', E'\n')
    FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects'
  );
EXCEPTION WHEN OTHERS THEN
  -- If any error occurs, continue with the migration
  NULL;
END $$;

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

-- Create new policies with unique names
CREATE POLICY "verification_photos_read_policy"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'verifications');

CREATE POLICY "verification_photos_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verifications' AND
  (LOWER(storage.extension(name)) = 'jpg' OR 
   LOWER(storage.extension(name)) = 'jpeg' OR 
   LOWER(storage.extension(name)) = 'png')
);

CREATE POLICY "verification_photos_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'verifications')
WITH CHECK (bucket_id = 'verifications');

CREATE POLICY "verification_photos_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'verifications');