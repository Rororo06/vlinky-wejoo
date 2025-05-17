
import React, { useState, useEffect } from 'react';
import { Heart, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

interface Creator {
  id: string;
  name: string;
  rating: number;
  orders: number;
  price: number;
  image: string;
  languages: string[];
  platforms: string[];
  expressDelivery?: boolean;
  longerVideos?: boolean;
}

const FindInfluencers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch approved creators and their video requests for ratings from Supabase
  const { data: creators = [] } = useQuery({
    queryKey: ['find-influencers-data'],
    queryFn: async () => {
      try {
        // Fetch approved creators
        const { data: creatorsData, error: creatorsError } = await supabase
          .from('creator_applications')
          .select('*')
          .eq('status', 'approved');
          
        if (creatorsError) throw creatorsError;
        
        // Fetch all completed video requests for rating data
        const { data: videoRequests, error: requestsError } = await supabase
          .from('video_requests')
          .select('creator_id, rating, status');
          
        if (requestsError) throw requestsError;
        
        // Transform data to match our Creator interface
        return creatorsData.map((creator: any) => {
          // Get all video requests for this creator
          const creatorRequests = videoRequests.filter((req: any) => req.creator_id === creator.id);
          
          // Calculate average rating
          const ratingRequests = creatorRequests.filter((req: any) => req.rating !== null);
          let avgRating = 0;
          if (ratingRequests.length > 0) {
            avgRating = ratingRequests.reduce((sum: number, req: any) => sum + req.rating, 0) / ratingRequests.length;
          }
          
          // Count completed orders
          const completedOrders = creatorRequests.filter((req: any) => req.status === 'completed').length;
          
          return {
            id: creator.id,
            name: creator.influencer_name,
            rating: avgRating,
            orders: completedOrders,
            price: creator.price || 35, 
            image: creator.profile_image_url || '/placeholder.svg',
            languages: creator.languages || [],
            platforms: creator.platforms || [],
            expressDelivery: creator.turnaround_time < 5,
            longerVideos: creator.turnaround_time > 7
          };
        });
      } catch (error) {
        console.error('Error fetching creators:', error);
        toast({
          title: "Error",
          description: "Failed to load creators",
          variant: "destructive",
        });
        return [];
      }
    }
  });
  
  // Set up realtime subscription for updates
  useEffect(() => {
    const creatorChannel = supabase
      .channel('find-creators-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'creator_applications'
        },
        () => {
          // Refetch data when changes occur
        }
      )
      .subscribe();
      
    const requestChannel = supabase
      .channel('find-creators-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_requests'
        },
        () => {
          // Refetch data when changes occur
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(creatorChannel);
      supabase.removeChannel(requestChannel);
    };
  }, []);
  
  // Generate star rating display
  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {'★'.repeat(Math.floor(rating))}
        {rating % 1 >= 0.5 ? '★' : ''}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Find Virtual Creators</h1>
          <p className="text-gray-600 mb-8">Browse our roster of talented VTubers ready to create a personalized video for you</p>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters sidebar */}
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                {/* Search field */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search creators..."
                      className="pl-9 w-full bg-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Quick filters */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox id="express" />
                    <label htmlFor="express" className="text-sm font-medium">Express Delivery Available</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="longer" />
                    <label htmlFor="longer" className="text-sm font-medium">Longer Videos Available</label>
                  </div>
                </div>
                
                {/* Price range */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium mb-3 flex items-center justify-between">
                    Price Range
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up">
                      <path d="m18 15-6-6-6 6"/>
                    </svg>
                  </h3>
                  <RadioGroup>
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="0-50" id="price-0-50" />
                      <label htmlFor="price-0-50" className="text-sm">$0-50 USD</label>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="50-100" id="price-50-100" />
                      <label htmlFor="price-50-100" className="text-sm">$50-100 USD</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="100+" id="price-100-plus" />
                      <label htmlFor="price-100-plus" className="text-sm">$100+ USD</label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Languages */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium mb-3 flex items-center justify-between">
                    Languages
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up">
                      <path d="m18 15-6-6-6 6"/>
                    </svg>
                  </h3>
                  <div className="space-y-2">
                    {["English", "Japanese", "Spanish", "Korean", "Chinese", "Indonesian", "Tagalog", "Other"].map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox id={`lang-${language.toLowerCase()}`} />
                        <label htmlFor={`lang-${language.toLowerCase()}`} className="text-sm">{language}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Platforms */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium mb-3 flex items-center justify-between">
                    Platforms
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up">
                      <path d="m18 15-6-6-6 6"/>
                    </svg>
                  </h3>
                  <div className="space-y-2">
                    {["Twitch", "YouTube", "TikTok", "Bilibili", "SOOP", "CHZZK", "Bigo Live", "Other"].map((platform) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox id={`platform-${platform.toLowerCase().replace(/\s+/g, '-')}`} />
                        <label htmlFor={`platform-${platform.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm">{platform}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Countries */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium mb-3 flex items-center justify-between">
                    Countries
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up">
                      <path d="m18 15-6-6-6 6"/>
                    </svg>
                  </h3>
                  <div className="space-y-2">
                    {["United States", "Japan", "South Korea", "United Kingdom", "Canada", "Mexico", "Thailand", "China", "Other"].map((country) => (
                      <div key={country} className="flex items-center space-x-2">
                        <Checkbox id={`country-${country.toLowerCase().replace(/\s+/g, '-')}`} />
                        <label htmlFor={`country-${country.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm">{country}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4">
                  <Button variant="outline" className="w-full">Reset Filters</Button>
                </div>
              </div>
            </div>
            
            {/* Results area */}
            <div className="flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {creators.map((creator) => (
                  <div key={creator.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                    <div className="relative aspect-square bg-gray-100">
                      <img 
                        src={creator.image} 
                        alt={creator.name}
                        className="w-full h-full object-cover"
                      />
                      <button className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow">
                        <Heart className="h-5 w-5 text-gray-400" />
                      </button>
                      
                      {/* Service badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {creator.expressDelivery && (
                          <Badge className="bg-purple-500 hover:bg-purple-600">🚀 Express</Badge>
                        )}
                        {creator.longerVideos && (
                          <Badge className="bg-blue-500 hover:bg-blue-600">⏱️ Longer</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-lg">{creator.name}</h3>
                        <div className="flex items-center gap-1">
                          {renderStars(creator.rating)}
                          <span className="text-xs text-gray-500">({creator.orders})</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 flex-wrap mb-2">
                        {creator.platforms.map(platform => (
                          <span key={platform} className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">{platform}</span>
                        ))}
                      </div>
                      
                      <div className="flex gap-1 flex-wrap mb-3">
                        {creator.languages.map(language => (
                          <span key={language} className="px-2 py-0.5 bg-gray-50 text-xs rounded-full border border-gray-100">{language}</span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-purple-600 font-medium">${creator.price}</p>
                          <p className="text-xs text-gray-500">7 days delivery</p>
                        </div>
                        <Link to={`/request-video/${creator.id}`}>
                          <Button className="bg-purple-600 hover:bg-purple-700">Request Video</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FindInfluencers;
