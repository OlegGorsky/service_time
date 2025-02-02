-- Drop existing policies
DROP POLICY IF EXISTS "Public Read Access for Verifications" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access for Verifications" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access for Verifications" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access for Verifications" ON storage.objects;

-- Create bucket if not exists (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'verifications', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a single policy for all operations
CREATE POLICY "Allow all operations for authenticated users"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'verifications')
WITH CHECK (bucket_id = 'verifications');

-- Create a policy for public read access
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'verifications');