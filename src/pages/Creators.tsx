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
import { toast } from '@/components/ui/sonner';
import CreatorCard from '@/components/CreatorCard';
import { calculateAverageRating } from '@/lib/utils';

interface Creator {
  id: string;
  influencer_name: string;
  rating?: number;
  orders?: number;
  price?: number;
  image?: string;
  profile_image_url?: string | null;
  languages: string[];
  platforms: string[];
  expressDelivery?: boolean;
  longerVideos?: boolean;
  turnaround_time?: number;
}

const Creators = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expressDeliveryFilter, setExpressDeliveryFilter] = useState(false);
  const [longerVideosFilter, setLongerVideosFilter] = useState(false);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  // Fetch approved creators and their video requests for ratings from Supabase
  const { data: creators = [], isLoading, error, refetch } = useQuery({
    queryKey: ['creators-with-ratings'],
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
        
        console.log('Fetched creators:', creatorsData);
        console.log('Fetched video requests:', videoRequests);
        
        // Transform data to match our Creator interface
        return creatorsData.map((creator: any) => {
          // Get all video requests for this creator
          const creatorRequests = videoRequests.filter((req: any) => req.creator_id === creator.id);
          
          // Calculate average rating from completed requests with ratings
          const ratingRequests = creatorRequests.filter((req: any) => req.rating !== null);
          const avgRating = calculateAverageRating(ratingRequests, 0);
          
          // Count completed orders
          const completedOrders = creatorRequests.filter((req: any) => req.status === 'completed').length;
          
          return {
            id: creator.id,
            influencer_name: creator.influencer_name,
            rating: avgRating,
            orders: completedOrders,
            price: creator.price || 35, // Default price if not set
            image: creator.profile_image_url || '/placeholder.svg', // Use profile image if available
            profile_image_url: creator.profile_image_url,
            languages: creator.languages || [],
            platforms: creator.platforms || [],
            expressDelivery: creator.turnaround_time < 5, // Express if less than 5 days
            longerVideos: Math.random() > 0.5, // Random for now
            turnaround_time: creator.turnaround_time || 7
          };
        });
      } catch (error) {
        console.error('Error fetching creators:', error);
        toast.error('Failed to load creators');
        return [];
      }
    }
  });

  // Set up realtime subscription for creator profile updates and video request changes
  useEffect(() => {
    // Channel for creator application changes
    const creatorChannel = supabase
      .channel('creator-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'creator_applications',
          filter: `status=eq.approved`
        },
        (payload) => {
          console.log('Creator profile updated:', payload);
          refetch();
        }
      )
      .subscribe();
      
    // Channel for video request changes (for ratings and order counts)
    const requestsChannel = supabase
      .channel('video-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_requests'
        },
        (payload) => {
          console.log('Video request updated:', payload);
          refetch();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(creatorChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [refetch]);

  // Filter creators based on search and filters
  const filteredCreators = creators.filter((creator) => {
    // Search filter
    if (searchQuery && !creator.influencer_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Express delivery filter
    if (expressDeliveryFilter && !creator.expressDelivery) {
      return false;
    }
    
    // Longer videos filter
    if (longerVideosFilter && !creator.longerVideos) {
      return false;
    }
    
    // Price range filter
    if (priceRange) {
      const price = creator.price || 0;
      if (
        (priceRange === '0-50' && (price < 0 || price > 50)) ||
        (priceRange === '50-100' && (price < 50 || price > 100)) ||
        (priceRange === '100+' && price <= 100)
      ) {
        return false;
      }
    }
    
    // Languages filter
    if (selectedLanguages.length > 0) {
      const creatorLangs = creator.languages || [];
      if (!selectedLanguages.some(lang => creatorLangs.includes(lang))) {
        return false;
      }
    }
    
    // Platforms filter
    if (selectedPlatforms.length > 0) {
      const creatorPlatforms = creator.platforms || [];
      if (!selectedPlatforms.some(platform => creatorPlatforms.includes(platform))) {
        return false;
      }
    }
    
    return true;
  });

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setExpressDeliveryFilter(false);
    setLongerVideosFilter(false);
    setPriceRange(null);
    setSelectedLanguages([]);
    setSelectedPlatforms([]);
  };

  // Toggle languages in filter
  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(lang => lang !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  // Toggle platforms in filter
  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
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
                    <Checkbox 
                      id="express" 
                      checked={expressDeliveryFilter}
                      onCheckedChange={() => setExpressDeliveryFilter(!expressDeliveryFilter)}
                    />
                    <label htmlFor="express" className="text-sm font-medium">Express Delivery Available</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="longer"
                      checked={longerVideosFilter}
                      onCheckedChange={() => setLongerVideosFilter(!longerVideosFilter)} 
                    />
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
                  <RadioGroup value={priceRange || ''} onValueChange={setPriceRange}>
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
                        <Checkbox 
                          id={`lang-${language.toLowerCase()}`} 
                          checked={selectedLanguages.includes(language)}
                          onCheckedChange={() => toggleLanguage(language)}
                        />
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
                        <Checkbox 
                          id={`platform-${platform.toLowerCase().replace(/\s+/g, '-')}`} 
                          checked={selectedPlatforms.includes(platform)}
                          onCheckedChange={() => togglePlatform(platform)}
                        />
                        <label htmlFor={`platform-${platform.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm">{platform}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4">
                  <Button variant="outline" className="w-full" onClick={handleResetFilters}>Reset Filters</Button>
                </div>
              </div>
            </div>
            
            {/* Results area */}
            <div className="flex-grow">
              {isLoading ? (
                <div className="text-center py-10">Loading creators...</div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">
                  Error loading creators. Please try again later.
                </div>
              ) : filteredCreators.length === 0 ? (
                <div className="text-center py-10">
                  {creators.length === 0 ? 
                    "No creators have registered yet. Check back soon!" : 
                    "No creators match your filters. Try adjusting your criteria."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCreators.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Creators;
