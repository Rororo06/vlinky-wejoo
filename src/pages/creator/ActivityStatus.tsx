
import React from 'react';
import { Activity, Info } from 'lucide-react';
import CreatorLayout from '@/components/CreatorLayout';

const ActivityStatus = () => {
  const isApproved = true; // This would typically come from your API/database
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Activity Status</h1>
      <p className="text-gray-600 mb-8">Your current availability status for new video requests.</p>
      
      {/* Creator Status Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Creator Status</h2>
        <p className="text-gray-600 mb-6">Your current approval status for receiving video requests.</p>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Current Status</h3>
          <div className="flex items-center">
            <div className={`h-4 w-4 rounded-full ${isApproved ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
            <span className="font-medium">{isApproved ? 'Approved' : 'Not Approved'}</span>
            
            <div className="ml-auto">
              <span className={`px-4 py-1 text-sm font-medium rounded-full ${
                isApproved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isApproved ? 'Approved' : 'Not Approved'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Admin Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-blue-700 font-medium">Admin-Managed Status</h3>
              <p className="text-blue-600 text-sm mt-1">
                Your activity status is managed by the POPPI admin team. If you have questions or need to change your
                status, please contact support.
              </p>
            </div>
          </div>
        </div>
        
        {/* What does this mean */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium mb-4">What does this mean?</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                <strong>Approved:</strong> Your profile is visible and fans can request videos from you.
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                <strong>Not Approved:</strong> Your profile is not visible, and fans cannot request new videos.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ActivityStatus;
