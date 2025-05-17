
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, Calendar, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { getActivityLogs, logActivity } from '@/utils/adminUtils';
import { useToast } from '@/components/ui/use-toast';

// Define the activity log interface
interface ActivityLog {
  id: string;
  timestamp: string;
  event: string;
  user_email: string | null;
  ip_address: string | null;
  severity: string;
  details: any;
}

const AdminActivityLogs = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Today's date and 30 days ago for the default date range
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dateRange, setDateRange] = useState(`${format(thirtyDaysAgo, 'MMM dd, yyyy')} - ${format(today, 'MMM dd, yyyy')}`);

  const loadActivityLogs = async () => {
    setIsLoading(true);
    try {
      const activityLogs = await getActivityLogs();
      setLogs(activityLogs);
      
      // Log this activity
      await logActivity(
        'Viewed Activity Logs',
        localStorage.getItem('adminEmail') || 'admin@example.com',
        'Info'
      );
    } catch (error) {
      console.error('Error loading activity logs:', error);
      toast({
        title: "Error",
        description: "Failed to load activity logs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load of activity logs
  useEffect(() => {
    loadActivityLogs();
    
    // Subscribe to real-time updates for activity logs
    const channel = supabase
      .channel('activity-log-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'activity_logs' }, 
        (payload) => {
          // Add new log to the list
          setLogs(prevLogs => [payload.new as ActivityLog, ...prevLogs]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    loadActivityLogs();
  };

  const handleExport = async () => {
    // Create CSV from logs
    const headers = ['Timestamp', 'Event', 'User', 'IP Address', 'Severity'];
    
    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.event.replace(/,/g, ' '),
        log.user_email || 'Unknown',
        log.ip_address || 'Unknown',
        log.severity
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Create a blob and download the CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Log export activity
    await logActivity(
      'Exported Activity Logs',
      localStorage.getItem('adminEmail') || 'admin@example.com',
      'Info',
      { format: 'CSV', count: logs.length }
    );
    
    toast({
      title: "Export Successful",
      description: `${logs.length} activity logs exported to CSV.`,
    });
  };

  // Filter logs based on search query and severity filter
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.severity.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || log.severity.toLowerCase() === filterSeverity.toLowerCase();
    
    return matchesSearch && matchesSeverity;
  });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
            <p className="text-gray-400">Monitor and audit platform activity.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-[#111111] border-gray-700 text-white hover:bg-gray-800"
            >
              <Calendar className="h-4 w-4" /> {dateRange}
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-[#111111] border-gray-700 text-white hover:bg-gray-800"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-[#111111] border-gray-700 text-white hover:bg-gray-800"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        
        <div className="bg-[#0e0e0e] border border-gray-800 rounded-lg p-6 mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Activity Log</h2>
            <p className="text-gray-400">Complete record of platform activity</p>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search logs..." 
                className="pl-10 bg-[#111111] border-gray-700 text-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="bg-[#111111] border-gray-700 text-white">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-gray-700 text-white">
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-800">
                    <TableHead className="text-left py-3 px-4 text-gray-400">Timestamp</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">Event</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">User</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">IP Address</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">Severity</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} className="border-b border-gray-800">
                        <TableCell className="py-3 px-4 text-white">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-white">{log.event}</TableCell>
                        <TableCell className="py-3 px-4 text-white">{log.user_email || 'Unknown'}</TableCell>
                        <TableCell className="py-3 px-4 text-white">{log.ip_address || 'Unknown'}</TableCell>
                        <TableCell className="py-3 px-4">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              log.severity.toLowerCase() === 'warning' 
                                ? 'bg-yellow-900/30 text-yellow-500' 
                                : log.severity.toLowerCase() === 'error' 
                                  ? 'bg-red-900/30 text-red-500'
                                  : log.severity.toLowerCase() === 'critical'
                                    ? 'bg-purple-900/30 text-purple-400'
                                    : 'bg-blue-900/30 text-blue-400'
                            }`}
                          >
                            {log.severity}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-gray-400">
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              toast({
                                title: "Log Details",
                                description: JSON.stringify(log.details || {}, null, 2),
                              });
                            }}
                          >
                            <span className="sr-only">Details</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="19" cy="12" r="1" />
                              <circle cx="5" cy="12" r="1" />
                            </svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        {searchQuery || filterSeverity !== 'all' 
                          ? 'No matching activity logs found' 
                          : 'No activity logs found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminActivityLogs;
