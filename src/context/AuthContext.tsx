import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataManager, { User } from '../utils/dataManager';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'lastActivity' | 'isActive'>) => Promise<boolean>;
  isLoading: boolean;
  sessionTimeout: number;
  resetSessionTimeout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(SESSION_TIMEOUT);
  const navigate = useNavigate();
  const dataManager = DataManager.getInstance();

  useEffect(() => {
    // Check for existing session
    const currentUser = dataManager.getCurrentUser();
    if (currentUser) {
      const existingUser = dataManager.getUserById(currentUser.id);
      if (existingUser) {
        setUser(existingUser);
        resetSessionTimeout();
      } else {
        dataManager.clearCurrentUser();
      }
    }
    setIsLoading(false);
  }, []);

  // Session timeout management
  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      // Show warning modal before logout
      const shouldLogout = window.confirm(
        'Your session will expire in 1 minute due to inactivity. Click OK to stay logged in.'
      );
      
      if (!shouldLogout) {
        logout();
      } else {
        resetSessionTimeout();
      }
    }, sessionTimeout - 60000); // Warning 1 minute before timeout

    const logoutTimer = setTimeout(() => {
      logout();
    }, sessionTimeout);

    return () => {
      clearTimeout(timer);
      clearTimeout(logoutTimer);
    };
  }, [user, sessionTimeout]);

  const resetSessionTimeout = () => {
    setSessionTimeout(SESSION_TIMEOUT);
  };

  // Reset timeout on user activity
  useEffect(() => {
    const handleActivity = () => {
      if (user) {
        resetSessionTimeout();
        dataManager.updateUserActivity(user.id);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const foundUser = dataManager.getUser(email, password);
      if (foundUser) {
        setUser(foundUser);
        resetSessionTimeout();
        dataManager.logActivity(foundUser.id, 'User Login', `${foundUser.role} logged in`, 'login');
        
        // Navigate based on role
        if (foundUser.role === 'citizen') {
          navigate('/citizen');
        } else if (foundUser.role === 'company') {
          navigate('/company');
        } else if (foundUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'lastActivity' | 'isActive'>): Promise<boolean> => {
    try {
      const newUser = dataManager.createUser(userData);
      setUser(newUser);
      resetSessionTimeout();
      
      // Navigate based on role
      if (newUser.role === 'citizen') {
        navigate('/citizen');
      } else if (newUser.role === 'company') {
        navigate('/company');
      } else if (newUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    if (user) {
      dataManager.logActivity(user.id, 'User Logout', `${user.role} logged out`, 'login');
    }
    setUser(null);
    dataManager.clearCurrentUser();
    setSessionTimeout(SESSION_TIMEOUT);
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      isLoading, 
      sessionTimeout,
      resetSessionTimeout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};