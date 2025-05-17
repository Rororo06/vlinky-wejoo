
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';

interface FavoriteButtonProps {
  creatorId: string | number;
  className?: string;
  variant?: "icon" | "button";
}

const FavoriteButton = ({ creatorId, className = "", variant = "icon" }: FavoriteButtonProps) => {
  const { isCreatorFavorited, toggleFavorite } = useFavorites();
  const isFavorited = isCreatorFavorited(creatorId);

  if (variant === "icon") {
    return (
      <button 
        className={`bg-white rounded-full p-1 shadow hover:shadow-md transition-shadow ${className}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(creatorId);
        }}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart 
          className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
        />
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => toggleFavorite(creatorId)}
    >
      <Heart 
        className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} 
      />
      {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
    </Button>
  );
};

export default FavoriteButton;
