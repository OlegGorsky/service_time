/*
  # Create users table for Telegram WebApp users

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `telegram_id` (text, unique) - Telegram user ID
      - `username` (text, nullable) - Telegram username
      - `first_name` (text) - User's first name
      - `photo_url` (text, nullable) - URL to user's Telegram avatar
      - `created_at` (timestamptz) - Registration date

  2. Security
    - Enable RLS on `users` table
    - Add policy for full access (temporary, will be restricted later)
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text UNIQUE NOT NULL,
  username text,
  first_name text NOT NULL,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Full access to users'
  ) THEN
    CREATE POLICY "Full access to users"
      ON users
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;