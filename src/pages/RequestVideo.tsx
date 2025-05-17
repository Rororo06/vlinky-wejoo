
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface Creator {
  id: string;
  influencer_name: string;
  price: number;
  expressDelivery?: boolean;
  longerVideos?: boolean;
  specialties?: string[];
}

const RequestVideo = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Dialog state
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isForSelf, setIsForSelf] = useState(true);
  const [recipientName, setRecipientName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [instructions, setInstructions] = useState('');
  const [keepPrivate, setKeepPrivate] = useState(true);
  const [expressDelivery, setExpressDelivery] = useState(false);
  const [longerVideo, setLongerVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is logged in when the page loads
  useEffect(() => {
    // Only show the dialog if the user comes directly to this page
    // and is not logged in
    if (!user) {
      setShowLoginDialog(true);
    }
  }, [user]);
  
  // Fetch creator data from Supabase
  const { data: creator, isLoading } = useQuery({
    queryKey: ['creator', creatorId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('creator_applications')
          .select('*')
          .eq('id', creatorId)
          .eq('status', 'approved')
          .single();
        
        if (error) throw error;
        
        // If creator data exists, return it
        if (data) {
          return {
            id: data.id,
            influencer_name: data.influencer_name,
            price: data.price || 35, // Use default price if not set
            expressDelivery: true, // Assuming these features are enabled
            longerVideos: true,
            specialties: data.platforms || ['Content Creation']
          };
        }
        
        throw new Error('Creator not found');
      } catch (error) {
        console.error('Error fetching creator:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load creator information. Please try again.",
        });
        return {
          id: '1',
          influencer_name: 'Creator',
          price: 35,
          expressDelivery: true,
          longerVideos: true,
          specialties: ['Content Creation']
        };
      }
    }
  });
  
  // Initialize email with user's email if logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);
  
  // Calculate total price
  const calculateTotal = () => {
    if (!creator) return 0;
    
    let total = creator.price;
    if (expressDelivery) total += 17.50;
    if (longerVideo) total += 17.50;
    return total;
  };
  
  const handleLogin = () => {
    // Redirect to login page with return URL
    navigate('/login', { state: { from: `/request-video/${creatorId}` } });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in first
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    
    if (!creatorId) {
      toast({
        title: "Error",
        description: "Creator ID is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Determine order type based on options
      let orderType = 'standard';
      if (expressDelivery) orderType = 'express';
      if (longerVideo) orderType = 'longer video';
      if (expressDelivery && longerVideo) orderType = 'express & longer';
      
      // Get deadline date (7 days for standard, 1 day for express)
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (expressDelivery ? 1 : 7));
      
      console.log("Submitting request with data:", {
        creator_id: creatorId,
        fan_name: name,
        fan_id: user?.id || null,
        email: email,
        recipient_name: isForSelf ? name : recipientName,
        order_type: orderType,
        deadline: deadline.toISOString().split('T')[0],
        request_details: instructions,
        is_private: keepPrivate,
        status: 'pending',
        total_price: calculateTotal()
      });
      
      // Insert the request into Supabase
      const { data, error } = await supabase
        .from('video_requests')
        .insert([
          {
            creator_id: creatorId,
            fan_name: name,
            fan_id: user?.id || null,
            email: email,
            recipient_name: isForSelf ? name : recipientName,
            order_type: orderType,
            deadline: deadline.toISOString().split('T')[0],
            request_details: instructions,
            is_private: keepPrivate,
            status: 'pending',
            total_price: calculateTotal()
          }
        ]);
      
      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      // Success message
      toast({
        title: "Request Submitted!",
        description: "Your video request has been sent to the creator.",
      });
      
      // Redirect to home page
      navigate('/');
      
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/find-influencers" className="text-purple-600 hover:text-purple-700 mb-4 inline-flex items-center">
            ← Back to Creator
          </Link>
          
          <h1 className="text-3xl font-bold mb-8">Request a Video from {creator?.influencer_name}</h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main form */}
            <div className="lg:w-2/3">
              <form onSubmit={handleSubmit}>
                {/* Your Information */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
                  <h2 className="text-xl font-semibold mb-4">Your Information</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Enter your name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="font-medium mb-2">This video is for...</p>
                    <RadioGroup value={isForSelf ? "myself" : "someone"} onValueChange={(value) => setIsForSelf(value === "myself")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="myself" id="myself" />
                        <Label htmlFor="myself">Myself</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="someone" id="someone" />
                        <Label htmlFor="someone">Someone else</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {!isForSelf && (
                    <div>
                      <Label htmlFor="recipient">Recipient's Name</Label>
                      <Input 
                        id="recipient" 
                        placeholder="Who is this video for?" 
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave blank if it's for yourself</p>
                    </div>
                  )}
                </div>
                
                {/* Video Details */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
                  <h2 className="text-xl font-semibold mb-4">Video Details</h2>
                  
                  <div className="mb-4">
                    <Label htmlFor="occasion">Occasion</Label>
                    <Select value={occasion} onValueChange={setOccasion}>
                      <SelectTrigger id="occasion" className="w-full">
                        <SelectValue placeholder="Select an occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="congratulations">Congratulations</SelectItem>
                        <SelectItem value="just_because">Just Because</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea 
                      id="instructions" 
                      placeholder={`What would you like ${creator?.influencer_name} to say or do in the video?`}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="h-32"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Be specific about what you'd like included in the video. The more details you provide, the better!</p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="private" 
                      checked={keepPrivate}
                      onCheckedChange={(checked) => setKeepPrivate(checked as boolean)}
                    />
                    <div>
                      <Label htmlFor="private" className="font-medium">Keep this video private</Label>
                      <p className="text-xs text-gray-500">If unchecked, the creator and VLNKY may share this video on their social media</p>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Options */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
                  <h2 className="text-xl font-semibold mb-4">Delivery Options</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">Standard Delivery</p>
                      <p className="text-sm text-gray-600">Delivered in 7 days</p>
                      <p className="font-medium mt-2">${creator?.price.toFixed(2)}</p>
                    </div>
                    
                    {creator?.expressDelivery && (
                      <div className="p-4 bg-blue-50 rounded-lg flex items-start">
                        <Checkbox 
                          id="express" 
                          className="mt-1"
                          checked={expressDelivery}
                          onCheckedChange={(checked) => setExpressDelivery(checked as boolean)}
                        />
                        <div className="ml-3 flex-grow">
                          <Label htmlFor="express" className="font-medium">Express Delivery</Label>
                          <p className="text-sm text-gray-600">Delivered in 24 hours</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-medium">+$17.50</span>
                            <span className="text-xs text-gray-500">(+50%)</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {creator?.longerVideos && (
                      <div className="p-4 bg-blue-50 rounded-lg flex items-start">
                        <Checkbox 
                          id="longer" 
                          className="mt-1"
                          checked={longerVideo}
                          onCheckedChange={(checked) => setLongerVideo(checked as boolean)}
                        />
                        <div className="ml-3 flex-grow">
                          <Label htmlFor="longer" className="font-medium">Longer Video (up to 4 minutes)</Label>
                          <p className="text-sm text-gray-600">Standard videos are up to 2 minutes long</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-medium">+$17.50</span>
                            <span className="text-xs text-gray-500">(+50%)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Request Video'}
                </Button>
              </form>
            </div>
            
            {/* Order summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                  <div>
                    <p className="font-medium">{creator?.influencer_name}</p>
                    <p className="text-sm text-gray-600">Personalized Video</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span>Base Price</span>
                    <span>${creator?.price.toFixed(2)}</span>
                  </div>
                  
                  {expressDelivery && (
                    <div className="flex justify-between mb-2">
                      <span>Express Delivery</span>
                      <span>+$17.50</span>
                    </div>
                  )}
                  
                  {longerVideo && (
                    <div className="flex justify-between mb-2">
                      <span>Longer Video</span>
                      <span>+$17.50</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-medium mt-2 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">You'll only be charged if the creator accepts your request</p>
                </div>
                
                {creator?.specialties && creator.specialties.length > 0 && (
                  <div className="mt-6">
                    <p className="font-medium mb-2">Creator Specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.specialties.map((specialty, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-sm rounded">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please log in to request a personalized video from {creator?.influencer_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p>
              You need an account to request videos from creators. 
              Logging in allows you to track your requests and communicate with creators.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowLoginDialog(false)}
            >
              Continue Browsing
            </Button>
            <Button onClick={handleLogin} className="bg-purple-600 hover:bg-purple-700">
              Log In Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestVideo;
