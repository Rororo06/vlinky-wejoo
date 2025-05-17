
-- Create the video_uploads table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.video_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Add necessary indexes
CREATE INDEX IF NOT EXISTS video_uploads_creator_id_idx ON public.video_uploads (creator_id);

-- Set up Row Level Security
ALTER TABLE public.video_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Creators can view their own uploads" 
  ON public.video_uploads
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM public.creator_applications WHERE id = creator_id
  ));

CREATE POLICY "Creators can insert their own uploads" 
  ON public.video_uploads
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.creator_applications WHERE id = creator_id
  ));

CREATE POLICY "Creators can update their own uploads" 
  ON public.video_uploads
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM public.creator_applications WHERE id = creator_id
  ));

-- Allow administrators to access all records
CREATE POLICY "Admins have full access to uploads" 
  ON public.video_uploads
  USING (auth.uid() IN (
    SELECT user_id FROM public.admin_users WHERE role = 'admin'
  ));
