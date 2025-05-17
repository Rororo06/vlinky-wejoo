
import React, { useState, useEffect } from 'react';
import { DollarSign, CalendarIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface EarningStats {
  totalEarnings: number;
  pendingPayout: number;
  currentMonthEarnings: number;
  nextPayoutDate: string | null;
}

const Revenue = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<EarningStats>({
    totalEarnings: 0,
    pendingPayout: 0,
    currentMonthEarnings: 0,
    nextPayoutDate: null
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRevenueStats = async () => {
      try {
        setIsLoading(true);
        
        const creatorId = localStorage.getItem('creatorId');
        if (!creatorId) {
          console.error('Creator ID not found in local storage');
          setIsLoading(false);
          return;
        }
        
        // Fetch revenue stats from database
        const { data, error } = await supabase
          .from('creator_earnings')
          .select('*')
          .eq('creator_id', creatorId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          // PGRST116 means no rows returned
          throw error;
        }
        
        if (data) {
          setStats({
            totalEarnings: data.total_earnings || 0,
            pendingPayout: data.pending_payout || 0,
            currentMonthEarnings: data.current_month_earnings || 0,
            nextPayoutDate: data.next_payout_date
          });
        }
      } catch (error) {
        console.error('Error fetching revenue stats:', error);
        toast({
          variant: "destructive",
          title: "Failed to load revenue data",
          description: "There was a problem loading your earnings information."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueStats();
  }, [toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Revenue & Payouts</h1>
      <p className="text-gray-600 mb-6">View your earnings, payment history, and manage your payout methods.</p>
      
      {/* Overview Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-gray-700">Overview</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-poppi-purple"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Earnings Card */}
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Earnings</h3>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">All-time earnings</p>
            </Card>
            
            {/* Pending Payout Card */}
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Payout</h3>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{formatCurrency(stats.pendingPayout)}</p>
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">To be paid out</p>
            </Card>
            
            {/* This Month Card */}
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">This Month's Payout</h3>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{formatCurrency(stats.currentMonthEarnings)}</p>
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">For current month</p>
            </Card>
            
            {/* Next Payout Date Card */}
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Next Payout Date</h3>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{stats.nextPayoutDate || '--'}</p>
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Pending payment cycle</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Revenue;
