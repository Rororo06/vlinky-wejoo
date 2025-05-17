
import React, { useState } from 'react';
import { User, History, Star } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('email');
  const { user } = useAuth(); // Get user from auth context

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-10">
        <div className="section-container max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>
          
          <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="email" className="flex items-center gap-2 py-3">
                <User className="h-4 w-4" /> 
                <span>Email Address</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 py-3">
                <History className="h-4 w-4" /> 
                <span>Purchase History</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2 py-3">
                <Star className="h-4 w-4" /> 
                <span>Video Reviews</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Email Address</h2>
                <p className="text-gray-600">Your registered email address for POPPI</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg flex items-center gap-4">
                <User className="h-6 w-6 text-poppi-purple" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email || 'Please sign in to view your email'}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Purchase History</h2>
                <p className="text-gray-600">View your previous personalized video requests</p>
              </div>
              
              <div className="text-center py-10">
                <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No purchases yet</h3>
                <p className="text-gray-500 mb-6">You haven't ordered any personalized videos yet</p>
                <a href="/creators" className="inline-block bg-poppi-purple hover:bg-poppi-light-purple text-white rounded-full px-6 py-2">
                  Browse Creators
                </a>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Video Reviews</h2>
                <p className="text-gray-600">Rate and review videos you've received</p>
              </div>
              
              <div className="text-center py-10">
                <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No reviews yet</h3>
                <p className="text-gray-500 mb-6">Once you receive videos, you can leave reviews here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
