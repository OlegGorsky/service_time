/*
  # Add locksmith services to users table

  1. Changes
    - Add `locksmith_services` array column to store selected locksmith services
    - Add `locksmith_services_enabled` boolean column to indicate if user provides locksmith services
    - Rename existing `locksmith_services` boolean column to avoid conflicts

  2. Notes
    - Uses array type for storing multiple service selections
    - Adds default values for new columns
*/

DO $$ 
BEGIN
  -- Rename existing locksmith_services boolean column to locksmith_services_enabled
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'locksmith_services'
  ) THEN
    ALTER TABLE users RENAME COLUMN locksmith_services TO locksmith_services_enabled;
  END IF;

  -- Add locksmith_services array column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'locksmith_services'
  ) THEN
    ALTER TABLE users ADD COLUMN locksmith_services text[] DEFAULT '{}';
  END IF;

  -- Add locksmith_services_enabled if it doesn't exist (in case the rename didn't happen)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'locksmith_services_enabled'
  ) THEN
    ALTER TABLE users ADD COLUMN locksmith_services_enabled boolean DEFAULT false;
  END IF;
END $$;