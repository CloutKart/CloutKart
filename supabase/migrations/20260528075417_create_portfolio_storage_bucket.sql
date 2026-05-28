/*
  # Create portfolio storage bucket

  Creates a public storage bucket for portfolio images.
  Images must be accessible without authentication on the public website.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view portfolio files"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'portfolio');

CREATE POLICY "Authenticated users can upload portfolio files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio');

CREATE POLICY "Authenticated users can delete portfolio files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio');
