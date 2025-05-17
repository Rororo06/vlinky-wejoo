
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  DollarSign, 
  Star, 
  Settings, 
  Bell, 
  ClipboardList, 
  LogOut,
  UserCheck
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Clear admin authentication
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className="w-[300px] bg-[#0e0e0e] border-r border-gray-800 flex flex-col">
        <div className="p-4 flex items-center border-b border-gray-800">
          <div className="text-white font-bold text-xl flex items-center">
            <LayoutDashboard className="mr-2 h-5 w-5" />
            POPPI Admin
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 p-4 flex flex-col gap-1">
          <NavItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="Dashboard" 
            active={isActive('/admin')}
            onClick={() => navigate('/admin')}
          />
          <NavItem 
            icon={<UserCheck className="h-5 w-5" />} 
            label="Pending Verifications" 
            active={isActive('/admin/pending-verifications')}
            onClick={() => navigate('/admin/pending-verifications')}
          />
          <NavItem 
            icon={<Users className="h-5 w-5" />} 
            label="Creators" 
            active={isActive('/admin/creators')}
            onClick={() => navigate('/admin/creators')}
          />
          <NavItem 
            icon={<Video className="h-5 w-5" />} 
            label="Video Requests" 
            active={isActive('/admin/video-requests')}
            onClick={() => navigate('/admin/video-requests')}
          />
          <NavItem 
            icon={<DollarSign className="h-5 w-5" />} 
            label="Revenue" 
            active={isActive('/admin/revenue')}
            onClick={() => navigate('/admin/revenue')}
          />
          <NavItem 
            icon={<Star className="h-5 w-5" />} 
            label="Reviews" 
            active={isActive('/admin/reviews')}
            onClick={() => navigate('/admin/reviews')}
          />
          <NavItem 
            icon={<Settings className="h-5 w-5" />} 
            label="Settings" 
            active={isActive('/admin/settings')}
            onClick={() => navigate('/admin/settings')}
          />
          <NavItem 
            icon={<Bell className="h-5 w-5" />} 
            label="Notifications" 
            active={isActive('/admin/notifications')}
            onClick={() => navigate('/admin/notifications')}
          />
          <NavItem 
            icon={<ClipboardList className="h-5 w-5" />} 
            label="Activity Logs" 
            active={isActive('/admin/activity-logs')}
            onClick={() => navigate('/admin/activity-logs')}
          />
        </div>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button 
            className="w-full flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[#111111]">
        {children}
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, onClick }) => {
  return (
    <button
      className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
        active ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
      }`}
      onClick={onClick}
    >
      <div className="mr-3">{icon}</div>
      {label}
    </button>
  );
};

export default AdminLayout;
