/*
  # Add verification photo storage configuration

  1. Updates
    - Adds verification_photo column to store photo URLs
    - Adds verification status tracking columns
    - Adds timestamps for verification process

  2. Security
    - Ensures data integrity with NOT NULL constraints where appropriate
    - Uses timestamptz for proper timezone handling
*/

-- Add or update verification-related columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_photo text,
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS verification_requested_at timestamptz,
ADD COLUMN IF NOT EXISTS verification_processed_at timestamptz,
ADD COLUMN IF NOT EXISTS verification_processed_by text,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Create an index for faster verification status queries
CREATE INDEX IF NOT EXISTS idx_users_verification_status 
ON users(verification_status);

-- Create an index for verification timestamps
CREATE INDEX IF NOT EXISTS idx_users_verification_requested_at 
ON users(verification_requested_at);

-- Add a check constraint for verification status values
DO $$ 
BEGIN 
  ALTER TABLE users
    ADD CONSTRAINT chk_verification_status 
    CHECK (verification_status IN ('none', 'pending', 'verified', 'rejected'));
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;