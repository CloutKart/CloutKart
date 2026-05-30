-- Add subscription expiry tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;
