-- Add location and instagram_url to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT;
