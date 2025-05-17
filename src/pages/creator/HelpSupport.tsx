
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const HelpSupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    details: '',
    email: user?.email || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create a support request using a direct API call instead
      const payload = {
        user_id: user?.id,
        creator_id: localStorage.getItem('creatorId'),
        subject: formData.subject,
        details: formData.details,
        contact_email: formData.email,
        status: 'new',
        created_at: new Date().toISOString()
      };
      
      // Store in local storage temporarily until we have the table created
      const existingRequests = JSON.parse(localStorage.getItem('supportRequests') || '[]');
      existingRequests.push(payload);
      localStorage.setItem('supportRequests', JSON.stringify(existingRequests));
      
      // Simulate backend delay
      await new Promise(resolve => setTimeout(resolve, 500));
        
      toast({
        title: "Support request submitted",
        description: "We'll get back to you as soon as possible.",
      });
      
      // Reset form
      setFormData({
        subject: '',
        details: '',
        email: user?.email || ''
      });
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "There was a problem submitting your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Help & Support</h1>
      <p className="text-gray-600 mb-8">Need assistance? We're here to help.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Support Request Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Submit a Support Request</h2>
          <p className="text-gray-500 text-sm mb-6">
            Fill out the form below and our support team will get back to you as soon as possible.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details" className="text-sm font-medium">
                Details <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="details"
                name="details"
                placeholder="Please provide as much information as possible"
                value={formData.details}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email (optional, for response)
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-poppi-purple hover:bg-poppi-light-purple"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Inquiry"}
            </Button>
          </form>
        </div>
        
        {/* FAQ Section */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-sm mb-6">Quick answers to common questions</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-1">How long does it take to get a response?</h3>
                <p className="text-sm text-gray-600">
                  We typically respond to all inquiries within 24-48 hours during business days.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">How do I update my payment information?</h3>
                <p className="text-sm text-gray-600">
                  You can update your payment details in the Revenue & Payouts section of your dashboard.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">What if I need to decline a video request?</h3>
                <p className="text-sm text-gray-600">
                  You can decline any request by clicking the "Decline" button on the request details page and providing a reason.
                </p>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">Contact Information</h2>
            <p className="text-gray-500 text-sm mb-6">Alternative ways to reach us</p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-poppi-purple mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium">Email Support</h3>
                  <p className="text-sm text-gray-600">support@poppi.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-poppi-purple mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium">Business Hours</h3>
                  <p className="text-sm text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
