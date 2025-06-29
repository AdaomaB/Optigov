import React, { createContext, useContext, useState, useEffect } from 'react';
import DataManager, { User } from '../utils/dataManager';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'citizen' | 'company' | 'admin';
  }) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dataManager = DataManager.getInstance();

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('optigov_current_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const existingUser = dataManager.getUserById(userData.id);
        if (existingUser) {
          setUser(existingUser);
        } else {
          localStorage.removeItem('optigov_current_user');
        }
      } catch (error) {
        localStorage.removeItem('optigov_current_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = dataManager.getUser(email, password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('optigov_current_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'citizen' | 'company' | 'admin';
  }): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = dataManager.getUser(userData.email, userData.password);
      if (existingUser) {
        return false; // User already exists
      }

      const newUser = dataManager.createUser(userData);
      setUser(newUser);
      localStorage.setItem('optigov_current_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('optigov_current_user');
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
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
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