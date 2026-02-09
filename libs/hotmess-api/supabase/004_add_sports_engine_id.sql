-- Add Sports Engine ID to profiles table for OAuth integration
-- Run this in Supabase SQL Editor

-- Add sports_engine_id column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS sports_engine_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_sports_engine_id
ON profiles(sports_engine_id);

-- Update RLS policy to allow profile creation without auth
-- (needed for OAuth flow where we create profile before Supabase auth)
DROP POLICY IF EXISTS "Profiles can be created by anyone" ON profiles;
CREATE POLICY "Profiles can be created by anyone"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Update RLS policy for profile updates
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (
    sports_engine_id IS NOT NULL
    OR auth.uid() = id
  );

-- Allow reading profiles by sports_engine_id
DROP POLICY IF EXISTS "Profiles are viewable by sports_engine_id" ON profiles;
CREATE POLICY "Profiles are viewable by sports_engine_id"
  ON profiles FOR SELECT
  USING (true);
