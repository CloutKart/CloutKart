ALTER TABLE free_creative_requests
  ADD COLUMN IF NOT EXISTS creative_caption text DEFAULT '',
  ADD COLUMN IF NOT EXISTS client_message text DEFAULT '';
