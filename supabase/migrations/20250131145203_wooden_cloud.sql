/*
  # Create Storage Bucket for Verifications

  1. Changes
    - Creates storage bucket for verification photos
    - Sets up bucket configuration
    - Enables RLS policies for the bucket
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'Verification Photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the bucket
CREATE POLICY "Give users access to own folder 1ug3kt_0"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'verifications');

CREATE POLICY "Allow authenticated uploads 1ug3kt_0"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verifications');

CREATE POLICY "Allow authenticated deletes 1ug3kt_0"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'verifications');