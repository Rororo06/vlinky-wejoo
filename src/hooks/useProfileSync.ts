
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

/**
 * Custom hook to ensure creator profile data is synchronized between dashboard 
 * and main website profile
 */
export const useProfileSync = () => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Perform initial sync when the hook is mounted
  useEffect(() => {
    if (user) {
      syncProfiles();
    }
  }, [user]);

  // Set up realtime subscription to creator_applications changes
  useEffect(() => {
    if (!user) return;

    // Subscribe to changes for this creator's profile
    const channel = supabase
      .channel('profile-sync-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'creator_applications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Creator profile updated in database, syncing locally...');
          syncProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Function to sync creator data across the application
  const syncProfiles = async () => {
    if (!user) return;
    
    try {
      setIsSyncing(true);
      
      // 1. First get the creator data
      const { data: creatorData, error: creatorError } = await supabase
        .from('creator_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();
        
      if (creatorError) throw creatorError;
      
      if (!creatorData) {
        console.log('No approved creator application found for this user');
        return;
      }
      
      // 2. Store important creator data in localStorage for cross-page access
      localStorage.setItem('creatorId', creatorData.id);
      localStorage.setItem('creatorName', creatorData.influencer_name);
      localStorage.setItem('creatorProfileLastUpdated', new Date().toISOString());
      
      console.log('Profile data synchronized successfully');
      setLastSyncTime(new Date());
      
    } catch (error) {
      console.error('Error syncing profiles:', error);
      toast({
        title: "Sync Failed",
        description: "There was a problem synchronizing your profile data",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncProfiles,
    isSyncing,
    lastSyncTime
  };
};
