/*
  # Add verification fields to users table

  1. Changes
    - Add verification status fields
    - Add verification photo URL
    - Add verification timestamps
    - Add verification admin fields
*/

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS verification_photo text,
ADD COLUMN IF NOT EXISTS verification_requested_at timestamptz,
ADD COLUMN IF NOT EXISTS verification_processed_at timestamptz,
ADD COLUMN IF NOT EXISTS verification_processed_by text;