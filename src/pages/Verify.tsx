
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from '@/components/ui/input-otp';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import AuthLayout from '@/components/AuthLayout';

const otpSchema = z.object({
  otp: z.string().min(6, { message: "Please enter the 6-digit code" })
});

type OtpValues = z.infer<typeof otpSchema>;

const Verify = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is already authenticated, redirect to home page
        navigate('/');
        return;
      }
      
      // Retrieve stored user info
      const userInfoString = localStorage.getItem('signupUserInfo');
      if (!userInfoString) {
        // No signup in progress, redirect to signup page
        navigate('/signup');
        return;
      }

      try {
        const userInfo = JSON.parse(userInfoString);
        setEmail(userInfo.email);
      } catch (error) {
        console.error('Error parsing user info:', error);
        navigate('/signup');
      }
    };
    
    checkSession();
  }, [navigate]);

  const onSubmit = async (values: OtpValues) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: values.otp,
        type: 'signup'
      });
      
      if (error) {
        throw error;
      }
      
      // Verification successful and user is now logged in
      console.log("Verification successful:", data);
      
      // Clear stored signup info
      localStorage.removeItem('signupUserInfo');
      
      toast({
        title: "Verification successful",
        description: "Your account has been created and you are now logged in!",
      });
      
      // Redirect to home page
      navigate('/');
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.error_description || error.message || "Invalid or expired code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email",
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to resend code",
        description: error.error_description || error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h1>
      
      <p className="text-center mb-6">
        We've sent a 6-digit verification code to <span className="font-medium">{email}</span>
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="flex justify-center">
                <FormControl>
                  <InputOTP 
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                    render={({ slots }) => (
                      <InputOTPGroup>
                        {slots.map((slot, idx) => (
                          <InputOTPSlot key={idx} {...slot} index={idx} />
                        ))}
                      </InputOTPGroup>
                    )}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-poppi-purple hover:bg-poppi-light-purple"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify & Log In"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={isResending}
          className="text-poppi-purple hover:underline flex items-center gap-2"
        >
          {isResending && <RotateCw className="h-4 w-4 animate-spin" />}
          {isResending ? "Sending..." : "Resend verification code"}
        </button>
        
        <Link to="/signup" className="text-gray-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Use a different email address
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Verify;
