
import React from 'react';
import { Music, Star, MessageSquare, Smile, Sparkles, Mic, Headphones, Heart, Gamepad } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

const CreatorSpecialties = () => {
  const specialties = [
    {
      id: 'singing',
      name: 'Singing',
      icon: <Music className="h-10 w-10 text-pink-500" />,
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-500'
    },
    {
      id: 'dancing',
      name: 'Dancing',
      icon: <Star className="h-10 w-10 text-purple-500" />,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-500'
    },
    {
      id: 'talking',
      name: 'Talking',
      icon: <MessageSquare className="h-10 w-10 text-blue-500" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-500'
    },
    {
      id: 'roast',
      name: 'Roast',
      icon: <Smile className="h-10 w-10 text-orange-500" />,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-500'
    },
    {
      id: 'celebration',
      name: 'Celebration',
      icon: <Sparkles className="h-10 w-10 text-yellow-500" />,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-500'
    },
    {
      id: 'acting',
      name: 'Acting',
      icon: <Star className="h-10 w-10 text-purple-500" />,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-500'
    },
    {
      id: 'storytelling',
      name: 'Storytelling',
      icon: <MessageSquare className="h-10 w-10 text-emerald-500" />,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-500'
    },
    {
      id: 'voice-acting',
      name: 'Voice Acting',
      icon: <Mic className="h-10 w-10 text-red-500" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-500'
    },
    {
      id: 'asmr',
      name: 'ASMR',
      icon: <Headphones className="h-10 w-10 text-green-500" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-500'
    },
    {
      id: 'memes',
      name: 'Memes',
      icon: <Smile className="h-10 w-10 text-cyan-500" />,
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-500'
    },
    {
      id: 'emotional',
      name: 'Emotional',
      icon: <Heart className="h-10 w-10 text-red-500" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-500'
    },
    {
      id: 'gaming',
      name: 'Gaming',
      icon: <Gamepad className="h-10 w-10 text-purple-500" />,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-500'
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="section-container">
        <h2 className="text-3xl font-bold mb-8">Creator Specialties</h2>
        
        <Carousel className="w-full">
          <CarouselPrevious className="left-2 lg:-left-12 h-8 w-8 rounded-full absolute z-10" />
          <CarouselContent>
            {specialties.map(specialty => (
              <CarouselItem key={specialty.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/5 pl-4">
                <div 
                  className={`${specialty.bgColor} rounded-xl shadow-sm flex flex-col items-center p-8 cursor-pointer hover:shadow-md transition-shadow mx-2 text-center h-full`}
                >
                  <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <div>{specialty.icon}</div>
                  </div>
                  <p className={`text-lg font-medium ${specialty.textColor}`}>{specialty.name}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext className="right-2 lg:-right-12 h-8 w-8 rounded-full absolute z-10" />
        </Carousel>
      </div>
    </section>
  );
};

export default CreatorSpecialties;
