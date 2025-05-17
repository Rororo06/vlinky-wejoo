
-- Enable row-level changes for video_requests to be streamed via Supabase Realtime
ALTER TABLE public.video_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_requests;

-- Enable row-level changes for creator_applications to be streamed via Supabase Realtime
ALTER TABLE public.creator_applications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.creator_applications;
