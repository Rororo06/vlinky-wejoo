
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const FAQ = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-10">
        <div className="section-container max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="ordering">Ordering</TabsTrigger>
              <TabsTrigger value="creators">Creators</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">What is POPPI?</h3>
                <p className="text-gray-600">POPPI is a platform that connects fans with their favorite influencers and creators for personalized video messages. Whether it's a birthday wish, congratulations, or just a hello, creators can record custom videos for their fans.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">How does it work?</h3>
                <p className="text-gray-600">Simply browse our catalog of creators, select one you'd like a video from, fill out a request form with your personalization details, and complete your purchase. The creator will record your video and deliver it to you within the specified timeframe.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">How much does it cost?</h3>
                <p className="text-gray-600">Pricing varies by creator. Each creator sets their own price for personalized videos. You can filter creators by price range to find options that fit your budget.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="ordering" className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">How do I request a video?</h3>
                <p className="text-gray-600">After selecting a creator, you'll fill out a form with details about your request, including who it's for, the occasion, and any specific messages you'd like included. Then complete your purchase and wait for your video.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">How long until I receive my video?</h3>
                <p className="text-gray-600">Standard delivery is typically 7 days, but many creators offer express delivery options. The expected delivery time is clearly displayed on each creator's profile.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">Can I request revisions?</h3>
                <p className="text-gray-600">Creators typically do not offer revisions unless there was a clear mistake in following your instructions. Be sure to provide clear and specific details in your initial request.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="creators" className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">How do I become a creator?</h3>
                <p className="text-gray-600">You can apply to become a creator by clicking on "Join as Creator" in the top navigation. We review all applications and approve creators based on their social media presence, content quality, and audience engagement.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">How much can I earn as a creator?</h3>
                <p className="text-gray-600">Earnings vary based on your pricing, popularity, and how many requests you complete. POPPI takes a 25% platform fee, and you keep 75% of each video request payment.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">What types of requests can I decline?</h3>
                <p className="text-gray-600">Creators have full control over which requests they accept. You can decline any request that makes you uncomfortable, violates our content policies, or that you simply don't have time to complete.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="technical" className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">What video formats are supported?</h3>
                <p className="text-gray-600">We support MP4 video uploads. Videos should be shot in portrait or landscape mode with good lighting and clear audio for the best experience.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">How do I download my video?</h3>
                <p className="text-gray-600">Once your video is delivered, you'll receive an email with a link to view it. On the video page, you'll find a download button to save it to your device.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">Can I share my video on social media?</h3>
                <p className="text-gray-600">Yes! You're welcome to share your personalized videos on social media. We encourage tagging both the creator and @POPPI when you do so others can discover our service.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
