
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const location = useLocation();
  
  // Check if user is admin (from localStorage)
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  // Add console log for debugging
  console.log('AdminRoute check - isAdmin:', isAdmin);
  
  useEffect(() => {
    // Log route access
    if (isAdmin) {
      const logRouteAccess = async () => {
        try {
          await supabase.rpc('log_activity', {
            event_name: `Accessed ${location.pathname}`,
            user_email: localStorage.getItem('adminEmail') || 'admin@example.com',
            ip_address: '127.0.0.1', // Placeholder
            severity: 'Info',
            details: { path: location.pathname }
          });
        } catch (error) {
          console.error('Error logging route access:', error);
        }
      };
      
      logRouteAccess();
    }
  }, [location.pathname, isAdmin]);
  
  // If not an admin, redirect to admin login
  if (!isAdmin) {
    console.log('Not an admin, redirecting to /admin-panel');
    return <Navigate to="/admin-panel" state={{ from: location }} replace />;
  }

  // If admin, render the children
  console.log('Is admin, rendering admin content');
  return <>{children}</>;
};

export default AdminRoute;
