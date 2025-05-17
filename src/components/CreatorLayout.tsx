
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  User, 
  DollarSign, 
  Star, 
  Activity, 
  HelpCircle,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CreatorLayout: React.FC = () => {
  const { user, signOut, checkCreatorStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [creatorName, setCreatorName] = useState(localStorage.getItem('creatorName') || 'Creator');
  
  // Verify creator status on mount and when tab becomes visible
  useEffect(() => {
    const verifyCreatorStatus = async () => {
      const isCreator = await checkCreatorStatus();
      if (!isCreator) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Your creator session has expired or is invalid."
        });
        navigate('/');
      }
    };

    verifyCreatorStatus();
    
    // Refresh creator name from local storage
    const storedName = localStorage.getItem('creatorName');
    if (storedName) {
      setCreatorName(storedName);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        verifyCreatorStatus();
        // Refresh creator name from local storage
        const storedName = localStorage.getItem('creatorName');
        if (storedName) {
          setCreatorName(storedName);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate, toast, checkCreatorStatus]);
  
  const handleLogout = async () => {
    try {
      // Clear creator-specific data from local storage
      localStorage.removeItem('creatorId');
      localStorage.removeItem('creatorName');
      localStorage.removeItem('isCreator');
      
      // Sign out the user
      await signOut();
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out from the creator dashboard."
      });
      
      // Explicitly navigate to login page after logout
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again."
      });
    }
  };

  const goToMainWebsite = () => {
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/creator' || path === '/creator/') {
      return location.pathname === '/creator' || location.pathname === '/creator/';
    }
    return location.pathname.startsWith(path);
  };

  const getPageTitle = () => {
    if (location.pathname === '/creator' || location.pathname === '/creator/') return "Dashboard";
    if (location.pathname === '/creator/requests') return "Video Requests";
    if (location.pathname === '/creator/profile') return "Profile Settings";
    if (location.pathname === '/creator/revenue') return "Revenue & Payouts";
    if (location.pathname === '/creator/reviews') return "Fan Reviews";
    if (location.pathname === '/creator/activity') return "Activity Status";
    if (location.pathname === '/creator/help') return "Help & Support";
    return "";
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <Link to="/creator" className="text-poppi-purple text-xl font-bold flex items-center">
            {!collapsed && "POPPI"}
            {collapsed && "P"}
          </Link>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 py-6">
          <NavItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="Dashboard" 
            active={isActive('/creator')}
            onClick={() => navigate('/creator')}
            collapsed={collapsed}
          />
          <NavItem 
            icon={<Video className="h-5 w-5" />} 
            label="Video Requests" 
            active={isActive('/creator/requests')}
            onClick={() => navigate('/creator/requests')}
            collapsed={collapsed}
          />
          <NavItem 
            icon={<User className="h-5 w-5" />} 
            label="Profile Settings" 
            active={isActive('/creator/profile')}
            onClick={() => navigate('/creator/profile')}
            collapsed={collapsed}
          />
          <NavItem 
            icon={<DollarSign className="h-5 w-5" />} 
            label="Revenue & Payouts" 
            active={isActive('/creator/revenue')}
            onClick={() => navigate('/creator/revenue')}
            collapsed={collapsed}
          />
          <NavItem 
            icon={<Star className="h-5 w-5" />} 
            label="Fan Reviews" 
            active={isActive('/creator/reviews')}
            onClick={() => navigate('/creator/reviews')}
            collapsed={collapsed}
          />
          <NavItem 
            icon={<Activity className="h-5 w-5" />} 
            label="Activity Status" 
            active={isActive('/creator/activity')}
            onClick={() => navigate('/creator/activity')}
            collapsed={collapsed}
          />
          <NavItem 
            icon={<HelpCircle className="h-5 w-5" />} 
            label="Help & Support" 
            active={isActive('/creator/help')}
            onClick={() => navigate('/creator/help')}
            collapsed={collapsed}
          />
        </div>
        
        {/* User Info & Main Website Link */}
        <div className="p-4 border-t border-gray-200">
          {!collapsed && (
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-poppi-purple flex items-center justify-center text-white mr-2">
                {creatorName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{creatorName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          )}
          
          <button 
            className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors`}
            onClick={goToMainWebsite}
          >
            <Home className="h-5 w-5 mr-2" />
            {!collapsed && "Go to Main Website"}
          </button>
          
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 w-full"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? ">>" : "<<"}
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-3 px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">
              {getPageTitle()}
            </h1>
            
            <div className="flex items-center">
              <button className="mr-4 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
              
              <button className="mr-4 text-gray-600 relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-poppi-purple rounded-full w-4 h-4 flex items-center justify-center text-white text-xs">
                  3
                </span>
              </button>
              
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-poppi-purple flex items-center justify-center text-white">
                  {creatorName.charAt(0)}
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-700">{creatorName}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'creator@example.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="bg-gray-50 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, onClick, collapsed }) => {
  return (
    <button
      className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} px-6 py-3 my-1 transition-colors ${
        active ? 'bg-poppi-light-bg text-poppi-purple font-medium' : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <div className={collapsed ? '' : 'mr-3'}>{icon}</div>
      {!collapsed && label}
    </button>
  );
};

export default CreatorLayout;
