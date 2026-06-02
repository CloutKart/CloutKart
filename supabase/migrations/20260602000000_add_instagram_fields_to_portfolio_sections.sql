ALTER TABLE portfolio_sections
  ADD COLUMN IF NOT EXISTS instagram_handle text DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram_link    text DEFAULT '';
