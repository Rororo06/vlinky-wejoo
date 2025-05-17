
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-6">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-bold mb-4">Join our mailing list</h3>
            <p className="text-gray-600 text-sm mb-4">Stay updated with the latest creators and exclusive offers</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="border border-gray-300 rounded-l-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#9062f5]"
              />
              <Button className="bg-[#9062f5] hover:bg-[#7d50e0] text-white rounded-r-md rounded-l-none">
                Subscribe
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 hover:text-[#9062f5] text-sm">About</Link></li>
              <li><Link to="/help" className="text-gray-600 hover:text-[#9062f5] text-sm">Help</Link></li>
              <li><Link to="/faq" className="text-gray-600 hover:text-[#9062f5] text-sm">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/refunds" className="text-gray-600 hover:text-[#9062f5] text-sm">Refunds</Link></li>
              <li><Link to="/terms-of-service" className="text-gray-600 hover:text-[#9062f5] text-sm">Terms of Service</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-600 hover:text-[#9062f5] text-sm">Privacy Policy</Link></li>
              <li><Link to="/content-policy" className="text-gray-600 hover:text-[#9062f5] text-sm">Content Policy</Link></li>
              <li><Link to="/cookie-policy" className="text-gray-600 hover:text-[#9062f5] text-sm">Cookie Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/legal" className="text-gray-600 hover:text-[#9062f5] text-sm">Legal</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4 md:mb-0">© 2025 VLINKY. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="https://instagram.com" className="text-gray-600 hover:text-[#9062f5]">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://twitter.com" className="text-gray-600 hover:text-[#9062f5]">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="mailto:hello@vlinky.com" className="text-gray-600 hover:text-[#9062f5]">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
