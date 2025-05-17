
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CreatorRegistration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the first step immediately without checking auth status
    navigate('/join/profile');
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="section-container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Redirecting to creator registration...</h1>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatorRegistration;
