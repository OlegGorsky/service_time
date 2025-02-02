/*
  # Add payment methods to users table

  1. New Fields
    - `card_number` (text) - Card number for card payments
    - `card_bank` (text) - Bank name for card
    - `sbp_phone` (text) - Phone number for SBP payments
    - `sbp_bank` (text) - Bank name for SBP
*/

ALTER TABLE users
ADD COLUMN IF NOT EXISTS card_number text,
ADD COLUMN IF NOT EXISTS card_bank text,
ADD COLUMN IF NOT EXISTS sbp_phone text,
ADD COLUMN IF NOT EXISTS sbp_bank text;