
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export interface FavoriteCreator {
  id: string;
  user_id: string;
  creator_id: string;
  created_at: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsLoading(false);
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user's favorites when authenticated
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error: any) {
      console.error("Error fetching favorites:", error.message);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isCreatorFavorited = (creatorId: string | number) => {
    return favorites.some(fav => fav.creator_id === creatorId.toString());
  };

  const toggleFavorite = async (creatorId: string | number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save favorites",
        variant: "default",
      });
      navigate("/login");
      return;
    }

    const creatorIdStr = creatorId.toString();
    const isFavorited = isCreatorFavorited(creatorIdStr);

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("creator_id", creatorIdStr);

        if (error) throw error;

        setFavorites(favorites.filter(fav => fav.creator_id !== creatorIdStr));
        toast({
          title: "Creator removed",
          description: "Creator removed from your favorites",
        });
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from("user_favorites")
          .insert({
            user_id: user.id,
            creator_id: creatorIdStr,
          })
          .select();

        if (error) throw error;
        
        if (data && data[0]) {
          setFavorites([...favorites, data[0]]);
          toast({
            title: "Creator saved",
            description: "Creator added to your favorites",
          });
        }
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error.message);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  return {
    favorites,
    isLoading,
    isAuthenticated: !!user,
    isCreatorFavorited,
    toggleFavorite,
    refreshFavorites: fetchFavorites
  };
};
