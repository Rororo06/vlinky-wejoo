
import React from 'react';
import { cn } from '@/lib/utils';

interface LanguageMarqueeProps {
  color?: 'blue' | 'purple';
}

const LanguageMarquee = ({ color = 'purple' }: LanguageMarqueeProps) => {
  const languages = [
    "VLINKY ENGLISH",
    "VLINKY KOREA",
    "VLINKY JAPAN",
    "VLINKY CHINA",
    "VLINKY ENGLISH",
    "VLINKY KOREA",
    "VLINKY JAPAN",
    "VLINKY CHINA"
  ];

  return (
    <div className={cn(
      "w-full overflow-hidden text-white py-2",
      color === 'purple' ? 'bg-purple-600' : 'bg-[#4169e1]' // Updated blue color to match reference
    )}>
      <div className="marquee-container relative">
        <div className="marquee flex animate-marquee whitespace-nowrap">
          {languages.map((language, index) => (
            <span key={`${language}-${index}`} className="mx-4 text-sm font-medium">
              {language}
            </span>
          ))}
        </div>
        
        <div className="marquee flex animate-marquee2 whitespace-nowrap absolute top-0">
          {languages.map((language, index) => (
            <span key={`${language}-second-${index}`} className="mx-4 text-sm font-medium">
              {language}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageMarquee;
