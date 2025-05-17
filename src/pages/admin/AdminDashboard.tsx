
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Users, 
  Clock, 
  DollarSign, 
  PercentCircle, 
  MessageSquare, 
  Star, 
  UserMinus,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getCreatorStats } from '@/utils/adminUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCreators: 0,
    activeCreators: 0,
    pendingVerifications: 0,
    totalRevenue: 0,
    platformFee: 0,
    totalReviews: 0,
    averageRating: 0,
    inactiveCreators: 0
  });
  
  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Function to load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const dashboardStats = await getCreatorStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
    
    // Subscribe to creator_applications changes to refresh dashboard
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'creator_applications' }, 
        () => {
          // Refresh data when creator applications change
          loadDashboardData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'video_requests' }, 
        () => {
          // Refresh data when video requests change
          loadDashboardData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          
          <Button
            onClick={loadDashboardData}
            variant="outline"
            className="bg-[#111111] border-gray-700 text-white hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
        
        {/* Pending Verifications Button */}
        <Button 
          onClick={() => navigate('/admin/pending-verifications')}
          className="mb-6 bg-[#0e0e0e] hover:bg-[#1a1a1a] text-white border border-gray-700 flex items-center gap-2"
        >
          <UserCheck size={18} />
          {stats.pendingVerifications > 0 ? 
            `Pending Verifications (${stats.pendingVerifications})` : 
            'Pending Verifications'}
        </Button>
        
        {/* Top Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard 
            title="Total Creators" 
            value={stats.totalCreators.toString()} 
            subtext="Registered creators" 
            icon={<Users className="h-5 w-5 text-gray-300" />} 
            isLoading={isLoading}
          />
          <StatCard 
            title="Active Creators" 
            value={stats.activeCreators.toString()} 
            subtext="Approved creators" 
            icon={<Users className="h-5 w-5 text-gray-300" />} 
            isLoading={isLoading}
          />
          <StatCard 
            title="Pending Verifications" 
            value={stats.pendingVerifications.toString()} 
            subtext="Awaiting approval" 
            icon={<Clock className="h-5 w-5 text-gray-300" />} 
            isLoading={isLoading}
          />
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(stats.totalRevenue)} 
            subtext="All time" 
            icon={<DollarSign className="h-5 w-5 text-gray-300" />} 
            isLoading={isLoading}
          />
        </div>
        
        {/* Bottom Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard 
            title="Platform Fee" 
            value={formatCurrency(stats.platformFee)} 
            subtext="20% of Total Revenue" 
            icon={<PercentCircle className="h-5 w-5 text-gray-300" />} 
            isLoading={isLoading}
          />
          <StatCard 
            title="Total Reviews" 
            value={stats.totalReviews.toString()} 
            subtext="From customers" 
            icon={<MessageSquare className="h-5 w-5 text-gray-300" />} 
            isLoading={isLoading}
          />
          <StatCard 
            title="Average Rating" 
            value={stats.averageRating.toFixed(1)} 
            subtext="Out of 5.0" 
            icon={<Star className="h-5 w-5 text-gray-300" />} 
            isLoading={isLoading}
          />
          <StatCard 
            title="Inactive Creators" 
            value={stats.inactiveCreators.toString()} 
            subtext="Currently unavailable" 
            icon={<UserMinus className="h-5 w-5 text-gray-300" />} 
            isLoading={isLoading}
          />
        </div>
        
        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <div className="lg:col-span-3 bg-[#0e0e0e] rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
            <div className="border-t border-dashed border-gray-700 my-4"></div>
            <div className="h-64">
              <p className="text-center text-gray-400 pt-20">
                Chart coming soon...
              </p>
            </div>
            <div className="border-t border-dashed border-gray-700 my-4"></div>
          </div>
          
          {/* Recent Activity Link */}
          <div className="lg:col-span-1 bg-[#0e0e0e] rounded-lg p-6 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-xl font-bold text-white">Activity Log</h2>
                <p className="text-gray-400 text-sm">Recent system activity</p>
              </div>
              <Button 
                variant="ghost"
                size="sm"
                className="text-sm text-white hover:bg-gray-800"
                onClick={() => navigate('/admin/activity-logs')}
              >
                View All
              </Button>
            </div>
            
            <div className="flex items-center justify-center h-48 text-gray-500">
              <Button
                variant="outline"
                className="bg-[#111111] border-gray-700 text-white hover:bg-gray-800"
                onClick={() => navigate('/admin/activity-logs')}
              >
                View Activity Logs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, icon, isLoading = false }) => {
  return (
    <div className="bg-[#0e0e0e] rounded-lg p-6 border border-gray-800">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        {icon}
      </div>
      <div className="mt-2">
        {isLoading ? (
          <div className="h-8 w-20 bg-gray-800 animate-pulse rounded"></div>
        ) : (
          <p className="text-2xl font-bold text-white">{value}</p>
        )}
        <p className="text-sm text-gray-400">{subtext}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
