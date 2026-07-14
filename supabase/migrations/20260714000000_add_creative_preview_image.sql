-- The AI-generated preview image the client approved alongside their vision.
ALTER TABLE free_creative_requests
  ADD COLUMN IF NOT EXISTS preview_image_url text;

-- Public bucket: the preview is shown in the client's dashboard, in Admin, and
-- embedded in the creative-brief email, so it has to be readable without a token
-- (email clients can't authenticate).
INSERT INTO storage.buckets (id, name, public)
VALUES ('creative-previews', 'creative-previews', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "creative previews are publicly readable" ON storage.objects;
CREATE POLICY "creative previews are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'creative-previews');

-- A user may only write inside a folder named after their own uid.
DROP POLICY IF EXISTS "users upload their own creative previews" ON storage.objects;
CREATE POLICY "users upload their own creative previews"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'creative-previews'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
