import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Shield, 
  Users, 
  Building, 
  FileCheck, 
  Lock, 
  Eye,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle,
  BarChart3,
  UserCheck,
  Database,
  TrendingUp,
  Star,
  Play
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const coreFeatures = [
    {
      icon: Shield,
      title: 'Breach Data Protection',
      description: 'Advanced security measures to protect your personal data from breaches and unauthorized access.',
      color: 'text-green-500'
    },
    {
      icon: FileCheck,
      title: 'Regulatory Compliance',
      description: 'Ensure full compliance with Nigerian Data Protection Regulation (NDPR) requirements.',
      color: 'text-blue-500'
    },
    {
      icon: Database,
      title: 'Seamless Data Integration',
      description: 'Integrate and manage data across multiple platforms with our seamless integration tools.',
      color: 'text-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Corporate Compliance Audit',
      description: 'Comprehensive audit tools to ensure your organization meets all compliance standards.',
      color: 'text-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'Transparent Data Insights',
      description: 'Get clear insights into data usage patterns and compliance metrics across your organization.',
      color: 'text-cyan-500'
    },
    {
      icon: UserCheck,
      title: 'Improved Data Practices',
      description: 'Implement best practices for data handling and protection with our expert guidance.',
      color: 'text-pink-500'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Register Your Account',
      description: 'Create your account and verify your identity to get started with OptiGov data protection services.',
      icon: UserCheck
    },
    {
      step: '2',
      title: 'Manage Your Data Rights',
      description: 'Exercise your data rights including access, deletion, and portability requests through our platform.',
      icon: Shield
    },
    {
      step: '3',
      title: 'Track Compliance Status',
      description: 'Monitor compliance status and receive real-time updates on your data protection activities.',
      icon: BarChart3
    },
    {
      step: '4',
      title: 'Receive Real-Time Notifications',
      description: 'Get instant notifications about data breaches, policy updates, and compliance requirements.',
      icon: Eye
    }
  ];

  const statistics = [
    { value: '50K+', label: 'Active Users', color: 'text-green-500' },
    { value: '2K+', label: 'Companies Protected', color: 'text-blue-500' },
    { value: '500+', label: 'Data Requests Processed', color: 'text-purple-500' },
    { value: '48hrs', label: 'Average Response Time', color: 'text-orange-500' }
  ];

  const testimonials = [
    {
      name: 'Adebayo Johnson',
      role: 'Data Protection Officer',
      company: 'TechCorp Nigeria',
      content: 'OptiGov has revolutionized how we handle data protection compliance. The platform is intuitive and comprehensive.',
      avatar: 'AJ'
    },
    {
      name: 'Fatima Abdullahi',
      role: 'Compliance Manager',
      company: 'FinanceHub Ltd',
      content: 'The real-time monitoring and automated compliance reports have saved us countless hours and ensured we stay compliant.',
      avatar: 'FA'
    },
    {
      name: 'Chinedu Okafor',
      role: 'IT Director',
      company: 'DataSafe Solutions',
      content: 'Outstanding platform for managing NDPR compliance. The user interface is clean and the features are exactly what we needed.',
      avatar: 'CO'
    }
  ];

  const trustedLogos = [
    { name: 'GTBank', icon: Building },
    { name: 'Jumia', icon: Building },
    { name: 'Paystack', icon: Building },
    { name: 'Flutterwave', icon: Building },
    { name: 'MTN', icon: Building }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold text-white">OptiGov</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors border border-gray-600"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-400" />}
              </button>
              <Link
                to="/login"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Empowering Citizens. Guiding
            <br />
            <span className="text-green-500">Organizations. Enforcing Compliance.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Take control of your personal data with OptiGov - Nigeria's most comprehensive NDPR compliance platform. 
            Protect your privacy, exercise your rights, and ensure organizations handle your data responsibly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 font-semibold text-lg group transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="inline-flex items-center px-8 py-4 border-2 border-gray-600 text-white rounded-lg hover:border-green-500 transition-all duration-300 font-semibold text-lg group">
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Core Features</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive tools and services designed to protect your data and ensure compliance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-900 rounded-xl p-8 hover:bg-gray-750 transition-all duration-300 hover:transform hover:scale-105 border border-gray-700 hover:border-green-500/50"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gray-800 mb-6`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How OptiGov Works */}
      <section id="how-it-works" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How OptiGov Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Simple steps to get started with comprehensive data protection
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {howItWorks.map((item, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <item.icon className="h-6 w-6 text-green-500 mr-3" />
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NDPR Impact & Statistics */}
      <section className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">NDPR Impact & Statistics</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Real numbers showing our impact on data protection in Nigeria
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by Leading Organizations */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Trusted by Leading Organizations</h2>
          </div>
          
          <div className="flex justify-center items-center space-x-12 opacity-60">
            {trustedLogos.map((logo, index) => (
              <div key={index} className="flex items-center space-x-2">
                <logo.icon className="h-8 w-8 text-gray-400" />
                <span className="text-gray-400 font-medium">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Our Users Say */}
      <section id="testimonials" className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Hear from organizations and individuals who trust OptiGov with their data protection needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-900 rounded-xl p-8 border border-gray-700">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                    <div className="text-gray-500 text-sm">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Protect Your Data */}
      <section className="py-24 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Protect Your Data?</h2>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            Join thousands of Nigerians who have taken control of their data privacy with OptiGov. 
            Start your journey towards complete data protection today.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold text-lg group transform hover:scale-105"
          >
            Get Started Now
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-8 w-8 text-green-500" />
                <span className="text-2xl font-bold text-white">OptiGov</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Empowering Nigerians with comprehensive data protection and NDPR compliance tools. 
                Your privacy is our priority.
              </p>
              <div className="flex items-center space-x-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                />
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Subscribe
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">NDPR Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 OptiGov. All rights reserved. Built for Nigeria's data protection needs.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;