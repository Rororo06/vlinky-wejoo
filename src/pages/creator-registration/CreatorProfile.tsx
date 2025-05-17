
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StepIndicator from '@/components/StepIndicator';
import { useCreatorApplication } from '@/contexts/CreatorApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { countries } from '@/data/countries';
import { platforms } from '@/data/platforms';
import { languages } from '@/data/languages';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

const CreatorProfile = () => {
  const { applicationData, updateProfileData } = useCreatorApplication();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [influencerName, setInfluencerName] = useState(applicationData.influencer_name || '');
  const [email, setEmail] = useState(applicationData.email || '');
  const [country, setCountry] = useState(applicationData.country || '');
  const [selectedLanguages, setSelectedLanguages] = useState(applicationData.languages || []);
  const [selectedPlatforms, setSelectedPlatforms] = useState(applicationData.platforms || []);
  const [followerCount, setFollowerCount] = useState(applicationData.followerCount || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Update local state from context
    setInfluencerName(applicationData.influencer_name || '');
    setEmail(applicationData.email || user?.email || '');
    setCountry(applicationData.country || '');
    setSelectedLanguages(applicationData.languages || []);
    setSelectedPlatforms(applicationData.platforms || []);
    setFollowerCount(applicationData.followerCount || '');
    
    // If user is authenticated, check for existing application
    if (user) {
      checkExistingApplication();
    }
  }, [applicationData, user]);

  const checkExistingApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('creator_applications')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" - not an actual error for us
          console.error('Error fetching application:', error);
        }
        return;
      }
      
      if (data) {
        // If application found, populate form
        setInfluencerName(data.influencer_name || '');
        setEmail(data.email || user?.email || '');
        setCountry(data.country || '');
        setSelectedLanguages(data.languages || []);
        setSelectedPlatforms(data.platforms || []);
        setFollowerCount(data.follower_count || '');
        
        // Update context
        updateProfileData({
          influencer_name: data.influencer_name,
          email: data.email,
          country: data.country,
          languages: data.languages || [],
          platforms: data.platforms || [],
          followerCount: data.follower_count
        });
      }
    } catch (error) {
      console.error('Error checking for existing application:', error);
    }
  };

  const saveToSupabase = async () => {
    try {
      setIsLoading(true);
      
      // Build profile data - user_id will be null for non-logged in users
      const profileData = {
        user_id: user?.id || null,
        influencer_name: influencerName,
        email: email,
        country: country,
        languages: selectedLanguages,
        platforms: selectedPlatforms,
        follower_count: followerCount,
      };
      
      console.log("Saving to Supabase:", profileData);

      let result;
      
      // Only check for existing application if user is logged in
      if (user) {
        // Check if application already exists
        const { data: existingApp } = await supabase
          .from('creator_applications')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (existingApp?.id) {
          // Update existing application
          result = await supabase
            .from('creator_applications')
            .update(profileData)
            .eq('id', existingApp.id);
        } else {
          // Create new application
          result = await supabase
            .from('creator_applications')
            .insert([profileData]);
        }
      } else {
        // For non-logged in users, always create a new temporary record
        // We'll associate it with their account if they login/register later
        result = await supabase
          .from('creator_applications')
          .insert([profileData]);
      }
      
      if (result.error) {
        console.error("Supabase error:", result.error);
        toast.error(`Error saving profile: ${result.error.message}`);
        return false;
      }
      
      toast.success("Profile saved successfully");
      return true;
    } catch (error: any) {
      console.error("Error saving to Supabase:", error);
      toast.error(`Error saving profile: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // Validate required fields
    if (!influencerName.trim()) {
      toast.error("Please enter your influencer name");
      return;
    }
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    if (!country) {
      toast.error("Please select your country");
      return;
    }
    
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }
    
    // Update context with current state
    updateProfileData({
      influencer_name: influencerName,
      email,
      country,
      languages: selectedLanguages,
      platforms: selectedPlatforms,
      followerCount
    });

    // Save to Supabase
    const saved = await saveToSupabase();
    
    if (saved) {
      console.log("Updated profile data:", {
        influencer_name: influencerName,
        email,
        country,
        languages: selectedLanguages,
        platforms: selectedPlatforms,
        followerCount
      });
      navigate('/join/agency');
    }
  };

  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  // Determine if email field should be read-only
  const isEmailReadOnly = user?.email ? true : false;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-poppi-light-bg py-10">
        <div className="section-container">
          <StepIndicator currentStep={1} />
          
          <Card className="max-w-3xl mx-auto mt-8 p-8">
            <h2 className="text-2xl font-bold mb-4">Creator Profile</h2>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="influencerName">Influencer Name*</Label>
                <Input 
                  type="text"
                  id="influencerName"
                  placeholder="Enter your influencer name"
                  value={influencerName}
                  onChange={(e) => setInfluencerName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address*</Label>
                <Input 
                  type="email"
                  id="email"
                  placeholder="Enter your email address"
                  value={user?.email || email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly={isEmailReadOnly}
                  className={isEmailReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}
                />
                {isEmailReadOnly && (
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed as you're logged in with this email</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="country">Country*</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((language) => (
                    <div key={language} className="space-x-2 flex items-center">
                      <Checkbox
                        id={`language-${language}`}
                        checked={selectedLanguages.includes(language)}
                        onCheckedChange={() => toggleLanguage(language)}
                      />
                      <Label htmlFor={`language-${language}`}>{language}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Platforms*</Label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform) => (
                    <div key={platform} className="space-x-2 flex items-center">
                      <Checkbox
                        id={`platform-${platform}`}
                        checked={selectedPlatforms.includes(platform)}
                        onCheckedChange={() => togglePlatform(platform)}
                      />
                      <Label htmlFor={`platform-${platform}`}>{platform}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="followerCount">Follower Count</Label>
                <Input 
                  type="number"
                  id="followerCount"
                  placeholder="Enter your follower count"
                  value={followerCount}
                  onChange={(e) => setFollowerCount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={handleNext} disabled={isLoading}>
                {isLoading ? "Saving..." : "Next: Agency"}
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 mt-2">* Required fields</div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatorProfile;
