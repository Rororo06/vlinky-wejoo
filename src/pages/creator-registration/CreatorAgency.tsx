
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StepIndicator from '@/components/StepIndicator';
import { useCreatorApplication } from '@/contexts/CreatorApplicationContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const agencySchema = z.object({
  hasAgency: z.enum(['yes', 'no'])
});

const CreatorAgency = () => {
  const navigate = useNavigate();
  const { applicationData, updateAgencyData } = useCreatorApplication();
  
  const form = useForm({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      hasAgency: applicationData.hasAgency ? 'yes' : 'no',
    }
  });

  const onSubmit = (data: any) => {
    updateAgencyData({ hasAgency: data.hasAgency === 'yes' });
    navigate('/join/ip-rights');
  };

  const goBack = () => {
    navigate('/join/profile');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-poppi-light-bg py-10">
        <div className="section-container">
          <StepIndicator currentStep={2} />
          
          <div className="bg-white p-8 rounded-lg shadow-sm mt-8">
            <h1 className="text-2xl font-bold mb-6">Agency Affiliation</h1>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="hasAgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Are you affiliated with an agency?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="agency-yes" />
                            <label htmlFor="agency-yes" className="text-base">Yes</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="agency-no" />
                            <label htmlFor="agency-no" className="text-base">No</label>
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
                      <Building className="h-6 w-6 text-poppi-purple" />
                    </div>
                    <div>
                      <h3 className="text-poppi-purple font-medium">Agency Information</h3>
                      <p className="text-sm text-indigo-700 mt-1">
                        If you're represented by an agency, you must have their permission to create content on POPPI.
                        We may contact your agency to verify this information.
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

export default CreatorAgency;
