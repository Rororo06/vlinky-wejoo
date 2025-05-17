import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DollarSign, 
  Star, 
  Video,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CreatorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creatorData, setCreatorData] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        // Get creator data from localStorage or fetch from Supabase if needed
        const creatorId = localStorage.getItem('creatorId');
        const creatorName = localStorage.getItem('creatorName');
        
        if (!creatorId || !creatorName) {
          // If creator info is not in localStorage, fetch from Supabase
          if (!user) {
            throw new Error("User not authenticated");
          }

          // Try to find by user_id first
          let { data, error } = await supabase
            .from('creator_applications')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .maybeSingle();
            
          // If not found by user_id, try by email
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
            throw error;
          }
          
          if (data) {
            setCreatorData(data);
            localStorage.setItem('creatorId', data.id);
            localStorage.setItem('creatorName', data.influencer_name);
          }
        } else {
          // Use localStorage data if available
          setCreatorData({
            id: creatorId,
            influencer_name: creatorName
          });
        }
        
        // After setting creator data, fetch dashboard data
        await fetchDashboardData(creatorId || (creatorData && creatorData.id));
        
      } catch (error) {
        console.error('Error fetching creator data:', error);
        toast({
          variant: "destructive",
          title: "Failed to load",
          description: "Could not load creator dashboard data."
        });
        setLoading(false);
      }
    };
    
    fetchCreatorData();
  }, [user, toast]);
  
  const fetchDashboardData = async (creatorId: string) => {
    if (!creatorId) {
      setLoading(false);
      return;
    }
    
    try {
      // Fetch pending requests count
      const { data: pendingRequestsData, error: pendingError } = await supabase
        .from('video_requests')
        .select('id', { count: 'exact' })
        .eq('creator_id', creatorId)
        .eq('status', 'pending');
        
      if (!pendingError) {
        setPendingRequests(pendingRequestsData?.length || 0);
      }
      
      // Fetch recent requests
      const { data: recentRequestsData, error: recentError } = await supabase
        .from('video_requests')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (!recentError && recentRequestsData) {
        setRecentRequests(recentRequestsData);
      }
      
      // Simulate loading for demo purposes
      setTimeout(() => {
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poppi-purple"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {creatorData?.influencer_name || 'Creator'}!</h1>
      <p className="text-gray-600 mb-8">Here's an overview of your creator dashboard.</p>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Pending Requests Card */}
        <Card className="p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-700">Pending Requests</h3>
            <Video className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="mb-2">
            <p className="text-3xl font-bold">{pendingRequests}</p>
            <p className="text-sm text-gray-500">{pendingRequests} {pendingRequests === 1 ? 'request' : 'requests'} waiting for your response</p>
          </div>
          
          <Button variant="ghost" className="mt-4 w-full justify-between text-gray-700" onClick={() => window.location.href = '/creator/requests'}>
            View all requests
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
        
        {/* Total Revenue Card */}
        <Card className="p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-700">Total Revenue</h3>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="mb-2">
            <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Lifetime earnings</p>
          </div>
          
          <Button variant="ghost" className="mt-4 w-full justify-between text-gray-700" onClick={() => window.location.href = '/creator/revenue'}>
            View revenue details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
        
        {/* Average Rating Card */}
        <Card className="p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-700">Average Rating</h3>
            <Star className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="mb-2">
            <p className="text-3xl font-bold">{averageRating}/5</p>
            <p className="text-sm text-gray-500">Based on {reviewCount} reviews</p>
          </div>
          
          <Button variant="ghost" className="mt-4 w-full justify-between text-gray-700" onClick={() => window.location.href = '/creator/reviews'}>
            View all reviews
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
      
      {/* Recent Items - Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Requests Column */}
        <Card className="p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Recent Requests</h2>
          <p className="text-gray-500 mb-6 text-sm">Requests from the past 7 days</p>
          
          {recentRequests.length > 0 ? (
            <div className="space-y-4 mb-4">
              {recentRequests.map(request => (
                <div key={request.id} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">{request.fan_name}</span>
                    <Badge className={getStatusBadgeClass(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{request.request_details || 'No details provided'}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(request.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-6 py-8 text-center">
              <p className="text-gray-500">No requests in the past 7 days</p>
            </div>
          )}
          
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/creator/requests'}>
            View all requests
          </Button>
        </Card>
        
        {/* Recent Reviews Column */}
        <Card className="p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Recent Reviews</h2>
          <p className="text-gray-500 mb-6 text-sm">Latest feedback from your fans</p>
          
          <div className="mb-6 py-8 text-center">
            <p className="text-gray-500">No reviews yet</p>
          </div>
          
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/creator/reviews'}>
            View all reviews
          </Button>
        </Card>
      </div>
    </div>
  );
};

// Helper function to get status badge class
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'declined':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default CreatorDashboard;
