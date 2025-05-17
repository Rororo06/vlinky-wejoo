
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormControl } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StepIndicator from '@/components/StepIndicator';
import { useCreatorApplication } from '@/contexts/CreatorApplicationContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

const termsSchema = z.object({
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions to continue."
  })
});

const CreatorTerms = () => {
  const navigate = useNavigate();
  const { applicationData, updateTermsData, submitApplication, isSubmitting } = useCreatorApplication();
  const [submitted, setSubmitted] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      agreeToTerms: applicationData.agreedToTerms,
    }
  });

  const onSubmit = async (data: any) => {
    updateTermsData({ agreedToTerms: data.agreeToTerms });
    setSubmitted(true);
    await submitApplication();
  };

  const goBack = () => {
    navigate('/join/ip-rights');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-poppi-light-bg py-10">
        <div className="section-container">
          <StepIndicator currentStep={4} />
          
          <div className="bg-white p-8 rounded-lg shadow-sm mt-8">
            <h1 className="text-2xl font-bold mb-6">Terms</h1>
            
            {submitted ? (
              <div className="text-center py-8">
                <div className="mb-4 text-poppi-purple">
                  {isSubmitting ? (
                    <Loader2 className="h-12 w-12 animate-spin mx-auto" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-2">
                  {isSubmitting ? "Submitting your application..." : "Application Submitted Successfully!"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {isSubmitting 
                    ? "Please wait while we process your information." 
                    : "Your application has been received and is pending review by our team."
                  }
                </p>
                {!isSubmitting && (
                  <div className="bg-blue-50 p-6 rounded-md mx-auto max-w-md">
                    <h3 className="font-medium text-blue-800 mb-2">What's Next?</h3>
                    <p className="text-blue-700 text-sm mb-2">
                      Our admin team has been notified and will review your application shortly.
                    </p>
                    <p className="text-blue-700 text-sm mb-2">
                      You will receive an email when your application has been approved or if we need additional information.
                    </p>
                    <p className="text-blue-700 text-sm">
                      Thank you for your interest in joining POPPI as a creator!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="terms"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <label
                            htmlFor="terms"
                            className="font-medium text-base leading-none"
                          >
                            I agree to the Terms of Service and Privacy Policy
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">
                            By checking this box, you agree to our{' '}
                            <Link to="/terms" className="text-poppi-purple underline">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-poppi-purple underline">
                              Privacy Policy
                            </Link>
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 p-6 rounded-md mt-8">
                    <h3 className="font-medium text-blue-800 mb-2">Reviewing your submitted form may take 1-2 days.</h3>
                    <p className="text-blue-700 text-sm mb-2">
                      We'll do our best to process it as quickly as possible, so we appreciate your patience.
                    </p>
                    <p className="text-blue-700 text-sm mb-2">
                      If your application is approved or if we need further verification, we'll contact you via the email you provided—
                      so please keep an eye on your inbox.
                    </p>
                    <p className="text-blue-700 text-sm">
                      Thank you for your interest in POPPI.
                    </p>
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
                    <Button 
                      type="submit" 
                      className="bg-poppi-purple hover:bg-poppi-light-purple"
                      disabled={!form.watch('agreeToTerms') || isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
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

export default CreatorTerms;
