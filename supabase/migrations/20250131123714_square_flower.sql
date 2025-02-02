/*
  # Add missing columns to users table

  1. Changes
    - Add roadside_services array column for storing roadside assistance services
    - Add updated_at timestamp column for tracking record updates
    - Add specialization array column to replace existing text column
    - Add truck_brands array column if not exists

  2. Notes
    - Uses safe migrations with IF NOT EXISTS checks
    - Preserves existing data
*/

DO $$ 
BEGIN
  -- Add roadside_services column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'roadside_services'
  ) THEN
    ALTER TABLE users ADD COLUMN roadside_services text[] DEFAULT '{}';
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  -- Convert specialization from text to text[] if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'specialization' AND data_type = 'text'
  ) THEN
    ALTER TABLE users 
    ALTER COLUMN specialization TYPE text[] USING 
      CASE 
        WHEN specialization IS NULL THEN '{}'::text[]
        ELSE ARRAY[specialization]
      END;
  END IF;

  -- Add truck_brands if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'truck_brands'
  ) THEN
    ALTER TABLE users ADD COLUMN truck_brands text[] DEFAULT '{}';
  END IF;
END $$;