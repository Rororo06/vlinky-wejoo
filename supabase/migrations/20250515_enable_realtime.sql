
-- Enable row-level changes to be streamed via Supabase Realtime
ALTER TABLE public.creator_applications REPLICA IDENTITY FULL;

-- Add creator_applications to the supabase_realtime publication
BEGIN;
  -- Check if the publication already exists
  SELECT pg_catalog.has_publication_privilege('supabase_realtime', 'CREATE'); 
  
  -- Add the table to the publication if it exists
  ALTER PUBLICATION supabase_realtime ADD TABLE public.creator_applications;
COMMIT;

-- Create an index for faster lookups by user_id (which is how we'll query this data most often)
CREATE INDEX IF NOT EXISTS idx_creator_applications_user_id ON public.creator_applications (user_id);
