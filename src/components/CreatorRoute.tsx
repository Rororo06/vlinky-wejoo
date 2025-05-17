
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CreatorRouteProps {
  children: React.ReactNode;
}

const CreatorRoute: React.FC<CreatorRouteProps> = ({ children }) => {
  const { toast } = useToast();
  const { user, isLoading, isCreator } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poppi-purple"></div>
      </div>
    );
  }
  
  if (!user) {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You need to log in to access this page."
    });
    // Save the current location to return after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!isCreator) {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You need creator access to view this page."
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default CreatorRoute;
