
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
const Hero = () => {
  return <section className="bg-white py-16">
      <div className="section-container flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 mb-10 lg:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            1:1 Videos from Your Favorite <span className="text-[#9062f5]">Virtual Creators</span>
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Request custom 1:1 videos from VTubers for yourself or as a 
            gift. Make someone's day with a personalized message!
          </p>
          <div className="flex gap-4">
            <Link to="/find-influencers">
              <Button className="bg-[#9062f5] hover:bg-[#7d50e0] text-white rounded-md px-6 py-2 h-auto">Find Creators</Button>
            </Link>
            <Link to="/join">
              <Button variant="outline" className="border-[#9062f5] text-[#9062f5] hover:bg-[#9062f5] hover:text-white rounded-md px-6 py-2 h-auto">Join as Creator</Button>
            </Link>
          </div>
        </div>
        
        <div className="lg:w-1/2 flex justify-center">
          <div className="relative">
            <div className="bg-gray-200 rounded-xl overflow-hidden relative">
              <img src="/lovable-uploads/9e58c565-013d-412f-b4c8-2c4309082752.png" alt="Virtual Creator" className="w-full h-full object-cover" />
              
              
              
              
              
              
              
            </div>
            
            <div className="absolute -bottom-3 right-3 bg-[#9062f5] rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;
