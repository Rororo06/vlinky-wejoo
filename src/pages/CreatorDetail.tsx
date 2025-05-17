import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import FavoriteButton from '@/components/FavoriteButton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Creator {
  id: string;
  influencer_name: string;
  bio: string | null;
  rating?: number;
  followers?: number;
  orders?: number;
  price?: number;
  turnaround_time?: number;
  image?: string;
  languages: string[];
  platforms: string[];
  specialties: string[];
  country?: string;
  expressDelivery?: boolean;
  longerVideos?: boolean;
  profile_image_url?: string | null;
  intro_video_url?: string | null;
}

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const CreatorDetail = () => {
  const { creatorId } = useParams<{ creatorId: string }>();

  // Fetch creator data from Supabase
  const { data: creator, isLoading, refetch } = useQuery({
    queryKey: ['creator', creatorId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('creator_applications')
          .select('*')
          .eq('id', creatorId)
          .eq('status', 'approved')
          .single();
          
        if (error) throw error;
        
        if (!data) {
          throw new Error('Creator not found');
        }
        
        // Get completed videos count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('video_requests')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', data.id)
          .eq('status', 'completed');
          
        if (ordersError) throw ordersError;
        
        // Get average rating
        const { data: ratingData, error: ratingError } = await supabase
          .from('video_requests')
          .select('rating')
          .eq('creator_id', data.id)
          .not('rating', 'is', null);
          
        if (ratingError) throw ratingError;
        
        let averageRating = 0;
        if (ratingData && ratingData.length > 0) {
          const validRatings = ratingData.filter(item => item.rating !== null);
          if (validRatings.length > 0) {
            const sum = validRatings.reduce((acc, item) => acc + (Number(item.rating) || 0), 0);
            averageRating = sum / validRatings.length;
          }
        }
        
        // Transform data to match our Creator interface
        return {
          id: data.id,
          influencer_name: data.influencer_name,
          bio: data.bio || 'No bio available',
          rating: averageRating,
          followers: ratingData?.length || 0,
          orders: ordersCount || 0,
          price: data.price || 35,
          turnaround_time: data.turnaround_time || 7,
          image: data.profile_image_url || '/placeholder.svg',
          profile_image_url: data.profile_image_url,
          intro_video_url: data.intro_video_url,
          languages: data.languages || [],
          platforms: data.platforms || [],
          specialties: data.platforms || [], // Using platforms as specialties temporarily
          country: data.country,
          expressDelivery: data.turnaround_time < 5,
          longerVideos: true // Assuming all creators can do longer videos for now
        };
      } catch (error) {
        console.error('Error fetching creator:', error);
        toast.error('Failed to load creator information');
        throw error;
      }
    }
  });

  // Fetch reviews data from Supabase
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews', creatorId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('video_requests')
          .select('id, rating, fan_name, created_at, request_details')
          .eq('creator_id', creatorId)
          .not('rating', 'is', null)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        // Transform data to match our Review interface
        return data.map(item => ({
          id: item.id,
          reviewer_name: item.fan_name || 'Anonymous Fan',
          rating: item.rating !== null ? Number(item.rating) : 0,
          comment: item.request_details || 'Great video, thanks!',
          created_at: item.created_at
        }));
      } catch (error) {
        console.error('Error fetching reviews:', error);
        return []; // Return empty array instead of throwing error
      }
    },
    enabled: !!creatorId
  });

  // Set up realtime subscription for creator profile updates
  useEffect(() => {
    if (!creatorId) return;
    
    const channel = supabase
      .channel('creator-profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'creator_applications',
          filter: `id=eq.${creatorId}`
        },
        (payload) => {
          console.log('Creator profile updated:', payload);
          refetch();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [creatorId, refetch]);

  // Generate star rating display
  const renderStars = (rating: number = 0) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex text-yellow-400">
        {fullStars > 0 && '★'.repeat(fullStars)}
        {hasHalfStar && '★'}
        {'☆'.repeat(5 - Math.ceil(rating))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-10">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Creator Not Found</h1>
            <p className="mb-6">Sorry, we couldn't find the creator you're looking for.</p>
            <Link to="/creators">
              <Button variant="default">Back to Creators</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Creator Profile Header */}
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            {/* Creator Image - Left Side */}
            <div className="w-full md:w-1/3">
              <div className="rounded-lg overflow-hidden bg-gray-100 aspect-square relative">
                <img 
                  src={creator.profile_image_url || '/placeholder.svg'} 
                  alt={creator.influencer_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <FavoriteButton creatorId={creator.id} className="p-2" />
                </div>
              </div>
              <div className="mt-6 hidden md:block">
                <h3 className="text-lg font-medium mb-3">Sample Video</h3>
                {creator.intro_video_url ? (
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <video 
                      src={creator.intro_video_url} 
                      controls
                      className="w-full h-full object-cover"
                    ></video>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="m9 8 6 4-6 4Z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Creator Info - Right Side */}
            <div className="w-full md:w-2/3">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold">{creator.influencer_name}</h1>
                <div className="hidden md:block">
                  <FavoriteButton creatorId={creator.id} variant="button" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {renderStars(creator.rating || 0)}
                  <span className="ml-1 text-sm text-gray-600">({creator.followers})</span>
                </div>
                <span className="text-sm text-gray-600">Rated by {creator.followers} fans</span>
                <span className="text-sm ml-4 flex items-center">
                  <span className="inline-block w-4 h-4 text-purple-600 mr-1">•</span>
                  {creator.orders} videos delivered
                </span>
              </div>
              
              {/* Languages and Platforms */}
              <div className="flex flex-wrap gap-2 mb-6">
                {creator.languages.map(language => (
                  <Badge key={language} variant="outline" className="bg-gray-50 text-gray-800">
                    {language}
                  </Badge>
                ))}
                {creator.platforms.map(platform => (
                  <Badge key={platform} variant="outline" className="bg-blue-50 text-blue-600">
                    {platform}
                  </Badge>
                ))}
                {creator.country && (
                  <Badge variant="outline" className="bg-green-50 text-green-600">
                    {creator.country}
                  </Badge>
                )}
              </div>
              
              {/* Specialties */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-purple-100 mr-2 flex items-center justify-center">
                    <span className="text-purple-600">•</span>
                  </span>
                  Specialties
                </h3>
                <div className="flex flex-wrap gap-2">
                  {creator.specialties.map(specialty => (
                    <Badge key={specialty} className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* About Me */}
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-3">About Me</h3>
                <p className="text-gray-700">{creator.bio}</p>
              </div>
              
              {/* Delivery Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <h4 className="font-medium">Standard Delivery</h4>
                  </div>
                  <p className="text-gray-600">Delivered in {creator.turnaround_time} days</p>
                </div>
                
                {creator.expressDelivery && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="h-5 w-5 text-purple-500 mr-2" />
                      <h4 className="font-medium">Express Delivery</h4>
                    </div>
                    <p className="text-gray-600">Delivered in 24 hours</p>
                  </div>
                )}
              </div>
              
              {/* Pricing */}
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4">Pricing</h3>
                <div className="border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Standard Video</h4>
                      <p className="text-sm text-gray-500">Up to 2 minutes, delivered in {creator.turnaround_time} days</p>
                    </div>
                    <span className="text-xl font-bold">${creator.price}</span>
                  </div>
                </div>
                
                {/* Add-ons */}
                <div className="text-sm text-gray-800 mb-2">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full mr-2">Express Eligible</span>
                  <span>Get your video faster in 24 hours</span>
                  <span className="font-medium text-gray-500 ml-auto">+50%</span>
                </div>
                
                {creator.longerVideos && (
                  <div className="text-sm text-gray-800">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full mr-2">Longer Videos Eligible</span>
                    <span>Extended videos up to 4 minutes</span>
                    <span className="font-medium text-gray-500 ml-auto">+50%</span>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link to={`/request-video/${creator.id}`}>
                    <Button className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700">
                      Request a Video
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Sample Video */}
          <div className="md:hidden mb-12">
            <h3 className="text-lg font-medium mb-3">Sample Video</h3>
            {creator.intro_video_url ? (
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <video 
                  src={creator.intro_video_url} 
                  controls
                  className="w-full h-full object-cover"
                ></video>
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="m9 8 6 4-6 4Z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Recent Videos */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Recent Videos</h2>
            {isLoadingReviews ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Fan Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews && reviews.length > 0 ? (
                      reviews.map(review => (
                        <TableRow key={review.id}>
                          <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{review.reviewer_name}</TableCell>
                          <TableCell>
                            <Badge className="bg-black text-white">Completed</Badge>
                          </TableCell>
                          <TableCell>{renderStars(review.rating)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">No videos delivered yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          
          {/* Fan Reviews */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Fan Reviews</h2>
            {isLoadingReviews ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border-b border-gray-200 pb-6">
                    <div className="flex justify-between items-start mb-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{review.reviewer_name}</h3>
                        <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border border-gray-200 rounded-lg">
                    <p className="text-gray-500">No reviews yet</p>
                    <p className="text-gray-400 text-sm mt-1">This creator has not received any reviews yet</p>
                  </div>
                )}
              </div>
            )}
            
            {reviews && reviews.length > 0 && (
              <div className="mt-8 text-center">
                <Button variant="outline" className="px-8">
                  Show More Reviews
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatorDetail;
