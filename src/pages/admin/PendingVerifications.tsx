
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

type Application = {
  id: string;
  user_id: string | null;
  influencer_name: string;
  email: string;
  country: string;
  languages: string[];
  platforms: string[];
  follower_count: string;
  has_agency: boolean;
  content_rights: string;
  agreed_to_terms: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

const PendingVerifications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const fetchApplications = async () => {
    console.log("Fetching applications...");
    setLoading(true);
    try {
      // Specifically target pending applications
      const { data, error } = await supabase
        .from('creator_applications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("Fetched applications data:", data);
      
      // Ensure the status property conforms to the Application type by casting
      if (data) {
        const typedApplications: Application[] = data.map(app => ({
          ...app,
          status: app.status as 'pending' | 'approved' | 'rejected'
        }));
        setApplications(typedApplications);
      } else {
        setApplications([]);
      }

    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast.error(`Failed to load applications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchApplications();

    // Set up real-time subscription
    const channel = supabase
      .channel('pending-applications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'creator_applications' },
        (payload) => {
          console.log("Real-time event received:", payload);
          fetchApplications(); // Refresh the data when changes occur
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('creator_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'}.`);
      fetchApplications(); // Refresh the list
    } catch (error: any) {
      toast.error(`Failed to update application: ${error.message}`);
    }
  };

  const toggleExpandRow = (id: string) => {
    if (expandedRowId === id) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(id);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Pending Verifications</h1>
        
        <Card className="bg-[#0e0e0e] p-6 border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Creator Applications</h2>
              <p className="text-gray-400">
                Review and approve pending creator applications
              </p>
            </div>
            <Button 
              variant="outline" 
              className="bg-gray-800 text-white border-gray-700"
              onClick={fetchApplications}
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center p-8">
              <Clock className="animate-spin h-8 w-8 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-500">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-700 rounded-md">
              <p className="text-gray-400">No pending applications found</p>
              <p className="text-gray-500 text-sm mt-2">Applications will appear here when creators submit them</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-800">
                  <TableHead className="text-gray-400 w-8"></TableHead>
                  <TableHead className="text-gray-400">Creator</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Country</TableHead>
                  <TableHead className="text-gray-400">Platforms</TableHead>
                  <TableHead className="text-gray-400">Submitted</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <React.Fragment key={app.id}>
                    <TableRow className="border-b border-gray-800">
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-6 w-6"
                          onClick={() => toggleExpandRow(app.id)}
                        >
                          {expandedRowId === app.id ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {app.influencer_name || 'Unnamed'}
                      </TableCell>
                      <TableCell className="text-gray-200">{app.email}</TableCell>
                      <TableCell className="text-gray-200">{app.country}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {app.platforms?.map((platform) => (
                            <Badge key={platform} variant="secondary" className="bg-gray-800 text-gray-300">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {app.created_at ? format(new Date(app.created_at), 'MMM d, yyyy') : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-800/30 hover:bg-green-800/50 text-white"
                            onClick={() => updateStatus(app.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-red-900/20 hover:bg-red-900/30 text-white border-red-800/50"
                            onClick={() => updateStatus(app.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRowId === app.id && (
                      <TableRow className="bg-gray-900/50">
                        <TableCell colSpan={7} className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium text-gray-400 mb-1">Languages</h4>
                              <p className="text-gray-300">
                                {app.languages && app.languages.length > 0 
                                  ? app.languages.join(', ') 
                                  : 'None specified'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-400 mb-1">Follower Count</h4>
                              <p className="text-gray-300">{app.follower_count || 'Not specified'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-400 mb-1">Has Agency</h4>
                              <p className="text-gray-300">{app.has_agency ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-400 mb-1">Content Rights</h4>
                              <p className="text-gray-300">{app.content_rights || 'Not specified'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-400 mb-1">Terms Agreed</h4>
                              <p className="text-gray-300">{app.agreed_to_terms ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-400 mb-1">User Account</h4>
                              <p className="text-gray-300">
                                {app.user_id ? 'Registered User' : 'Guest Application'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PendingVerifications;
