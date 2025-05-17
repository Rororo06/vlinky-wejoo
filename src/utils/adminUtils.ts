
import { supabase } from '@/integrations/supabase/client';

// Function to get creator stats for the dashboard
export const getCreatorStats = async () => {
  try {
    // Get total creators count
    const { count: totalCreators } = await supabase
      .from('creator_applications')
      .select('*', { count: 'exact', head: true });
    
    // Get active creators count (status = 'approved')
    const { count: activeCreators } = await supabase
      .from('creator_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    
    // Get pending verifications count
    const { count: pendingVerifications } = await supabase
      .from('creator_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    // Get inactive creators count
    const { count: inactiveCreators } = await supabase
      .from('creator_applications')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', false);

    // Get total revenue from all video requests
    const { data: revenueData } = await supabase
      .from('video_requests')
      .select('total_price');
    
    const totalRevenue = revenueData?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
    
    // Platform fee is 20% of total revenue
    const platformFee = totalRevenue * 0.2;
    
    // Get total reviews count
    const { count: totalReviews } = await supabase
      .from('video_requests')
      .select('*', { count: 'exact', head: true })
      .not('rating', 'is', null);
    
    // Get average rating
    const { data: ratings } = await supabase
      .from('video_requests')
      .select('rating')
      .not('rating', 'is', null);
    
    const averageRating = ratings && ratings.length > 0
      ? ratings.reduce((sum, item) => sum + (item.rating || 0), 0) / ratings.length
      : 0;

    return {
      totalCreators: totalCreators || 0,
      activeCreators: activeCreators || 0,
      pendingVerifications: pendingVerifications || 0,
      totalRevenue: totalRevenue,
      platformFee: platformFee,
      totalReviews: totalReviews || 0,
      averageRating: averageRating,
      inactiveCreators: inactiveCreators || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalCreators: 0,
      activeCreators: 0,
      pendingVerifications: 0,
      totalRevenue: 0,
      platformFee: 0,
      totalReviews: 0,
      averageRating: 0,
      inactiveCreators: 0
    };
  }
};

// Function to get recent activity logs
export const getActivityLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
};

// Function to log an activity
export const logActivity = async (
  event: string,
  userEmail: string | null,
  severity: 'Info' | 'Warning' | 'Error' | 'Critical' = 'Info',
  details: Record<string, any> = {}
) => {
  try {
    // Get IP address from client
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipResponse.json();
    
    const { data, error } = await supabase
      .rpc('log_activity', {
        event_name: event,
        user_email: userEmail,
        ip_address: ip,
        severity: severity,
        details: details
      });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Fallback - insert directly to table if RPC fails
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          event: event,
          user_email: userEmail,
          severity: severity,
          details: details
        });
      
      if (error) throw error;
      
      return data;
    } catch (fallbackError) {
      console.error('Fallback insertion failed:', fallbackError);
    }
  }
};
