/*
  # Create portfolio_sections and portfolio_images tables

  1. New Tables
    - `portfolio_sections`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `thumbnail_url` (text)
      - `display_order` (integer, default 0)
      - `is_visible` (boolean, default true)
      - `created_at` (timestamptz)

    - `portfolio_images`
      - `id` (uuid, primary key)
      - `section_id` (uuid, references portfolio_sections, cascades on delete)
      - `image_url` (text, not null)
      - `caption` (text)
      - `display_order` (integer, default 0)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Public SELECT on visible sections (for landing page/portfolio page)
    - Public SELECT on all portfolio images (images are public assets)
    - Admin writes via service_role key (bypasses RLS)
*/

CREATE TABLE IF NOT EXISTS portfolio_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  thumbnail_url text DEFAULT '',
  display_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view visible sections"
  ON portfolio_sections FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE TABLE IF NOT EXISTS portfolio_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES portfolio_sections(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  caption text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view portfolio images"
  ON portfolio_images FOR SELECT
  TO anon, authenticated
  USING (true);
