
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CreatorCard from '@/components/CreatorCard';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

interface Creator {
  id: string;
  influencer_name: string;
  rating?: number;
  price?: number;
  languages?: string[];
  image?: string;
  profile_image_url?: string | null;
  orders?: number;
  delivery_time?: number;
  turnaround_time?: number;
  expressDelivery?: boolean;
}

const ExpressInfluencers = () => {
  const { data: creators = [], isLoading, error, refetch } = useQuery({
    queryKey: ['express-creators'],
    queryFn: async () => {
      try {
        // Fetch creator applications with fast turnaround and their ratings
        // Using public client that doesn't require auth
        const { data, error } = await supabase
          .from('creator_applications')
          .select('*, video_requests(id, rating, status)')
          .eq('status', 'approved')
          .lte('turnaround_time', 2) // Get creators with fast turnaround
          .order('turnaround_time', { ascending: true })
          .limit(5);
          
        if (error) {
          console.error('Error fetching express creators:', error);
          throw error;
        }
        
        console.log('Express creators raw data:', data);
        
        // Map the data to calculate average ratings and match our component's expected format
        return data.map((creator) => {
          // Calculate average rating if available
          let avgRating = 0;
          const reviews = creator.video_requests || [];
          
          // Count completed orders
          const completedOrders = reviews.filter(r => r.status === 'completed').length;
          
          if (reviews.length > 0) {
            // Check if there are any reviews with ratings
            const validRatings = reviews.filter(r => r.rating !== null && r.rating !== undefined);
            if (validRatings.length > 0) {
              const sum = validRatings.reduce((acc, curr) => acc + (curr.rating || 0), 0);
              avgRating = sum / validRatings.length;
            }
          }
          
          return {
            id: creator.id,
            influencer_name: creator.influencer_name,
            rating: avgRating,
            orders: completedOrders || 0, // Real order count or zero
            price: creator.price || 35,
            profile_image_url: creator.profile_image_url,
            image: creator.profile_image_url || '/placeholder.svg',
            languages: creator.languages || ['English'],
            turnaround_time: creator.turnaround_time || 2,
            expressDelivery: true
          };
        });
      } catch (error) {
        console.error('Error fetching express creators:', error);
        toast({
          title: "Error fetching express creators",
          description: "There was a problem loading the express delivery creators.",
          variant: "destructive"
        });
        return [];
      }
    },
  });

  // Set up realtime subscription for rating updates
  useEffect(() => {
    const channel = supabase
      .channel('express-creators-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'creator_applications',
          filter: "status=eq.approved"
        },
        () => {
          console.log('Creator profile updated');
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_requests',
        },
        () => {
          console.log('Video request updated (rating change)');
          refetch();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <section className="py-12 bg-white">
      <div className="section-container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Express Delivery (1-2 days)</h2>
          <Link to="/express-delivery" className="hidden md:block">
            <Button variant="outline" className="border-[#9062f5] text-[#9062f5] hover:bg-[#9062f5] hover:text-white rounded-full">
              Find Out More
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading ? (
            // Loading skeletons
            Array(5).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <Skeleton className="w-full aspect-square" />
                <div className="p-4 pt-6">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center text-red-500">
              Failed to load creators. Please try again later.
            </div>
          ) : (
            creators.map((creator) => (
              <CreatorCard 
                key={creator.id} 
                creator={creator} 
              />
            ))
          )}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link to="/express-delivery">
            <Button variant="outline" className="border-[#9062f5] text-[#9062f5] hover:bg-[#9062f5] hover:text-white rounded-full">
              Find Out More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExpressInfluencers;
