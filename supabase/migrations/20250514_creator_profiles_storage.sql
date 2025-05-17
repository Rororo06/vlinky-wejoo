
-- Create a storage bucket for creator profile images
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'creator-profiles',
  'Creator Profile Images',
  true,
  false,
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Set up policies to allow authenticated users to manage their own profile images
CREATE POLICY "Anyone can view creator profile images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'creator-profiles');

CREATE POLICY "Authenticated users can upload profile images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'creator-profiles');

CREATE POLICY "Users can update their own profile images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'creator-profiles');

CREATE POLICY "Users can delete their own profile images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'creator-profiles');

-- Enable row level security
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
