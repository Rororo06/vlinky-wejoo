
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

type CreatorApplicationData = {
  // Profile step
  influencer_name: string;
  email: string;
  country: string;
  languages: string[];
  platforms: string[];
  followerCount: string;
  // Agency step
  hasAgency: boolean;
  // IP Rights step
  contentRights: string;
  // Terms step
  agreedToTerms: boolean;
};

type CreatorApplicationContextType = {
  applicationData: CreatorApplicationData;
  updateProfileData: (data: Partial<CreatorApplicationData>) => void;
  updateAgencyData: (data: Partial<CreatorApplicationData>) => void;
  updateIPRightsData: (data: Partial<CreatorApplicationData>) => void;
  updateTermsData: (data: Partial<CreatorApplicationData>) => void;
  submitApplication: () => Promise<void>;
  isSubmitting: boolean;
};

const defaultApplicationData: CreatorApplicationData = {
  influencer_name: '',
  email: '',
  country: '',
  languages: [],
  platforms: [],
  followerCount: '',
  hasAgency: false,
  contentRights: 'myself',
  agreedToTerms: false
};

const CreatorApplicationContext = createContext<CreatorApplicationContextType>({
  applicationData: defaultApplicationData,
  updateProfileData: () => {},
  updateAgencyData: () => {},
  updateIPRightsData: () => {},
  updateTermsData: () => {},
  submitApplication: async () => {},
  isSubmitting: false
});

export const useCreatorApplication = () => useContext(CreatorApplicationContext);

export const CreatorApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applicationData, setApplicationData] = useState<CreatorApplicationData>(defaultApplicationData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load existing application data if available for logged in users
  React.useEffect(() => {
    const loadExistingApplication = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('creator_applications')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" - not an actual error for us
            console.error("Error fetching application:", error);
          }
          return;
        }
        
        if (data) {
          setApplicationData({
            influencer_name: data.influencer_name || '',
            email: data.email || '',
            country: data.country || '',
            languages: data.languages || [],
            platforms: data.platforms || [],
            followerCount: data.follower_count || '',
            hasAgency: data.has_agency || false,
            contentRights: data.content_rights || 'myself',
            agreedToTerms: data.agreed_to_terms || false
          });
        }
      } catch (error) {
        console.error("Error loading application data:", error);
      }
    };
    
    loadExistingApplication();
  }, [user]);

  // Store each update in state so we have a complete record for submission
  const updateProfileData = (data: Partial<CreatorApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }));
    console.log("Profile data updated:", data);
  };

  const updateAgencyData = (data: Partial<CreatorApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }));
    console.log("Agency data updated:", data);
  };

  const updateIPRightsData = (data: Partial<CreatorApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }));
    console.log("IP Rights data updated:", data);
  };

  const updateTermsData = (data: Partial<CreatorApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }));
    console.log("Terms data updated:", data);
  };

  const submitApplication = async () => {
    // Validate required fields
    if (!applicationData.influencer_name || 
        !applicationData.email || 
        !applicationData.country || 
        applicationData.platforms.length === 0) {
      toast.error("Please complete all required profile information");
      navigate('/join/profile');
      return;
    }
    
    if (!applicationData.agreedToTerms) {
      toast.error("You must agree to the terms to submit your application");
      navigate('/join/terms');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare application data - user_id will be null for non-logged in users
      const applicationForSubmission = {
        user_id: user?.id || null,
        influencer_name: applicationData.influencer_name,
        email: applicationData.email,
        country: applicationData.country,
        languages: applicationData.languages,
        platforms: applicationData.platforms,
        follower_count: applicationData.followerCount,
        has_agency: applicationData.hasAgency,
        content_rights: applicationData.contentRights,
        agreed_to_terms: applicationData.agreedToTerms,
        status: 'pending', // Explicitly set status
        updated_at: new Date().toISOString() // Force timestamp update to trigger realtime
      };
      
      console.log("Submitting application with data:", applicationForSubmission);
      
      // If user is logged in, check for existing application
      let result;
      
      if (user) {
        const { data: existingApp } = await supabase
          .from('creator_applications')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (existingApp?.id) {
          // Update existing application
          result = await supabase
            .from('creator_applications')
            .update(applicationForSubmission)
            .eq('id', existingApp.id)
            .select();
        } else {
          // Create new application
          result = await supabase
            .from('creator_applications')
            .insert([applicationForSubmission])
            .select();
        }
      } else {
        // For non-logged in users, always create a new application
        result = await supabase
          .from('creator_applications')
          .insert([applicationForSubmission])
          .select();
      }
      
      if (result.error) {
        throw result.error;
      }
      
      console.log("Submission successful, received data:", result.data);
      toast.success("Application submitted successfully!");
      
      // Store the timestamp to trigger realtime updates across the site
      localStorage.setItem('creatorProfileLastUpdated', new Date().toISOString());
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error: any) {
      toast.error(`Failed to submit application: ${error.message}`);
      console.error("Error submitting application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreatorApplicationContext.Provider value={{
      applicationData,
      updateProfileData,
      updateAgencyData,
      updateIPRightsData,
      updateTermsData,
      submitApplication,
      isSubmitting
    }}>
      {children}
    </CreatorApplicationContext.Provider>
  );
};
