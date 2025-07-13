import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Shield, 
  Menu, 
  X, 
  Sun, 
  Moon,
  LogOut,
  Home,
  FileText,
  Building,
  Users,
  Settings,
  Upload,
  BarChart3,
  Bell,
  AlertTriangle,
  Send,
  CheckSquare,
  Eye,
  UserCheck
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, activeView, onViewChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'citizen':
        return [
          { id: 'dashboard', icon: Home, label: 'Dashboard' },
          { id: 'rights', icon: Shield, label: 'NDPR Rights' },
          { id: 'submit', icon: Send, label: 'Submit Request' },
          { id: 'requests', icon: FileText, label: 'My Requests' },
          { id: 'alerts', icon: AlertTriangle, label: 'Alerts' },
        ];
      case 'company':
        return [
          { id: 'dashboard', icon: Home, label: 'Dashboard' },
          { id: 'requests', icon: FileText, label: 'Requests' },
          { id: 'policy', icon: Upload, label: 'Upload Policy' },
          { id: 'compliance', icon: CheckSquare, label: 'Compliance' },
        ];
      case 'admin':
        return [
          { id: 'companies', icon: Building, label: 'Companies' },
          { id: 'users', icon: Users, label: 'Manage Users' },
          { id: 'analysis', icon: BarChart3, label: 'Analysis' },
          { id: 'reports', icon: FileText, label: 'Reports' },
          { id: 'notifications', icon: Bell, label: 'Notifications' },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const getUserDisplayName = () => {
    if (!user) return '';
    
    switch (user.role) {
      case 'citizen':
        return `${user.firstName} ${user.lastName}` || user.username;
      case 'company':
        return user.organizationName || user.username;
      case 'admin':
        return user.username;
      default:
        return user.username;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">OptiGov</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <nav className="mt-8 px-4">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange?.(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors mb-2 ${
                activeView === item.id
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-5 w-5 text-gray-500" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-500" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;