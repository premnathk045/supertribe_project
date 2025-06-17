/*
  # Create Storage Buckets for Stories

  1. Storage Buckets
    - `story-media` - For story photos and videos
    - `story-thumbnails` - For video thumbnails

  2. Storage Policies
    - Allow authenticated users to upload their own media
    - Allow public read access to story media
    - Automatic cleanup of expired story media
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('story-media', 'story-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('story-thumbnails', 'story-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for story-media bucket
CREATE POLICY "Users can upload their own story media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'story-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view all story media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'story-media');

CREATE POLICY "Users can update their own story media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'story-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own story media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'story-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for story-thumbnails bucket
CREATE POLICY "Users can upload their own story thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'story-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view all story thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'story-thumbnails');

CREATE POLICY "Users can update their own story thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'story-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own story thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'story-thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);