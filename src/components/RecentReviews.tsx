
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Review {
  id: number | string;
  rating: number;
  comment: string;
  user_name: string;
  creator_name: string;
  date: string;
  avatar_url?: string;
  video_title?: string;
}

const RecentReviews = () => {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  
  const {
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['public-reviews'],
    queryFn: async () => {
      try {
        // Using public client without authentication requirements
        console.log('Fetching public reviews');
        const { data, error } = await supabase
          .from('video_requests')
          .select(`
            id, 
            rating, 
            request_details, 
            created_at, 
            fan_name,
            creator_applications(influencer_name)
          `)
          .not('rating', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }
        
        console.log('Reviews data received:', data);
        
        // Transform data to match our component's expected format
        const formattedReviews = data.map(item => ({
          id: item.id,
          rating: item.rating || 5,
          comment: item.request_details || 'Great video, thanks!',
          user_name: item.fan_name || 'Fan',
          creator_name: item.creator_applications?.influencer_name || 'Creator',
          date: new Date(item.created_at).toISOString().split('T')[0]
        }));
        
        setReviews(formattedReviews);
        return formattedReviews;
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast({
          title: "Error fetching reviews",
          description: "There was a problem loading the reviews.",
          variant: "destructive"
        });
        return [];
      }
    }
  });
  
  // Set up realtime subscription for new reviews
  useEffect(() => {
    const channel = supabase
      .channel('public-reviews')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'video_requests',
        filter: "rating.is.not.null"
      }, (payload) => {
        console.log('Review update detected:', payload);
        refetch();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };
  
  if (isLoading) {
    return <div className="text-center py-12">Loading reviews...</div>;
  }
  
  // Fallback to static data if no reviews
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Recent Reviews</h2>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <Carousel opts={{
            align: "start",
            loop: true
          }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {reviews.map(review => (
                <CarouselItem key={review.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="bg-white rounded-lg p-6 h-full flex flex-col shadow-sm">
                    {/* Review quote */}
                    <div className="italic text-gray-700 mb-4 flex-grow">
                      "{review.comment}"
                    </div>
                    
                    {/* User and rating */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{review.user_name}</span>
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      
                      {/* Video info */}
                      <div className="text-sm text-purple-600">
                        Video from {review.creator_name}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2">
              <CarouselNext className="h-8 w-8 rounded-full bg-white shadow-lg hover:bg-gray-50 border border-gray-200" />
            </div>
            <div className="absolute -left-4 top-1/2 -translate-y-1/2">
              <CarouselPrevious className="h-8 w-8 rounded-full bg-white shadow-lg hover:bg-gray-50 border border-gray-200" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default RecentReviews;
