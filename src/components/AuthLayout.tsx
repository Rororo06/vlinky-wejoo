
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { isLoading } = useAuth();
  
  // If still loading, show a simple loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poppi-purple"></div>
      </div>
    );
  }
  
  // No longer redirecting users if they're authenticated - allow them to view login/signup pages

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-16 bg-poppi-light-bg">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
