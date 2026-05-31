-- Add creative_urls array column to store multiple deliverables per brief
ALTER TABLE free_creative_requests
ADD COLUMN IF NOT EXISTS creative_urls text[];
