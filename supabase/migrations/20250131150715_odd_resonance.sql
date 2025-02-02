-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;

-- Create bucket if not exists (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'verifications', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new policies with simplified rules
CREATE POLICY "Public Read Access for Verifications"
ON storage.objects FOR SELECT
USING (bucket_id = 'verifications');

CREATE POLICY "Authenticated Upload Access for Verifications"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'verifications');

-- Add update policy
CREATE POLICY "Authenticated Update Access for Verifications"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'verifications');

-- Add delete policy
CREATE POLICY "Authenticated Delete Access for Verifications"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'verifications');