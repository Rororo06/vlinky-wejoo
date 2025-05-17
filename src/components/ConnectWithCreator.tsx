
import React from 'react';
import { Button } from './ui/button';

const ConnectWithCreator = () => {
  return (
    <section className="py-16 bg-white text-center">
      <div className="section-container relative">
        <div className="max-w-xl mx-auto">
          <img 
            src="/lovable-uploads/cb152ce3-0942-4ad7-9e07-99ca84f76cea.png" 
            alt="Anime creator with viewer" 
            className="w-64 h-64 mx-auto mb-8 rounded-lg shadow-md object-cover" 
          />
          <h2 className="text-3xl font-bold mb-4">Connect With Creators</h2>
          <p className="text-gray-600 mb-6">
            Get personalized content directly from your favorite creators.
            Bring your ideas to life through custom video requests.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Start Creating
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ConnectWithCreator;
