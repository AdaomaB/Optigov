import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Mail, Phone, Lock, User, Eye, EyeOff, Sun, Moon, AlertCircle } from 'lucide-react';

type UserRole = 'citizen' | 'company' | 'admin';
type FormMode = 'login' | 'signup';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UserRole>('citizen');
  const [formMode, setFormMode] = useState<FormMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const { login, register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const tabs: { key: UserRole; label: string; color: string }[] = [
    { key: 'citizen', label: 'Citizen', color: 'bg-green-600' },
    { key: 'company', label: 'Company', color: 'bg-blue-600' },
    { key: 'admin', label: 'Admin', color: 'bg-purple-600' }
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (formMode === 'login') {
        const success = await login(formData.email, formData.password);
        if (success) {
          // Redirect based on role
          switch (activeTab) {
            case 'citizen':
              navigate('/citizen-dashboard');
              break;
            case 'company':
              navigate('/company-dashboard');
              break;
            case 'admin':
              navigate('/admin-dashboard');
              break;
          }
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Validation for signup
        if (!formData.name.trim()) {
          setError('Full name is required');
          return;
        }
        
        if (!validateEmail(formData.email)) {
          setError('Please enter a valid email address');
          return;
        }
        
        if (!validatePhone(formData.phone)) {
          setError('Please enter a valid Nigerian phone number');
          return;
        }
        
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        const success = await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: activeTab
        });

        if (success) {
          // Redirect based on role
          switch (activeTab) {
            case 'citizen':
              navigate('/citizen-dashboard');
              break;
            case 'company':
              navigate('/company-dashboard');
              break;
            case 'admin':
              navigate('/admin-dashboard');
              break;
          }
        } else {
          setError('User with this email already exists');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

  const switchMode = (mode: FormMode) => {
    setFormMode(mode);
    resetForm();
  };

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-500" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Shield className="h-10 w-10 text-green-600" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">OptiGov</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {formMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {formMode === 'login' ? 'Sign in to your account' : 'Join OptiGov to protect your data rights'}
          </p>
        </div>

        {/* Role Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex-1 py-4 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? `${tab.color} text-white`
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  formMode === 'login'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  formMode === 'signup'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {formMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {formMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={formMode === 'login' ? 'Enter your password' : 'Create a password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {formMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  tabs.find(t => t.key === activeTab)?.color
                } text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (formMode === 'login' ? 'Signing In...' : 'Creating Account...') : (formMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;