/*
  # Add passenger car brands field

  1. Changes
    - Add `passenger_car_brands` array field to users table to store selected car brands
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'passenger_car_brands'
  ) THEN
    ALTER TABLE users ADD COLUMN passenger_car_brands text[] DEFAULT '{}';
  END IF;
END $$;