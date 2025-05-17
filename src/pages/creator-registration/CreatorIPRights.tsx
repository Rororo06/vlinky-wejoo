
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { File } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StepIndicator from '@/components/StepIndicator';
import { useCreatorApplication } from '@/contexts/CreatorApplicationContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const ipRightsSchema = z.object({
  contentRights: z.enum(['myself', 'agency', 'management', 'third-party'])
});

const CreatorIPRights = () => {
  const navigate = useNavigate();
  const { applicationData, updateIPRightsData } = useCreatorApplication();
  
  const form = useForm({
    resolver: zodResolver(ipRightsSchema),
    defaultValues: {
      contentRights: applicationData.contentRights as any || 'myself',
    }
  });

  const onSubmit = (data: any) => {
    updateIPRightsData({ contentRights: data.contentRights });
    navigate('/join/terms');
  };

  const goBack = () => {
    navigate('/join/agency');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-poppi-light-bg py-10">
        <div className="section-container">
          <StepIndicator currentStep={3} />
          
          <div className="bg-white p-8 rounded-lg shadow-sm mt-8">
            <h1 className="text-2xl font-bold mb-6">Character / IP Ownership</h1>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="contentRights"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Who owns the rights to your character/content?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="myself" id="rights-myself" />
                            <label htmlFor="rights-myself" className="text-base">Myself</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="agency" id="rights-agency" />
                            <label htmlFor="rights-agency" className="text-base">Agency</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="management" id="rights-management" />
                            <label htmlFor="rights-management" className="text-base">Management</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="third-party" id="rights-third-party" />
                            <label htmlFor="rights-third-party" className="text-base">Third-party</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-indigo-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <div className="mr-3">
                      <File className="h-6 w-6 text-poppi-purple" />
                    </div>
                    <div>
                      <h3 className="text-poppi-purple font-medium">IP Rights Information</h3>
                      <p className="text-sm text-indigo-700 mt-1">
                        POPPI requires all creators to have the necessary rights or permissions to use their character/
                        content commercially.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="border-gray-300" 
                    onClick={goBack}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="bg-poppi-purple hover:bg-poppi-light-purple">Continue</Button>
                </div>
              </form>
            </Form>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-poppi-purple text-4xl mb-4 flex justify-center">
                <span className="text-6xl">$</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Earn Your Way</h3>
              <p className="text-gray-600">Set your own prices and keep 70% of what you earn from each video</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-poppi-purple text-4xl mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Flexible Schedule</h3>
              <p className="text-gray-600">Create videos on your own time and set your own delivery timeframes</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-poppi-purple text-4xl mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Safe Platform</h3>
              <p className="text-gray-600">We handle payments, customer service, and protect your information</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatorIPRights;
