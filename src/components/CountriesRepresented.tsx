
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface Country {
  id: string;
  name: string;
  flag: string;
}

const fetchCountries = async (): Promise<Country[]> => {
  // Using the PostgrestFilterBuilder type checking
  const { data, error } = await supabase
    .from('countries')
    .select('*');
  
  if (error) {
    console.error('Error fetching countries:', error);
    // Fallback to local data if fetch fails
    return defaultCountries;
  }
  
  return data as Country[] || defaultCountries;
};

// Default countries as fallback
const defaultCountries: Country[] = [
  {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧'
  },
  {
    id: 'ca',
    name: 'Canada',
    flag: '🇨🇦'
  },
  {
    id: 'mx',
    name: 'Mexico',
    flag: '🇲🇽'
  },
  {
    id: 'th',
    name: 'Thailand',
    flag: '🇹🇭'
  },
  {
    id: 'cn',
    name: 'China',
    flag: '🇨🇳'
  },
  {
    id: 'us',
    name: 'United States',
    flag: '🇺🇸'
  },
  {
    id: 'jp',
    name: 'Japan',
    flag: '🇯🇵'
  }
];

const CountriesRepresented: React.FC = () => {
  const { data: countries = defaultCountries, isLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries
  });

  return (
    <section className="py-12 bg-white">
      <div className="section-container">
        <h2 className="text-3xl font-bold text-center mb-8">Countries Represented</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {isLoading ? (
            // Loading skeleton
            Array(7).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 animate-pulse"></div>
              </div>
            ))
          ) : (
            countries.map((country) => (
              <div key={country.id} className="flex flex-col items-center">
                <div className="text-5xl mb-2">{country.flag}</div>
                <p className="text-sm font-medium text-gray-700">{country.name}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default CountriesRepresented;
