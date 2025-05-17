
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import FavoriteButton from '@/components/FavoriteButton';
import { Video } from 'lucide-react';

interface CreatorCardProps {
  creator: {
    id: string;
    influencer_name: string;
    rating?: number;
    orders?: number;
    price?: number;
    image?: string;
    profile_image_url?: string | null;
    languages?: string[];
    platforms?: string[];
    expressDelivery?: boolean;
    longerVideos?: boolean;
    turnaround_time?: number;
    position?: string;
  };
  showButton?: boolean;
  showPosition?: boolean;
}

const CreatorCard = ({ creator, showButton = false, showPosition = false }: CreatorCardProps) => {
  // Generate star rating display
  const renderStars = (rating: number = 0) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex text-yellow-400">
        {fullStars > 0 && '★'.repeat(fullStars)}
        {hasHalfStar && '★'}
        {fullStars === 0 && !hasHalfStar && '☆'}
      </div>
    );
  };

  // Ensure we have valid display values with proper defaults
  const displayRating = creator.rating || 0;
  const displayOrders = creator.orders || 0;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow border border-gray-200">
      <div className="relative">
        <AspectRatio ratio={1/1}>
          <Link to={`/creators/${creator.id}`}>
            <img 
              src={creator.profile_image_url || '/placeholder.svg'} 
              alt={creator.influencer_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          </Link>
        </AspectRatio>
        
        {/* Position badge (for top creators) */}
        {showPosition && creator.position && (
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <div className={`w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center`}>
              <span className="text-xs text-white font-bold">★</span>
            </div>
            <span className="text-xs font-medium">{creator.position}</span>
          </div>
        )}
        
        {/* Service badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {creator.expressDelivery && (
            <Badge className="bg-purple-500 hover:bg-purple-600">🚀 Express</Badge>
          )}
          {creator.longerVideos && (
            <Badge className="bg-blue-500 hover:bg-blue-600">⏱️ Longer</Badge>
          )}
        </div>
        
        {/* Favorite button */}
        <div className="absolute top-2 right-2">
          <FavoriteButton creatorId={creator.id} />
        </div>
        
        {/* Video request button */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 -mb-4">
          <Link to={`/request-video/${creator.id}`}>
            <button className="bg-[#9062f5] text-white rounded-full p-2 shadow">
              <Video className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
      
      <div className="p-4 pt-6">
        <Link to={`/creators/${creator.id}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{creator.influencer_name}</h3>
          </div>
          
          <div className="flex items-center mt-1">
            <div className="flex items-center text-yellow-400 text-sm">
              {renderStars(displayRating)}
            </div>
            <span className="text-xs text-gray-500 ml-1">{displayRating.toFixed(1)}/5</span>
            <span className="text-xs text-gray-500 ml-auto">{displayOrders} orders</span>
          </div>
        </Link>
        
        <p className="text-[#9062f5] font-medium mt-2">${creator.price}</p>
        <p className="text-xs text-gray-500 mt-1">{(creator.languages || []).join(', ')}</p>
        
        {creator.turnaround_time && (
          <p className="text-xs text-gray-500">Delivery: {creator.turnaround_time} days</p>
        )}
        
        {showButton && (
          <div className="mt-2">
            <Link to={`/request-video/${creator.id}`}>
              <Button className="w-full bg-[#9062f5] hover:bg-[#7d50e0]">Request Video</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorCard;
