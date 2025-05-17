
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  checkCreatorStatus: () => Promise<boolean>;
  isCreator: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
  checkCreatorStatus: async () => false,
  isCreator: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const navigate = useNavigate();

  // Check creator status in database
  const checkCreatorStatus = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Check local storage first for performance
      const cachedCreatorStatus = localStorage.getItem('isCreator');
      if (cachedCreatorStatus === 'true') {
        setIsCreator(true);
        return true;
      }

      // If not in local storage or is false, check database
      let { data, error } = await supabase
        .from('creator_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();
        
      // If no result found by user_id, try by email
      if (!data && !error && user.email) {
        const { data: dataByEmail, error: errorByEmail } = await supabase
          .from('creator_applications')
          .select('*')
          .eq('email', user.email)
          .eq('status', 'approved')
          .maybeSingle();
          
        data = dataByEmail;
        error = errorByEmail;
      }
      
      if (error) {
        console.error('Error checking creator status:', error);
        setIsCreator(false);
        return false;
      }
      
      if (data) {
        localStorage.setItem('isCreator', 'true');
        localStorage.setItem('creatorId', data.id);
        localStorage.setItem('creatorName', data.influencer_name);
        setIsCreator(true);
        return true;
      }
      
      localStorage.setItem('isCreator', 'false');
      setIsCreator(false);
      return false;
    } catch (error) {
      console.error('Error checking creator status:', error);
      setIsCreator(false);
      return false;
    }
  };

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Handle auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in');
          await checkCreatorStatus();
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Clear creator-related data from localStorage on sign out
          localStorage.removeItem('isCreator');
          localStorage.removeItem('creatorId');
          localStorage.removeItem('creatorName');
          setIsCreator(false);
          
          // We'll handle navigation explicitly in the signOut method
          // rather than here to prevent any race conditions
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Check creator status if user is logged in
      if (currentSession?.user) {
        await checkCreatorStatus();
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      // Clear creator-related data before signing out
      localStorage.removeItem('isCreator');
      localStorage.removeItem('creatorId');
      localStorage.removeItem('creatorName');
      setIsCreator(false);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      
      // Explicitly handle navigation here but let the calling component handle it
      // to prevent race conditions and double navigation
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, we don't want to handle navigation here
      // Let the component that called signOut handle navigation after error
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isLoading, 
      signOut, 
      checkCreatorStatus,
      isCreator
    }}>
      {children}
    </AuthContext.Provider>
  );
};
