-- Drop existing policies
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete Access" ON storage.objects;

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'verifications', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new policies with more permissive rules for testing
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'verifications');

CREATE POLICY "Allow authenticated insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'verifications');

CREATE POLICY "Allow authenticated update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'verifications');

CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'verifications');