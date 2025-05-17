
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Step {
  name: string;
  number: number;
  path: string;
  status: 'active' | 'complete' | 'upcoming';
}

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps: Step[] = [
    {
      name: 'Profile',
      number: 1,
      path: '/join/profile',
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'complete' : 'upcoming',
    },
    {
      name: 'Agency',
      number: 2,
      path: '/join/agency',
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'complete' : 'upcoming',
    },
    {
      name: 'IP Rights',
      number: 3,
      path: '/join/ip-rights',
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'complete' : 'upcoming',
    },
    {
      name: 'Terms',
      number: 4,
      path: '/join/terms',
      status: currentStep === 4 ? 'active' : currentStep > 4 ? 'complete' : 'upcoming',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.name} className="flex flex-col items-center">
            <div 
              className={cn(
                "flex items-center justify-center rounded-full w-10 h-10 mb-2",
                step.status === 'active' && "bg-poppi-purple text-white",
                step.status === 'complete' && "bg-poppi-purple text-white",
                step.status === 'upcoming' && "bg-gray-200 text-gray-400"
              )}
            >
              {step.number}
            </div>
            <span className="text-sm">{step.name}</span>
          </div>
        ))}
      </div>
      <div className="relative">
        <div className="absolute h-1 bg-gray-200 w-full top-0"></div>
        <div 
          className="absolute h-1 bg-poppi-purple top-0"
          style={{ width: `${(currentStep - 1) * 33.33}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepIndicator;
