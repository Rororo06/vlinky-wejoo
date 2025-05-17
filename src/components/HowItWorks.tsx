
import React from 'react';
import { Search, Video, Heart } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section className="py-16">
      <div className="section-container">
        <h2 className="text-center text-3xl font-bold mb-3">How <span className="text-[#9062f5]">VLINKY</span> Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center text-center">
            <div className="bg-[#f2eeff] p-4 rounded-full mb-6">
              <Search className="h-6 w-6 text-[#9062f5]" />
            </div>
            <h3 className="text-xl font-medium mb-2">Find Your Creator</h3>
            <p className="text-gray-600">Browse our diverse roster of virtual creators and find the perfect match.</p>
          </div>
          
          <div className="bg-white rounded-xl p-8 flex flex-col items-center text-center">
            <div className="bg-[#f2eeff] p-4 rounded-full mb-6">
              <Video className="h-6 w-6 text-[#9062f5]" />
            </div>
            <h3 className="text-xl font-medium mb-2">Request a Video</h3>
            <p className="text-gray-600">Share what you'd like them to say, provide details, and complete your payment securely.</p>
          </div>
          
          <div className="bg-white rounded-xl p-8 flex flex-col items-center text-center">
            <div className="bg-[#f2eeff] p-4 rounded-full mb-6">
              <Heart className="h-6 w-6 text-[#9062f5]" />
            </div>
            <h3 className="text-xl font-medium mb-2">Receive & Share</h3>
            <p className="text-gray-600">Get your custom video delivered to your email, ready to download, share, or keep forever.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
