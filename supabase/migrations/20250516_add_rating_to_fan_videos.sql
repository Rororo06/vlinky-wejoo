
-- Add rating column to fan_videos view if it doesn't exist already
CREATE OR REPLACE VIEW public.fan_videos AS
SELECT 
  vr.created_at,
  vr.updated_at,
  vr.recipient_name,
  vr.request_details,
  vr.video_url,
  ca.influencer_name AS creator_name,
  vr.status,
  vr.id,
  vr.creator_id,
  vr.fan_id,
  vr.rating
FROM video_requests vr
LEFT JOIN creator_applications ca ON vr.creator_id = ca.id;

-- Make sure we have the realtime enabled for video_requests
ALTER TABLE public.video_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_requests;
