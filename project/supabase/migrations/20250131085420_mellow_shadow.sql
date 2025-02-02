/*
  # Add profile fields to users table

  1. Changes to users table:
    - Add phone (text)
    - Add districts (text[]) - Array of districts in St. Petersburg
    - Add specialization (text)
    - Add vehicle categories and services:
      - passenger_cars (boolean)
      - trucks (boolean)
      - special_vehicles (boolean)
      - motorcycles (boolean)
      - locksmith_services (boolean)
      - roadside_assistance (boolean)
*/

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS districts text[],
ADD COLUMN IF NOT EXISTS specialization text,
ADD COLUMN IF NOT EXISTS passenger_cars boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trucks boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS special_vehicles boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS motorcycles boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS locksmith_services boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS roadside_assistance boolean DEFAULT false;