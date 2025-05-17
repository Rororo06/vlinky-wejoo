
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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
}

const FeaturedInfluencers = () => {
  const { data: creators = [], isLoading, error, refetch } = useQuery({
    queryKey: ['featured-creators'],
    queryFn: async () => {
      try {
        // Fetch creator applications and their corresponding ratings and video requests
        // Using public client that doesn't require authentication
        const { data: creatorData, error: creatorError } = await supabase
          .from('creator_applications')
          .select('*, video_requests!creator_id(*)')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .range(0, 4);
          
        if (creatorError) {
          console.error('Error fetching creator data:', creatorError);
          throw creatorError;
        }
        
        console.log('Featured creators raw data:', creatorData);
        
        // Process the data to calculate average ratings and count completed orders
        return creatorData.map((creator) => {
          // Calculate average rating if available
          let avgRating = 0; 
          const reviews = creator.video_requests || [];
          
          // Count only completed orders
          const completedOrders = reviews.filter(r => r.status === 'completed').length;
          
          // Calculate average from valid ratings
          if (reviews.length > 0) {
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
            orders: completedOrders, // Use actual completed order count
            price: creator.price || 35,
            profile_image_url: creator.profile_image_url,
            image: creator.profile_image_url || '/placeholder.svg',
            languages: creator.languages || ['English'],
            delivery_time: creator.turnaround_time || 7
          };
        });
      } catch (error) {
        console.error('Error fetching featured creators:', error);
        toast({
          title: "Error fetching featured creators",
          description: "There was a problem loading the featured creators.",
          variant: "destructive"
        });
        return [];
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 45000, // Refresh the data every 45 seconds
  });

  // Set up realtime subscription for creator profile updates and ratings/orders
  useEffect(() => {
    const channel = supabase
      .channel('featured-creators-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'creator_applications',
          filter: "status=eq.approved"
        },
        (payload) => {
          console.log('New creator approved:', payload);
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'creator_applications',
          filter: "status=eq.approved"
        },
        (payload) => {
          console.log('Creator profile updated:', payload);
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
        (payload) => {
          console.log('Video request updated (potential rating/order change):', payload);
          refetch();
        }
      )
      .subscribe();
    
    // Listen for profile updates from other parts of the application
    const handleStorageChange = () => {
      const lastUpdate = localStorage.getItem('creatorProfileLastUpdated');
      if (lastUpdate) {
        console.log('Profile updated in localStorage, refreshing featured creators');
        refetch();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
      
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refetch]);

  return (
    <section className="py-12 bg-white">
      <div className="section-container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Featured Creators</h2>
          <Link to="/creators" className="hidden md:block">
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
          <Link to="/creators">
            <Button variant="outline" className="border-[#9062f5] text-[#9062f5] hover:bg-[#9062f5] hover:text-white rounded-full">
              Find Out More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedInfluencers;
