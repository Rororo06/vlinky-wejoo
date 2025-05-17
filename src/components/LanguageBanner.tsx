
import React from 'react';

interface CharacterImageProps {
  index: number;
}

const CharacterImage: React.FC<CharacterImageProps> = ({ index }) => {
  return (
    <div className="w-full max-w-[250px] h-[150px] bg-gray-100 border border-dashed border-gray-300 rounded">
      <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
        <div className="font-medium">Character Image</div>
        <div className="text-xs">Insert image here</div>
      </div>
    </div>
  );
};

const LanguageBanner = () => {
  // Create four character placeholders
  const characters = [1, 2, 3, 4];
  
  return (
    <section className="w-full py-8 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          {characters.map((character) => (
            <CharacterImage key={character} index={character} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LanguageBanner;
