import React, { useState, useEffect } from 'react';
import { User, Save, Globe, DollarSign, Clock, Upload, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VideoUploader from '@/components/VideoUploader';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from '@/components/ui/use-toast';
import ProfileSyncNotice from '@/components/ProfileSyncNotice';
import { useProfileSync } from '@/hooks/useProfileSync';

// Define a type for the profile data
interface ProfileData {
  influencer_name: string;
  bio: string | null;
  price: number;
  turnaround_time: number;
  is_available: boolean;
  country: string;
  languages: string[];
  specialties: string[];
  work_with_agency: boolean;
  agency_name?: string;
  profile_image_url?: string | null;
  intro_video_url?: string | null;
}

// Extended Creator Application Type that includes our new fields
interface ExtendedCreatorApplication {
  agreed_to_terms: boolean;
  bio: string;
  content_rights: string;
  country: string;
  created_at: string;
  email: string;
  follower_count: string;
  has_agency: boolean;
  id: string;
  influencer_name: string;
  is_available: boolean;
  languages: string[];
  platforms: string[];
  price: number;
  status: string;
  turnaround_time: number;
  updated_at: string;
  user_id: string;
  profile_image_url?: string | null;
  intro_video_url?: string | null;
}

const ProfileSettings = () => {
  const { user } = useAuth();
  const { syncProfiles, isSyncing } = useProfileSync();
  
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    influencer_name: '',
    bio: '',
    price: 0,
    turnaround_time: 3,
    is_available: true,
    country: 'United States',
    languages: ['English'],
    specialties: ['Comedy'],
    work_with_agency: false,
    agency_name: '',
    profile_image_url: null,
    intro_video_url: null,
  });
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('creator_applications')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          // Cast the data to our extended type to handle the new fields
          const creatorData = data as unknown as ExtendedCreatorApplication;
          
          // Use TypeScript casting to ensure we handle fields correctly
          const contentTypes = creatorData.platforms ? creatorData.platforms : ['Comedy'];
          
          setProfileData({
            influencer_name: creatorData.influencer_name || '',
            bio: creatorData.bio || '',
            price: creatorData.price || 0,
            turnaround_time: creatorData.turnaround_time || 3,
            is_available: creatorData.is_available !== false,
            country: creatorData.country || 'United States',
            languages: creatorData.languages || ['English'],
            specialties: contentTypes,
            work_with_agency: creatorData.has_agency || false,
            agency_name: creatorData.content_rights || '', // Using content_rights field temporarily as agency_name
            profile_image_url: creatorData.profile_image_url || null,
            intro_video_url: creatorData.intro_video_url || null,
          });
          
          // Store creator name and ID in local storage for other components
          localStorage.setItem('creatorName', data.influencer_name);
          localStorage.setItem('creatorId', data.id);
          localStorage.setItem('creatorProfileLastUpdated', new Date().toISOString());
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleToggleChange = (checked: boolean) => {
    setProfileData(prev => ({ ...prev, is_available: checked }));
  };

  const handleAgencyToggle = (checked: boolean) => {
    setProfileData(prev => ({ ...prev, work_with_agency: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      // Create an update object that only includes standard fields
      const updateData: any = {
        influencer_name: profileData.influencer_name,
        bio: profileData.bio,
        price: profileData.price,
        turnaround_time: profileData.turnaround_time,
        is_available: profileData.is_available,
        country: profileData.country,
        languages: profileData.languages,
        platforms: profileData.specialties, // Use platforms instead of content_type
        has_agency: profileData.work_with_agency,
        content_rights: profileData.work_with_agency ? profileData.agency_name : null, // Store agency_name in content_rights
        updated_at: new Date().toISOString() // Force update timestamp
      };
      
      // Add the new fields if they exist
      if (profileData.profile_image_url) {
        updateData.profile_image_url = profileData.profile_image_url;
      }
      
      if (profileData.intro_video_url) {
        updateData.intro_video_url = profileData.intro_video_url;
      }
      
      const { error } = await supabase
        .from('creator_applications')
        .update(updateData)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile settings have been saved successfully.",
      });
      
      // Update creator name in local storage
      localStorage.setItem('creatorName', profileData.influencer_name);
      localStorage.setItem('creatorProfileLastUpdated', new Date().toISOString());
      
      // Sync profile data across the application
      await syncProfiles();

      // Force a refresh to ensure all components get the latest data
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 100);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Profile image must be smaller than 5MB."
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)."
      });
      return;
    }
    
    setImageUploading(true);
    try {
      // Get creator id from local storage or fetch it if not available
      let creatorId = localStorage.getItem('creatorId');
      if (!creatorId) {
        const { data: creatorData } = await supabase
          .from('creator_applications')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (creatorData) {
          creatorId = creatorData.id;
          localStorage.setItem('creatorId', creatorId);
        } else {
          throw new Error("Creator ID not found");
        }
      }
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${creatorId}-${Date.now()}.${fileExt}`;
      const filePath = `${creatorId}/${fileName}`;
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('creator-profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase
        .storage
        .from('creator-profiles')
        .getPublicUrl(filePath);
      
      // Update the profile data in state
      setProfileData(prev => ({ ...prev, profile_image_url: urlData.publicUrl }));
      
      // Update the creator_applications table directly
      const { error: updateError } = await supabase
        .from('creator_applications')
        .update({ profile_image_url: urlData.publicUrl })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Upload successful",
        description: "Your profile image has been updated."
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "There was a problem uploading your image."
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Handle intro video upload success
  const handleVideoSuccess = async (videoUrl: string) => {
    setProfileData(prev => ({ ...prev, intro_video_url: videoUrl }));
    
    // Update the creator_applications table directly
    if (user) {
      // Use an any type for the update data to avoid TypeScript errors
      const updateData: any = { 
        intro_video_url: videoUrl,
        updated_at: new Date().toISOString() // Force update timestamp
      };
      
      const { error } = await supabase
        .from('creator_applications')
        .update(updateData)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error updating intro video URL:', error);
        toast({
          variant: "destructive",
          title: "Update failed",
          description: "There was a problem saving your intro video."
        });
      } else {
        toast({
          title: "Intro video updated",
          description: "Your intro video has been saved successfully."
        });
        
        // Sync profile data across the application
        await syncProfiles();
        
        // Force a refresh to ensure all components get the latest data
        setTimeout(() => {
          window.dispatchEvent(new Event('storage'));
        }, 100);
      }
    }
  };

  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Portuguese', 'Italian', 'Russian', 'Other'];
  const specialties = ['Comedy', 'Lifestyle', 'Gaming', 'Beauty', 'Fashion', 'Fitness', 'Food', 'Travel', 'Technology', 'Education', 'Entertainment', 'Other'];
  
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Profile Settings</h1>
      <p className="text-sm text-gray-600 mb-6">Manage your personal information and preferences.</p>
      
      {/* Add Profile Sync Notice */}
      <ProfileSyncNotice />
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poppi-purple"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Media Section */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Media</h2>
            <p className="text-xs text-gray-500 mb-6">Upload your profile image and intro video.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Image */}
              <div>
                <h3 className="font-medium mb-3">Profile Image</h3>
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 relative mb-4 rounded-full overflow-hidden border-4 border-gray-200">
                    {profileData.profile_image_url ? (
                      <img 
                        src={profileData.profile_image_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <User className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex items-center"
                      disabled={imageUploading}
                      onClick={() => document.getElementById('profile-image-upload')?.click()}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      {imageUploading ? "Uploading..." : "Upload New Image"}
                    </Button>
                    <input
                      type="file"
                      id="profile-image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image, at least 500x500px
                  </p>
                </div>
              </div>
              
              {/* Intro Video */}
              <div>
                <h3 className="font-medium mb-3">Intro Video</h3>
                <div className="flex flex-col">
                  {profileData.intro_video_url ? (
                    <div className="mb-4">
                      <AspectRatio ratio={16/9} className="bg-black overflow-hidden rounded-md">
                        <video 
                          src={profileData.intro_video_url} 
                          controls 
                          className="w-full h-full object-contain"
                        />
                      </AspectRatio>
                    </div>
                  ) : (
                    <div className="mb-4 bg-gray-100 rounded-md flex items-center justify-center aspect-video">
                      <Video className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  <div>
                    <VideoUploader 
                      inline={true}
                      onUploadSuccess={(videoUrl) => handleVideoSuccess(videoUrl)}
                      creatorName={profileData.influencer_name}
                    />
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: 30-60 second video introducing yourself to fans
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Basic Information */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <p className="text-xs text-gray-500 mb-4">Your core profile details and information.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="influencer_name">Creator Name</Label>
                <Input
                  id="influencer_name"
                  name="influencer_name"
                  value={profileData.influencer_name}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  readOnly
                  className="mt-1 bg-gray-100"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profileData.bio || ''}
                onChange={handleChange}
                placeholder="I'm a professional creator with 10 years of experience. I specialize in birthday messages, congratulations, and motivational videos."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          
          {/* Location & Language */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Location & Language</h2>
            <p className="text-xs text-gray-500 mb-4">Where you're based and languages you speak.</p>
            
            <div className="mb-4">
              <Label htmlFor="country">Your Country</Label>
              <Select 
                value={profileData.country} 
                onValueChange={(value) => handleSelectChange('country', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block mb-2">Languages You Speak or Can Record In</Label>
              <p className="text-xs text-gray-500 mb-2">Select all that apply to your profile.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {languages.map(language => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`language-${language}`} 
                      checked={profileData.languages.includes(language)} 
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setProfileData(prev => ({
                            ...prev,
                            languages: [...prev.languages, language]
                          }));
                        } else {
                          setProfileData(prev => ({
                            ...prev,
                            languages: prev.languages.filter(lang => lang !== language)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`language-${language}`} className="text-sm">{language}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Content Specialties */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Content Specialties</h2>
            <p className="text-xs text-gray-500 mb-4">What type of content do you create?</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {specialties.map(specialty => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`specialty-${specialty}`} 
                    checked={profileData.specialties.includes(specialty)} 
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setProfileData(prev => ({
                          ...prev,
                          specialties: [...prev.specialties, specialty]
                        }));
                      } else {
                        setProfileData(prev => ({
                          ...prev,
                          specialties: prev.specialties.filter(spec => spec !== specialty)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={`specialty-${specialty}`} className="text-sm">{specialty}</Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Agency & IP Rights */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Agency & IP Rights</h2>
            <p className="text-xs text-gray-500 mb-4">Information about talent representation and IP rights.</p>
            
            <div className="mb-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="agency" 
                  checked={profileData.work_with_agency}
                  onCheckedChange={handleAgencyToggle}
                />
                <Label htmlFor="agency">Yes, I'm affiliated with an agency</Label>
              </div>
            </div>
            
            {profileData.work_with_agency && (
              <div className="mb-4 ml-6 border-l-2 border-gray-200 pl-4">
                <Label htmlFor="agency_name">Agency Information</Label>
                <Input
                  id="agency_name"
                  name="agency_name"
                  value={profileData.agency_name || ''}
                  onChange={handleChange}
                  placeholder="Agency name"
                  className="mt-1"
                />
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">IP Rights</h3>
              <p className="text-xs text-gray-500 mb-2">I acknowledge that I am solely responsible for any legal issues related to the content/material I use.</p>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="ip-rights" defaultChecked disabled />
                <Label htmlFor="ip-rights" className="text-sm">I have the rights to all content I share</Label>
              </div>
            </div>
          </div>
          
          {/* Pricing & Terms */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Pricing & Terms</h2>
            <p className="text-xs text-gray-500 mb-4">Set your base price for custom videos.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="price">Standard Video Price ($)</Label>
                <div className="mt-1 relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={profileData.price}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="turnaround_time">Standard Turnaround Time (days)</Label>
                <div className="mt-1 relative">
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="turnaround_time"
                    name="turnaround_time"
                    type="number"
                    min="1"
                    max="14"
                    value={profileData.turnaround_time}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div>
                <h3 className="font-medium">Available for Bookings</h3>
                <p className="text-sm text-gray-500">Toggle off to temporarily stop receiving new requests</p>
              </div>
              <Switch 
                checked={profileData.is_available} 
                onCheckedChange={handleToggleChange}
              />
            </div>
          </div>
          
          {/* Legal Agreement */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Required Agreements</h2>
            
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox id="terms-agreement" defaultChecked disabled />
              <Label htmlFor="terms-agreement" className="text-sm">
                I agree to the <span className="text-poppi-purple">Terms of Service</span> and <span className="text-poppi-purple">Privacy Policy</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="content-agreement" defaultChecked disabled />
              <Label htmlFor="content-agreement" className="text-sm">
                I have the rights to all content I share on this platform
              </Label>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="bg-poppi-purple hover:bg-poppi-light-purple px-8">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileSettings;
