
import React, { useEffect } from 'react';
import CreatorCard from '@/components/CreatorCard';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { calculateAverageRating, getOrdinalSuffix } from '@/lib/utils';

interface Creator {
  id: string;
  influencer_name: string;
  rating?: number;
  price?: number;
  languages?: string[];
  image?: string;
  profile_image_url?: string | null;
  orders?: number;
  position?: string;
  delivery_time?: number;
  turnaround_time?: number;
}

const TopInfluencers = () => {
  const { data: creators = [], isLoading, error, refetch } = useQuery({
    queryKey: ['top-creators'],
    queryFn: async () => {
      try {
        console.log('Fetching top creators');
        // Fetch creator applications and their corresponding ratings
        // This works for both authenticated and non-authenticated users
        const { data: creatorData, error: creatorError } = await supabase
          .from('creator_applications')
          .select('*, video_requests!creator_id(*)')
          .eq('status', 'approved')
          .order('follower_count', { ascending: false })
          .limit(6);
          
        if (creatorError) {
          console.error('Error fetching top creators:', creatorError);
          throw creatorError;
        }
        
        console.log('Top creators raw data:', creatorData);
        
        // Process the data to calculate average ratings and count completed orders
        return creatorData.map((creator, index) => {
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
            position: `${index + 1}${getOrdinalSuffix(index + 1)}`,
            turnaround_time: creator.turnaround_time || 7
          };
        });
      } catch (error) {
        console.error('Error fetching creators:', error);
        toast({
          title: "Error fetching creators",
          description: "There was a problem loading the top creators.",
          variant: "destructive"
        });
        return [];
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 60000, // Refresh the data every 60 seconds
  });

  // Set up realtime subscription for creator profile updates and ratings/orders
  useEffect(() => {
    // Subscribe to both new creator profiles and updates to existing profiles
    const channel = supabase
      .channel('top-creators-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
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
      
    // Subscribe to window storage events to detect profile updates from other components
    const handleStorageChange = () => {
      const lastUpdate = localStorage.getItem('creatorProfileLastUpdated');
      if (lastUpdate) {
        console.log('Profile updated in localStorage, refreshing top creators');
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
    <section className="py-12 bg-gray-50">
      <div className="section-container">
        <h2 className="text-3xl font-bold mb-6">Top 10 Creators This Month</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, index) => (
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
                showPosition={true}
                showButton={true}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TopInfluencers;
