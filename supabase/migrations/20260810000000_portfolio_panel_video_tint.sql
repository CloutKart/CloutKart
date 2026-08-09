/*
  # Gallery side panels, video works, and artwork-matched ambient tint

  1. portfolio_sections gains
     - `panel_text`  the copy that types itself out beside the active plate
     - `video_url`   set when the work is a video; empty means it is an image.
                     Deliberately NOT paired with a `media_type` column — one
                     source of truth cannot disagree with itself. thumbnail_url
                     keeps working as the video's poster frame.
     - `accent_hex`  dominant colour sampled from the media at upload time,
                     drives the corridor's ambient light. Empty falls back to
                     the site accent, so existing rows keep working untouched.

  2. The `portfolio` storage bucket is widened for video: 5MB -> 50MB and the
     MIME allowlist gains mp4/webm. Until this runs, video uploads are rejected
     by storage regardless of what the admin UI allows.

  NOTE: this project's live RLS policies were added in the Supabase dashboard,
  not through these migration files (there are no write policies for
  portfolio_sections here, yet admin writes work in production). This migration
  therefore has to be applied to the live project deliberately — it will not
  arrive as a side effect of deploying the frontend.
*/

ALTER TABLE portfolio_sections
  ADD COLUMN IF NOT EXISTS panel_text text DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_url  text DEFAULT '',
  ADD COLUMN IF NOT EXISTS accent_hex text DEFAULT '';

UPDATE storage.buckets
   SET file_size_limit    = 52428800,
       allowed_mime_types = ARRAY[
         'image/jpeg', 'image/png', 'image/webp',
         'video/mp4', 'video/webm'
       ]
 WHERE id = 'portfolio';
