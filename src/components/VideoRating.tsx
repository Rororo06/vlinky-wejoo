
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

interface VideoRatingProps {
  videoId: string;
  initialRating?: number | null;
  onRatingSubmit?: () => void;
}

const VideoRating = ({ videoId, initialRating = null, onRatingSubmit }: VideoRatingProps) => {
  const [rating, setRating] = useState<number | null>(initialRating);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const displayRating = hoveredRating !== null ? hoveredRating : rating;
  
  const handleRatingChange = async () => {
    if (!rating) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('video_requests')
        .update({ rating })
        .eq('id', videoId);
        
      if (error) throw error;
      
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this video!",
      });
      
      if (onRatingSubmit) {
        onRatingSubmit();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error submitting rating",
        description: "There was a problem submitting your rating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 w-full">
      <h3 className="font-medium text-gray-800 mb-2">Rate this video</h3>
      
      <div className="flex items-center mb-4">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`h-8 w-8 cursor-pointer transition-colors ${
              displayRating !== null && value <= displayRating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(null)}
          />
        ))}
        <span className="ml-2 text-sm text-gray-500">
          {displayRating ? `${displayRating} of 5 stars` : 'Select a rating'}
        </span>
      </div>
      
      <Button 
        onClick={handleRatingChange}
        disabled={!rating || isSubmitting || rating === initialRating}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isSubmitting ? 'Submitting...' : rating === initialRating ? 'Rating Submitted' : 'Submit Rating'}
      </Button>
    </div>
  );
};

export default VideoRating;
