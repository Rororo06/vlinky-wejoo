
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, CheckCircle, XCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { logActivity } from '@/utils/adminUtils';

type CreatorApplication = {
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
}

const AdminCreators = () => {
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creatorToDelete, setCreatorToDelete] = useState<CreatorApplication | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('creator_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setApplications(data as CreatorApplication[]);
    } catch (error: any) {
      toast.error(`Error fetching applications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    // Set up real-time subscription for new applications
    const channel = supabase
      .channel('creator_applications_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'creator_applications',
      }, (payload) => {
        // Refresh the applications when there's a change
        fetchApplications();
        
        if (payload.eventType === 'INSERT') {
          toast.info("New creator application received!");
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('creator_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status } : app
      ));
      
      // Log the activity
      const creator = applications.find(app => app.id === id);
      await logActivity(
        `Creator application ${status}`, 
        localStorage.getItem('adminEmail'), 
        'Info',
        { 
          creator_id: id, 
          creator_name: creator?.influencer_name,
          creator_email: creator?.email
        }
      );
      
      toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (error: any) {
      toast.error(`Error updating application: ${error.message}`);
    }
  };

  const handleDeleteCreator = async () => {
    if (!creatorToDelete) return;
    
    try {
      const { error } = await supabase
        .from('creator_applications')
        .delete()
        .eq('id', creatorToDelete.id);

      if (error) throw error;
      
      // Update local state to remove the deleted creator
      setApplications(applications.filter(app => app.id !== creatorToDelete.id));
      
      // Log the activity
      await logActivity(
        'Creator deleted', 
        localStorage.getItem('adminEmail'), 
        'Warning',
        { 
          creator_id: creatorToDelete.id, 
          creator_name: creatorToDelete.influencer_name,
          creator_email: creatorToDelete.email
        }
      );
      
      toast.success(`Creator "${creatorToDelete.influencer_name}" has been deleted`);
      setCreatorToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error deleting creator: ${error.message}`);
    }
  };

  const openDeleteDialog = (creator: CreatorApplication) => {
    setCreatorToDelete(creator);
    setDeleteDialogOpen(true);
  };

  const toggleExpandRow = (id: string) => {
    if (expandedRowId === id) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(id);
    }
  };

  const filteredApplications = applications.filter(app => 
    app.influencer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Creators</h1>
        <div className="bg-[#0e0e0e] rounded-lg p-6 border border-gray-800">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Creator Management</h2>
            <p className="text-gray-400">View and manage platform creators and their applications</p>
          </div>
          
          <div className="flex justify-between mb-6">
            <div className="relative w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input 
                placeholder="Search creators..." 
                className="pl-10 bg-[#111111] border-gray-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="border-gray-700 bg-[#111111] text-white"
              onClick={fetchApplications}
            >
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="border-b border-gray-800">
                  <TableHead className="text-left py-3 px-4 text-gray-400 w-8"></TableHead>
                  <TableHead className="text-left py-3 px-4 text-gray-400">Name</TableHead>
                  <TableHead className="text-left py-3 px-4 text-gray-400">Email</TableHead>
                  <TableHead className="text-left py-3 px-4 text-gray-400">Country</TableHead>
                  <TableHead className="text-left py-3 px-4 text-gray-400">Followers</TableHead>
                  <TableHead className="text-left py-3 px-4 text-gray-400">Status</TableHead>
                  <TableHead className="text-right py-3 px-4 text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => (
                    <React.Fragment key={application.id}>
                      <TableRow className="border-b border-gray-800">
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-0 h-6 w-6"
                            onClick={() => toggleExpandRow(application.id)}
                          >
                            {expandedRowId === application.id ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-white">{application.influencer_name}</TableCell>
                        <TableCell className="py-3 px-4 text-white">{application.email}</TableCell>
                        <TableCell className="py-3 px-4 text-white">{application.country}</TableCell>
                        <TableCell className="py-3 px-4 text-white">{application.follower_count}</TableCell>
                        <TableCell className="py-3 px-4 text-white">
                          {getStatusBadge(application.status)}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {application.status === 'pending' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-green-800/30 border-green-600 hover:bg-green-800/50"
                                  onClick={() => updateApplicationStatus(application.id, 'approved')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-red-800/30 border-red-600 hover:bg-red-800/50"
                                  onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-gray-800/50 border-gray-600 hover:bg-red-800/30 hover:border-red-600"
                              onClick={() => openDeleteDialog(application)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRowId === application.id && (
                        <TableRow className="bg-gray-900/50">
                          <TableCell colSpan={7} className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <h4 className="font-medium text-gray-400 mb-1">Platforms</h4>
                                <div className="flex flex-wrap gap-1">
                                  {application.platforms?.map((platform) => (
                                    <Badge key={platform} variant="secondary" className="bg-gray-800 text-gray-300">
                                      {platform}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-400 mb-1">Languages</h4>
                                <p className="text-gray-300">
                                  {application.languages && application.languages.length > 0 
                                    ? application.languages.join(', ') 
                                    : 'None specified'}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-400 mb-1">Has Agency</h4>
                                <p className="text-gray-300">{application.has_agency ? 'Yes' : 'No'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-400 mb-1">Content Rights</h4>
                                <p className="text-gray-300">{application.content_rights || 'Not specified'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-400 mb-1">Terms Agreed</h4>
                                <p className="text-gray-300">{application.agreed_to_terms ? 'Yes' : 'No'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-400 mb-1">User Account</h4>
                                <p className="text-gray-300">
                                  {application.user_id ? 'Registered User' : 'Guest Application'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      No creator applications found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Delete Creator Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Creator</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete {creatorToDelete?.influencer_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#1f1f1f] text-white border-gray-700 hover:bg-gray-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-red-700" 
              onClick={handleDeleteCreator}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCreators;
