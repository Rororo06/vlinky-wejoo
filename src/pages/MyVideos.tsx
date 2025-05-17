
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Film, ExternalLink, Star, ArrowLeft } from 'lucide-react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import VideoRating from '@/components/VideoRating';

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        if (!user) {
          console.error("User not logged in.");
          return;
        }

        // Modified query to join with creator_applications to get the creator's name
        const { data, error } = await supabase
          .from('video_requests')
          .select(`
            *,
            creator:creator_id(influencer_name)
          `)
          .eq('fan_id', user.id);

        if (error) {
          console.error("Error fetching videos:", error);
          toast({
            title: "Error",
            description: "Failed to load videos. Please try again.",
            variant: "destructive",
          })
        } else {
          // Transform the data to include creator name
          const videosWithCreatorNames = data.map(video => ({
            ...video,
            creator_name: video.creator ? video.creator.influencer_name : 'Unknown Creator'
          }));
          setVideos(videosWithCreatorNames || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();

    // Set up real-time subscription for video request updates
    const channel = supabase
      .channel('video_requests_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'video_requests', filter: `fan_id=eq.${user?.id}` }, 
        (payload) => {
          console.log('Video request change detected:', payload);
          fetchVideos(); // Reload videos when changes occur
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const openRatingDialog = (videoId) => {
    setSelectedVideoId(videoId);
    setIsRatingDialogOpen(true);
  };

  const handleRatingSubmitted = () => {
    setIsRatingDialogOpen(false);
    // The video list will update automatically through the real-time subscription
  };

  const videoIcon = <Film className="h-5 w-5 text-gray-500" />;

  return (
    <div className="container mx-auto py-8">
      {/* Navigation buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Home
            </Button>
          </Link>
          <Link to="/creators">
            <Button variant="outline">
              Find Creators
            </Button>
          </Link>
        </div>
        
        {/* Conditional button for favorites if user is logged in */}
        {user && (
          <Link to="/favorites">
            <Button variant="outline">
              My Favorites
            </Button>
          </Link>
        )}
      </div>
      
      <h1 className="text-2xl font-bold mb-4">My Requested Videos</h1>

      {loading ? (
        <p>Loading videos...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>A list of videos you recently requested.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Request Details</TableHead>
                <TableHead>Video URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.status}</TableCell>
                  <TableCell>
                    <Link to={`/creator/${video.creator_id}`} className="text-blue-500 hover:underline">
                      {video.creator_name}
                    </Link>
                  </TableCell>
                  <TableCell>{video.request_details}</TableCell>
                  <TableCell>
                    {video.video_url ? (
                      <Link to={video.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                        View Video <ExternalLink className="h-4 w-4 ml-1" />
                      </Link>
                    ) : (
                      "Not available yet"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {video.rating !== null && video.rating !== undefined ? (
                      <div className="flex items-center justify-end">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{video.rating}</span>
                      </div>
                    ) : (
                      video.video_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openRatingDialog(video.id)}
                        >
                          Add Review
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate the Video</DialogTitle>
            <DialogDescription>
              How would you rate your experience with this personalized video?
            </DialogDescription>
          </DialogHeader>
          
          <VideoRating 
            videoId={selectedVideoId} 
            onRatingSubmit={handleRatingSubmitted}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyVideos;
