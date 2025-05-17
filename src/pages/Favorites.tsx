
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useFavorites } from '@/hooks/use-favorites';
import { supabase } from '@/integrations/supabase/client';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface Creator {
  id: string;
  influencer_name: string;
  rating?: number;
  orders?: number;
  price?: number;
  languages: string[];
  image?: string;
}

const Favorites = () => {
  const { favorites, isLoading, toggleFavorite } = useFavorites();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(false);

  useEffect(() => {
    const fetchCreators = async () => {
      if (favorites.length === 0) return;
      
      setIsLoadingCreators(true);
      try {
        const creatorIds = favorites.map(fav => fav.creator_id);
        
        const { data, error } = await supabase
          .from('creator_applications')
          .select('*')
          .in('id', creatorIds)
          .eq('status', 'approved');
          
        if (error) throw error;
        
        // Transform data to match our Creator interface
        const formattedCreators = data.map(creator => ({
          id: creator.id,
          influencer_name: creator.influencer_name,
          rating: 4.8, // Default rating until we implement ratings
          orders: 120, // Mock order count
          price: creator.price || 35,
          languages: creator.languages || [],
          image: '/placeholder.svg'
        }));
        
        setCreators(formattedCreators);
      } catch (error) {
        console.error('Error fetching creator data:', error);
      } finally {
        setIsLoadingCreators(false);
      }
    };
    
    fetchCreators();
  }, [favorites]);

  const handleRemoveFavorite = (creatorId: string) => {
    toggleFavorite(creatorId);
  };

  const showLoading = isLoading || isLoadingCreators;
  const showEmptyState = !showLoading && favorites.length === 0;
  const showCreators = !showLoading && favorites.length > 0 && creators.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-10">
        <div className="section-container max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Your Favorite Creators</h1>
          <p className="text-gray-600 mb-8">Quick access to the creators you love</p>
          
          {showLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          )}
          
          {showEmptyState && (
            <div className="bg-gray-50 rounded-lg p-16 flex flex-col items-center justify-center">
              <Heart className="h-20 w-20 text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold mb-3">No favorites yet</h2>
              <p className="text-gray-500 mb-6 text-center">You haven't added any creators to your favorites list.</p>
              <Link to="/creators">
                <Button className="bg-[#9062f5] hover:bg-[#7d50e0] text-white rounded-full px-6">
                  Browse Creators
                </Button>
              </Link>
            </div>
          )}
          
          {showCreators && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {creators.map((creator) => (
                <div key={creator.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <Link to={`/creators/${creator.id}`}>
                    <div className="relative">
                      <AspectRatio ratio={1/1}>
                        <img 
                          src={creator.image} 
                          alt={creator.influencer_name} 
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                      <button 
                        className="absolute top-2 right-2 bg-white rounded-full p-2 shadow"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFavorite(creator.id);
                        }}
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{creator.influencer_name}</h3>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center text-yellow-400 text-sm">
                          {'★'.repeat(Math.floor(creator.rating || 4.5))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">{creator.rating || 4.5}/5</span>
                        <span className="text-xs text-gray-500 ml-auto">{creator.orders || 0} orders</span>
                      </div>
                      <p className="text-[#9062f5] font-medium mt-2">${creator.price}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {creator.languages && creator.languages.length > 0 
                          ? creator.languages.join(', ') 
                          : 'English'}
                      </p>
                      <div className="mt-3 flex space-x-2">
                        <Link to={`/request-video/${creator.id}`} className="flex-1">
                          <Button 
                            size="sm" 
                            className="w-full bg-[#9062f5] hover:bg-[#7d50e0]"
                          >
                            <Video className="h-4 w-4 mr-1" /> Request
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1" 
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveFavorite(creator.id);
                          }}
                        >
                          <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" /> Remove
                        </Button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
          
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
