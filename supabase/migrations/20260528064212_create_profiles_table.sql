/*
  # Create profiles table with RLS

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users, primary key)
      - `full_name` (text)
      - `company_name` (text)
      - `phone` (text)
      - `plan` (text, default 'free')
      - `created_at` (timestamptz)

  2. Functions & Triggers
    - `handle_new_user()` — auto-inserts profile on signup
    - Trigger on auth.users INSERT

  3. Security
    - Enable RLS
    - Users can view their own profile (SELECT)
    - Users can update their own profile (UPDATE)
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  company_name text,
  phone text,
  plan text DEFAULT 'free',
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
