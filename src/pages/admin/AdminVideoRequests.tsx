import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Filter, Search, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

// Updated the interface to match the actual data structure from the database
interface VideoRequest {
  id: string;
  creator_id: string;
  fan_id?: string;
  title?: string; // Made optional as it might not be present in all records
  status: string;
  deadline?: string;
  price?: number; // Made optional as it might not be present in all records
  created_at: string;
  creator_name?: string;
  client_name?: string;
  fan_name?: string;
  order_type?: string;
  request_details?: string;
  video_url?: string;
  updated_at?: string;
  client_id?: string; // Made optional as it might not be present in all records
}

interface VideoUpload {
  id: string;
  creator_id: string;
  title: string;
  video_url: string;
  video_id: string;
  status: string;
  created_at: string;
  creator_name?: string;
}

interface Creator {
  id: string;
  influencer_name: string;
}

const AdminVideoRequests = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<VideoRequest[]>([]);
  const [uploads, setUploads] = useState<VideoUpload[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('requests');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // First get all creators to map their names
      const { data: creators, error: creatorsError } = await supabase
        .from('creator_applications')
        .select('id, influencer_name');
      
      if (creatorsError) throw creatorsError;
      
      const creatorMap = new Map<string, string>();
      creators?.forEach((creator: Creator) => {
        creatorMap.set(creator.id, creator.influencer_name);
      });

      // Fetch video requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('video_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (requestsError) throw requestsError;
      
      // Format the requests data with creator names
      const formattedRequests = requestsData?.map(request => ({
        ...request,
        creator_name: creatorMap.get(request.creator_id) || 'Unknown Creator',
        client_name: request.fan_name || 'Unknown Client'
      })) || [];
      
      setRequests(formattedRequests);
      
      // Fetch video uploads
      const { data: uploadsData, error: uploadsError } = await supabase
        .from('video_uploads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (uploadsError) throw uploadsError;
      
      // Format the uploads data with creator names
      const formattedUploads = uploadsData?.map(upload => ({
        ...upload,
        creator_name: creatorMap.get(upload.creator_id) || 'Unknown Creator'
      })) || [];
      
      setUploads(formattedUploads);
      
      // For pagination
      setTotalPages(Math.max(1, Math.ceil(formattedRequests.length / 10)));
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Failed to load data",
        description: "There was a problem loading video requests and uploads."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter the data based on search query
  const filteredRequests = requests.filter(request => 
    request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.creator_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.fan_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUploads = uploads.filter(upload => 
    upload.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    upload.creator_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Video Content</h1>
        <div className="bg-[#0e0e0e] rounded-lg p-6 border border-gray-800">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-6">
              <TabsList className="bg-[#111111] border-gray-700">
                <TabsTrigger value="requests" className="data-[state=active]:bg-[#1a1a1a] text-gray-300">Fan Requests</TabsTrigger>
                <TabsTrigger value="uploads" className="data-[state=active]:bg-[#1a1a1a] text-gray-300">Creator Uploads</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="requests">
              <div className="flex justify-between mb-6">
                <div className="relative w-1/3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input 
                    placeholder="Search requests..." 
                    className="pl-10 bg-[#111111] border-gray-700 text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="border-gray-700 bg-[#111111] text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table className="w-full border-collapse">
                  <TableHeader>
                    <TableRow className="border-b border-gray-800">
                      <TableHead className="text-left py-3 px-4 text-gray-400">Request ID</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Title/Type</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Creator</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Client</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Deadline</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Status</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-gray-400">
                          Loading requests...
                        </TableCell>
                      </TableRow>
                    ) : filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-gray-400">
                          No requests found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request) => (
                        <TableRow key={request.id} className="border-b border-gray-800">
                          <TableCell className="py-3 px-4 text-gray-300">{request.id.slice(0, 8)}...</TableCell>
                          <TableCell className="py-3 px-4 text-gray-300">{request.order_type || request.title || "N/A"}</TableCell>
                          <TableCell className="py-3 px-4 text-gray-300">{request.creator_name}</TableCell>
                          <TableCell className="py-3 px-4 text-gray-300">{request.client_name || request.fan_name}</TableCell>
                          <TableCell className="py-3 px-4 text-gray-300">
                            {request.deadline ? new Date(request.deadline).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              request.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                              request.status === 'completed' ? 'bg-green-900 text-green-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {request.status}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        className="border border-gray-700 bg-[#111111] text-white" 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        aria-disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    <PaginationItem className="flex items-center mx-4 text-gray-400">
                      Page {currentPage} of {totalPages}
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        className="border border-gray-700 bg-[#111111] text-white" 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        aria-disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </TabsContent>
            
            <TabsContent value="uploads">
              <div className="flex justify-between mb-6">
                <div className="relative w-1/3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input 
                    placeholder="Search uploads..." 
                    className="pl-10 bg-[#111111] border-gray-700 text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
                  <p className="text-gray-400 mt-4">Loading videos...</p>
                </div>
              ) : filteredUploads.length === 0 ? (
                <div className="text-center py-10">
                  <Video className="h-10 w-10 text-gray-600 mx-auto" />
                  <p className="text-gray-400 mt-4">No videos found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUploads.map((upload) => (
                    <Card key={upload.id} className="bg-[#111111] border-gray-700 overflow-hidden">
                      <div className="aspect-video bg-[#0a0a0a] relative">
                        {upload.status === 'processing' ? (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Processing...</p>
                          </div>
                        ) : (
                          <video 
                            src={upload.video_url} 
                            controls
                            poster={`https://poppi.b-cdn.net/${upload.video_id}/thumbnail.jpg`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-lg text-white truncate">{upload.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          By {upload.creator_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded on {new Date(upload.created_at).toLocaleDateString()}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            upload.status === 'processing' ? 'bg-yellow-900 text-yellow-300' : 
                            'bg-green-900 text-green-300'
                          }`}>
                            {upload.status === 'processing' ? 'Processing' : 'Ready'}
                          </span>
                          <Button size="sm" variant="outline" className="border-gray-700 text-white hover:bg-gray-800" onClick={() => {
                            navigator.clipboard.writeText(upload.video_url);
                            toast({ title: "Video URL copied to clipboard" });
                          }}>
                            Copy URL
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVideoRequests;
