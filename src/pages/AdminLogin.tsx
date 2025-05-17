
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check admin credentials
    if ((email === 'admin@poppi.com' && password === 'admin123') || 
        (email === 'royhan5365@gmail.com' && password === 'royhan9876')) {
      try {
        // Store admin status in local storage
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminEmail', email);
        
        // Log activity
        await supabase.rpc('log_activity', {
          event_name: 'Admin Login',
          user_email: email,
          ip_address: '127.0.0.1', // Placeholder
          severity: 'Info',
          details: { method: 'hardcoded' }
        });
        
        // Show success message
        toast({
          title: "Login Successful",
          description: "Welcome to the admin panel!",
        });
        
        // Redirect to admin dashboard with a small delay to ensure localStorage is set
        setTimeout(() => {
          console.log('Redirecting to admin dashboard after hardcoded login');
          navigate('/admin');
        }, 100);
        return;
      } catch (err) {
        console.error('Error logging admin activity:', err);
        // Continue with redirect anyway
        setTimeout(() => {
          navigate('/admin');
        }, 100);
        return;
      }
    }
    
    // Regular admin login logic (connect to Supabase auth in the future)
    if (email === '' || password === '') {
      setError('Please enter your email and password.');
      setIsLoading(false);
      return;
    }
    
    try {
      // In a real application, you would authenticate against a database or auth service
      // For now, we'll check against hardcoded credentials again
      if ((email !== 'admin@poppi.com' || password !== 'admin123') && 
          (email !== 'royhan5365@gmail.com' || password !== 'royhan9876')) {
        setError('Invalid email or password.');
        setIsLoading(false);
        return;
      }
      
      // Store admin status in local storage
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminEmail', email);
      
      // Log activity
      try {
        await supabase.rpc('log_activity', {
          event_name: 'Admin Login',
          user_email: email,
          ip_address: '127.0.0.1', // Placeholder
          severity: 'Info',
          details: { method: 'supabase' }
        });
      } catch (logError) {
        console.error('Error logging admin activity:', logError);
      }
      
      // Show success message
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
      
      // Redirect to admin dashboard with a small delay to ensure localStorage is set
      setTimeout(() => {
        console.log('Redirecting to admin dashboard after regular admin login');
        navigate('/admin');
      }, 100);
      
    } catch (error: any) {
      setError(error.message || 'An error occurred during login.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="bg-[#0e0e0e] p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-white text-center mb-4">Admin Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <Input
              type="email"
              id="email"
              placeholder="Email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-[#111111] border-gray-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <Input
              type="password"
              id="password"
              placeholder="Password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-[#111111] border-gray-700 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              className="bg-[#555555] hover:bg-[#777777] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
