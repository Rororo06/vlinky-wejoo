import React, { useState, useEffect, useCallback } from 'react';
import { Search, Upload, X, Eye, UserCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import VideoUploader from '@/components/VideoUploader';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useProfileSync } from '@/hooks/useProfileSync';
import ProfileSyncNotice from '@/components/ProfileSyncNotice';

interface VideoRequest {
  id: string;
  fan_name: string;
  fan_id: string | null;
  fan_email?: string | null;
  email?: string | null;
  created_at: string;
  order_type: string;
  deadline: string | null;
  status: string;
  request_details: string | null;
  video_url: string | null;
  recipient_name?: string | null;
}

const VideoRequests: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<VideoRequest[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<VideoRequest | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");
  const [creatorData, setCreatorData] = useState<any>(null);
  const [isIntroVideoDialogOpen, setIsIntroVideoDialogOpen] = useState(false);
  const { syncProfiles } = useProfileSync();
  
  // Set up real-time subscription
  useEffect(() => {
    // Run profile sync on component mount
    syncProfiles();
    
    fetchRequests(); // Initial fetch
    fetchCreatorData(); // Get creator profile data
    
    // Set up real-time subscription for new requests
    const channel = supabase
      .channel('video_requests_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'video_requests' }, 
        (payload) => {
          console.log('Video requests change detected:', payload);
          fetchRequests(); // Reload all requests when changes occur
        }
      )
      .subscribe();
      
    // Set up real-time subscription for creator profile updates
    const creatorChannel = supabase
      .channel('creator_profile_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'creator_applications' }, 
        (payload) => {
          console.log('Creator profile change detected:', payload);
          fetchCreatorData(); // Reload creator data when changes occur
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(creatorChannel);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      
      const creatorId = localStorage.getItem('creatorId');
      console.log('Fetching requests for creator ID:', creatorId);
      
      if (!creatorId) {
        console.error('Creator ID not found in local storage');
        setIsLoading(false);
        return;
      }
      
      // Fetch video requests from database
      const { data: requestsData, error: requestsError } = await supabase
        .from('video_requests')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });
      
      if (requestsError) {
        throw requestsError;
      }
      
      console.log('Fetched video requests:', requestsData);
      setRequests(requestsData as VideoRequest[] || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        variant: "destructive",
        title: "Failed to load data",
        description: "There was a problem loading your video requests."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchCreatorData = async () => {
    try {
      const creatorId = localStorage.getItem('creatorId');
      
      if (!creatorId) {
        console.error('Creator ID not found in local storage');
        return;
      }
      
      // Fetch creator data from database
      const { data, error } = await supabase
        .from('creator_applications')
        .select('*')
        .eq('id', creatorId)
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched creator data:', data);
      setCreatorData(data);
    } catch (error) {
      console.error('Error fetching creator data:', error);
      toast({
        variant: "destructive",
        title: "Failed to load profile data",
        description: "There was a problem loading your profile information."
      });
    }
  };
  
  // Handle successful upload for a request
  const handleRequestUploadSuccess = async (videoUrl: string, videoId: string) => {
    if (!selectedRequest) return;
    
    try {
      // Update the video request with the video URL
      const { error } = await supabase
        .from('video_requests')
        .update({ 
          video_url: videoUrl,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);
      
      if (error) throw error;
      
      toast({
        title: "Video uploaded successfully",
        description: "The fan request has been marked as completed.",
      });
      
      // Refresh the requests list
      fetchRequests();
      
      setIsUploadDialogOpen(false);
      setSelectedRequest(null);
      
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update the fan request status."
      });
    }
  };

  // Handle successful upload for intro video
  const handleIntroVideoUploadSuccess = async (videoUrl: string, videoId: string) => {
    try {
      const creatorId = localStorage.getItem('creatorId');
      
      if (!creatorId) {
        console.error('Creator ID not found in local storage');
        return;
      }
      
      // Update the creator profile with the intro video URL
      const { error } = await supabase
        .from('creator_applications')
        .update({ 
          intro_video_url: videoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId);
      
      if (error) throw error;
      
      toast({
        title: "Intro video uploaded successfully",
        description: "Your profile intro video has been updated.",
      });
      
      // Refresh creator data
      fetchCreatorData();
      
      setIsIntroVideoDialogOpen(false);
      
    } catch (error) {
      console.error('Error updating intro video:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update your intro video."
      });
    }
  };
  
  // Open upload dialog for a specific request
  const openUploadForRequest = (request: VideoRequest) => {
    setSelectedRequest(request);
    setIsUploadDialogOpen(true);
  };

  // Decline a request
  const handleDeclineRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('video_requests')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({
        title: "Request declined",
        description: "The fan request has been marked as declined.",
      });
      
      // Refresh the requests list
      fetchRequests();
      
    } catch (error) {
      console.error('Error declining request:', error);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "Could not decline the request."
      });
    }
  };
  
  // Filter requests based on status and search query
  const filteredRequests = React.useMemo(() => {
    if (!requests.length) return [];
    
    return requests.filter(request => {
      // Apply status filter
      if (filter !== 'all' && request.status !== filter) {
        return false;
      }
      
      // Apply search query
      if (searchQuery && !request.fan_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [requests, filter, searchQuery]);
  
  // Get badge styling based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' };
      case 'completed':
        return { label: 'Uploaded', className: 'bg-black text-white' };
      case 'declined':
        return { label: 'Declined', className: 'bg-red-500 text-white' };
      default:
        return { label: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  // Get order type badge styling
  const getOrderTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'express':
        return 'bg-purple-100 text-purple-800';
      case 'express & longer':
        return 'bg-purple-100 text-purple-800';
      case 'standard':
        return 'bg-gray-100 text-gray-800';
      case 'longer video':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="p-8">
      {/* Add Profile Sync Notice */}
      <ProfileSyncNotice />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="requests">Fan Requests</TabsTrigger>
          <TabsTrigger value="introvideo">Profile Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Video Requests</h1>
          
          {/* Filter and Search Bar */}
          <div className="flex justify-between items-center mb-6">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Requests" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Uploaded</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                type="text"
                placeholder="Search requests..."
                className="pl-9 pr-4 py-2 w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Requests Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 bg-gray-50 p-4 border-b border-gray-200 font-medium text-gray-700">
              <div>Fan Name</div>
              <div>Request Date</div>
              <div>Order Type</div>
              <div>Deadline</div>
              <div>Status</div>
              <div>Order Details</div>
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading requests...</p>
              </div>
            )}
            
            {/* Empty State */}
            {!isLoading && filteredRequests.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg font-medium">No requests found</p>
                <p className="mt-1">When fans book you, their requests will appear here.</p>
              </div>
            )}
            
            {/* Requests List */}
            {!isLoading && filteredRequests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              
              return (
                <div key={request.id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 items-center">
                  <div className="text-gray-800">{request.fan_name}</div>
                  <div className="text-gray-600">
                    {new Date(request.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <Badge className={getOrderTypeBadge(request.order_type)}>
                      {request.order_type}
                    </Badge>
                  </div>
                  <div className="text-gray-600">
                    {request.deadline 
                      ? new Date(request.deadline).toLocaleDateString() 
                      : 'No deadline'}
                  </div>
                  <div>
                    <Badge className={statusBadge.className}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {request.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-500 border-red-300 hover:bg-red-50"
                          onClick={() => handleDeclineRequest(request.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => openUploadForRequest(request)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      </>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        if (request.video_url) {
                          window.open(request.video_url, '_blank');
                        } else {
                          // Show request details if no video
                          setSelectedRequest(request);
                          setIsUploadDialogOpen(true);
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="introvideo">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Profile Media</h1>
              <p className="text-gray-600 mb-6">
                Upload your intro video to introduce yourself to fans. This video will be displayed on your profile page.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Intro Video Section */}
              <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Intro Video</h2>
                  <Button 
                    onClick={() => setIsIntroVideoDialogOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {creatorData?.intro_video_url ? 'Update Video' : 'Upload Video'}
                  </Button>
                </div>
                
                {creatorData?.intro_video_url ? (
                  <div className="mt-4">
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <AspectRatio ratio={16/9}>
                        <video 
                          src={creatorData.intro_video_url} 
                          controls 
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Last updated: {new Date(creatorData.updated_at).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <div className="h-48 rounded-lg bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <UserCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No intro video uploaded yet</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile Image Section - Can be expanded later */}
              <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Profile Image</h2>
                  <Button disabled variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                </div>
                
                <div className="h-48 rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <UserCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Profile image upload coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog for uploading video for a specific request */}
      {selectedRequest && (
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Video for {selectedRequest.fan_name}</DialogTitle>
              <DialogDescription>
                Upload a video response for this fan request. Once uploaded, the request will be marked as completed.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Request Details</h4>
                <p className="text-sm text-gray-600">{selectedRequest.request_details || 'No details provided'}</p>
                
                {selectedRequest.recipient_name && selectedRequest.recipient_name !== selectedRequest.fan_name && (
                  <div className="mt-2">
                    <span className="font-medium text-sm">Recipient:</span>
                    <span className="text-sm text-gray-600 ml-1">{selectedRequest.recipient_name}</span>
                  </div>
                )}
                
                <div className="mt-2 text-sm">
                  <span className="font-medium">Requested on:</span>
                  <span className="text-gray-600 ml-1">
                    {new Date(selectedRequest.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mt-1 text-sm">
                  <span className="font-medium">Deadline:</span>
                  <span className="text-gray-600 ml-1">
                    {selectedRequest.deadline 
                      ? new Date(selectedRequest.deadline).toLocaleDateString() 
                      : 'No deadline'}
                  </span>
                </div>
              </div>
            </div>
            
            <VideoUploader 
              onUploadSuccess={handleRequestUploadSuccess}
              requestId={selectedRequest.id} 
              fanEmail={selectedRequest.email || selectedRequest.fan_email || undefined}
              creatorName={localStorage.getItem('creatorName') || 'Creator'}
              inline
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Dialog for uploading intro video */}
      <Dialog open={isIntroVideoDialogOpen} onOpenChange={setIsIntroVideoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Profile Intro Video</DialogTitle>
            <DialogDescription>
              Upload a short video introducing yourself to fans. This will be displayed on your profile page.
            </DialogDescription>
          </DialogHeader>
          
          <VideoUploader 
            onUploadSuccess={handleIntroVideoUploadSuccess}
            requestId={`intro-${localStorage.getItem('creatorId')}`}
            inline
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoRequests;
