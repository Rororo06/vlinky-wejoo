
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/sonner';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { user, signOut, isCreator } = useAuth();
  const { toast: hookToast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('isCreator');
      localStorage.removeItem('creatorId');
      localStorage.removeItem('creatorName');
      
      await signOut();
      
      hookToast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      hookToast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
      });
    }
  };

  const handleJoinAsCreator = () => {
    if (user) {
      // User is logged in, navigate to join page
      navigate('/join');
    } else {
      // User is not logged in, show dialog
      setLoginDialogOpen(true);
    }
  };

  const handleLoginRedirect = () => {
    setLoginDialogOpen(false);
    // Use navigate with state to return to /join after login
    navigate('/login', { state: { from: '/join' } });
  };

  return (
    <header className="border-b border-gray-200 py-3 bg-white sticky top-0 z-50">
      <div className="section-container flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-[#9062f5] text-xl font-bold">
            VLINKY
          </Link>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search creators, languages, platforms, countries..."
              className="search-input pl-10 pr-4 py-2 w-64 lg:w-80 text-sm rounded-full border border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <nav className="flex items-center gap-4">
          <Link to="/creators" className="text-sm font-medium text-gray-600 hover:text-[#9062f5]">
            Find Creators
          </Link>
          <Link to={user ? "/favorites" : "/login"} className="text-sm font-medium text-gray-600 hover:text-[#9062f5]">
            Favorites
          </Link>
          {user && (
            <Link to="/my-videos" className="text-sm font-medium text-gray-600 hover:text-[#9062f5] flex items-center gap-1">
              <Film className="h-4 w-4" />
              My Videos
            </Link>
          )}
          {isCreator && (
            <Link to="/creator" className="text-sm font-medium text-gray-600 hover:text-[#9062f5]">
              Creator Dashboard
            </Link>
          )}
          <Link to="/profile" className="text-sm font-medium text-gray-600 hover:text-[#9062f5]">
            My Profile
          </Link>
          <Link to="/faq" className="text-sm font-medium text-gray-600 hover:text-[#9062f5]">
            FAQ
          </Link>
          <div>
            <span className="text-sm font-medium text-gray-600">English</span>
          </div>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-100 text-gray-700 rounded-full text-sm px-4 py-1 h-auto flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>{user.email?.split('@')[0] || 'Account'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/my-videos')}>
                  My Videos
                </DropdownMenuItem>
                {isCreator && (
                  <DropdownMenuItem onClick={() => navigate('/creator')}>
                    Creator Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button className="bg-[#9062f5] hover:bg-[#7d50e0] text-white rounded-md text-sm px-4 py-1 h-auto">
                  Log In
                </Button>
              </Link>
              
              <Link to="/signup">
                <Button variant="outline" className="border-[#9062f5] text-[#9062f5] hover:bg-[#9062f5] hover:text-white rounded-md text-sm px-4 py-1 h-auto">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
          
          {/* Join as Creator Button */}
          <Button 
            onClick={handleJoinAsCreator}
            className="bg-white border border-[#9062f5] text-[#9062f5] hover:bg-[#9062f5] hover:text-white rounded-md text-sm px-4 py-1 h-auto"
          >
            Join as Creator
          </Button>
        </nav>
      </div>

      {/* Login Required Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to apply as a creator. Please log in or create an account to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setLoginDialogOpen(false)}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-[#9062f5] text-[#9062f5] hover:bg-[#9062f5] hover:text-white"
                onClick={() => {
                  setLoginDialogOpen(false);
                  navigate('/signup');
                }}
              >
                Create Account
              </Button>
              <Button 
                onClick={handleLoginRedirect}
                className="bg-[#9062f5] hover:bg-[#7d50e0] text-white"
              >
                Log In
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
