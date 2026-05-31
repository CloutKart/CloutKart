-- Store the AI-approved creative vision alongside each brief
ALTER TABLE free_creative_requests
  ADD COLUMN IF NOT EXISTS approved_vision jsonb;
