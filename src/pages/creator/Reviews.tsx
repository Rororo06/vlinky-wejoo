
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  fan_name: string;
}

const Reviews = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data: creatorData, error: creatorError } = await supabase
          .from('creator_applications')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (creatorError || !creatorData) {
          throw new Error('Could not find creator profile');
        }
        
        const { data, error } = await supabase
          .from('video_requests')
          .select('id, rating, fan_name, created_at, request_details')
          .eq('creator_id', creatorData.id)
          .not('rating', 'is', null)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Map data to reviews format
        const reviewsData = data.map(item => ({
          id: item.id,
          rating: item.rating || 0,
          comment: item.request_details || '',
          created_at: item.created_at,
          fan_name: item.fan_name
        }));
        
        setReviews(reviewsData);
        
        // Calculate average rating
        if (reviewsData.length > 0) {
          const sum = reviewsData.reduce((acc, item) => acc + item.rating, 0);
          setAverageRating(sum / reviewsData.length);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast({
          title: "Error fetching reviews",
          description: "Something went wrong while fetching your reviews.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
    
    // Set up a realtime subscription for new reviews
    const channel = supabase
      .channel('creator-reviews')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'video_requests',
        filter: `creator_id=eq.${user?.id}`
      }, (payload) => {
        console.log('New review received:', payload);
        fetchReviews();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // Function to render stars based on rating
  const renderStars = (rating: number, total: number = 5) => {
    return Array(total)
      .fill(0)
      .map((_, i) => (
        <Star 
          key={i} 
          className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
        />
      ));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Fan Reviews</h1>
      <p className="text-gray-600 mb-8">See what fans are saying about your videos.</p>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poppi-purple"></div>
        </div>
      ) : (
        <>
          {/* Rating Overview */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <h2 className="text-5xl font-bold">{averageRating.toFixed(1)}</h2>
              <div className="flex">
                {renderStars(averageRating)}
              </div>
              <p className="text-gray-500 mt-2">Based on {reviews.length} reviews</p>
            </div>
          </div>
          
          {/* Reviews List */}
          <div className="mt-8">
            <h2 className="text-xl font-medium mb-4">Recent Reviews</h2>
            
            {reviews.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
                <p className="text-gray-500">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-2">Reviews will appear here once you receive them</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="italic text-gray-700 mb-4">
                      "{review.comment}"
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="font-medium text-gray-900">{review.fan_name}</div>
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reviews;
