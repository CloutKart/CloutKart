/*
  # Create free_creative_requests and payments tables

  1. New Tables
    - `free_creative_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `brand_name` (text)
      - `niche` (text)
      - `ad_format` (text)
      - `description` (text)
      - `reference_url` (text, optional)
      - `status` (text, default 'pending')
      - `created_at` (timestamptz)

    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `amount` (integer, in paise)
      - `plan` (text)
      - `status` (text, default 'captured')
      - `payment_id` (text)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
*/

CREATE TABLE IF NOT EXISTS free_creative_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  brand_name text NOT NULL DEFAULT '',
  niche text NOT NULL DEFAULT '',
  ad_format text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  reference_url text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE free_creative_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own creative requests"
  ON free_creative_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own creative requests"
  ON free_creative_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  plan text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'captured',
  payment_id text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
