import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import DataManager, { Company, User } from '../utils/dataManager';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  Building, 
  Users, 
  FileText,
  TrendingUp,
  Shield,
  Plus,
  Send,
  Download,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  UserX,
  RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    region: '',
    category: ''
  });
  
  const dataManager = DataManager.getInstance();

  const regions = ['Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Ibadan', 'Kaduna'];
  const categories = ['Banking', 'Fintech', 'E-commerce', 'Telecommunications', 'Technology', 'Healthcare'];

  useEffect(() => {
    // Check if user has correct role
    if (user && user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    loadData();
  }, []);

  useEffect(() => {
    // Listen for data updates
    const handleDataUpdate = () => {
      loadData();
    };

    window.addEventListener('optigov-data-updated', handleDataUpdate);
    return () => window.removeEventListener('optigov-data-updated', handleDataUpdate);
  }, []);

  const loadData = () => {
    const allCompanies = dataManager.getCompanies();
    const allUsers = dataManager.getAllUsers();
    const analyticsData = dataManager.getAnalytics();
    
    setCompanies(allCompanies);
    setUsers(allUsers);
    setAnalytics(analyticsData);
  };

  const handleAddCompany = () => {
    if (!newCompany.name || !newCompany.email || !newCompany.region || !newCompany.category) {
      showToast('All fields are required', 'error');
      return;
    }

    try {
      const companyUser = dataManager.createUser({
        username: newCompany.name.toLowerCase().replace(/\s+/g, ''),
        email: newCompany.email,
        password: 'password123',
        phone: '+234' + Math.floor(Math.random() * 9000000000 + 1000000000),
        role: 'company',
        organizationName: newCompany.name,
        organizationType: newCompany.category,
        registrationNumber: `RC${Math.floor(Math.random() * 9000) + 1000}`,
        contactPerson: 'Johnson Blessing',
        address: `${newCompany.region}, Nigeria`,
        website: `https://${newCompany.name.toLowerCase().replace(/\s+/g, '')}.com`
      });

      loadData();
      setNewCompany({ name: '', email: '', region: '', category: '' });
      setShowAddCompany(false);
      showToast('Company added successfully', 'success');
    } catch (error) {
      showToast('Failed to add company. Email may already exist.', 'error');
    }
  };

  const handleSendNotification = () => {
    if (!selectedCompany || !notificationMessage) {
      showToast('Please select a company and enter a message', 'error');
      return;
    }

    const notification = dataManager.createNotification({
      recipientId: selectedCompany,
      role: 'company',
      message: notificationMessage,
      type: 'warning'
    });

    setNotificationMessage('');
    setSelectedCompany('');
    showToast('Notification sent successfully', 'success');
  };

  const handleDeactivateUser = (userId: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      dataManager.updateUser(userId, { isActive: false });
      loadData();
      showToast('User deactivated successfully', 'success');
    }
  };

  const handleReactivateUser = (userId: string) => {
    dataManager.updateUser(userId, { isActive: true });
    loadData();
    showToast('User reactivated successfully', 'success');
  };

  const generatePDFReport = () => {
    if (!analytics) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('OptiGov Platform Report', 20, 30);
    
    doc.setFontSize(14);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Generated by: ${user?.username}`, 20, 65);
    
    doc.setFontSize(12);
    doc.text('Platform Statistics:', 20, 85);
    doc.text(`Total Citizens: ${analytics.totalCitizens}`, 25, 100);
    doc.text(`Total Companies: ${analytics.totalCompanies}`, 25, 115);
    doc.text(`Total Admins: ${analytics.totalAdmins}`, 25, 130);
    doc.text(`Total Requests: ${analytics.totalRequests}`, 25, 145);
    doc.text(`Completed Requests: ${analytics.completedRequests}`, 25, 160);
    doc.text(`Pending Requests: ${analytics.pendingRequests}`, 25, 175);
    doc.text(`Rejected Requests: ${analytics.rejectedRequests}`, 25, 190);
    doc.text(`Completion Rate: ${analytics.completionRate}%`, 25, 205);
    
    doc.text('Top Companies by Requests:', 20, 225);
    companies.slice(0, 10).forEach((company, index) => {
      const y = 240 + (index * 15);
      const complianceScore = company.totalRequests > 0 
        ? Math.round((company.completedRequests / company.totalRequests) * 100)
        : 0;
      doc.text(`${company.name}: ${company.totalRequests} requests (${complianceScore}% completion)`, 25, y);
    });
    
    doc.save(`optigov-platform-report-${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('PDF report generated successfully', 'success');
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.organizationName && u.organizationName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const renderCompanies = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Companies</h2>
        <button
          onClick={() => setShowAddCompany(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </button>
      </div>

      {/* Add Company Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Company</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Company Name"
                value={newCompany.name}
                onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email"
                value={newCompany.email}
                onChange={(e) => setNewCompany(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <select
                value={newCompany.region}
                onChange={(e) => setNewCompany(prev => ({ ...prev, region: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <select
                value={newCompany.category}
                onChange={(e) => setNewCompany(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddCompany}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Company
              </button>
              <button
                onClick={() => setShowAddCompany(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          {companies.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No companies yet</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Add companies to start monitoring compliance.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Region</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Total Requests</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Completed</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Compliance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => {
                    const complianceScore = company.totalRequests > 0 
                      ? Math.round((company.completedRequests / company.totalRequests) * 100)
                      : 0;
                    return (
                      <tr key={company.id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{company.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{company.region}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{company.category}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{company.totalRequests}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{company.completedRequests}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            complianceScore >= 80 ? 'bg-green-600 text-white' :
                            complianceScore >= 60 ? 'bg-yellow-600 text-white' :
                            'bg-red-600 text-white'
                          }`}>
                            {complianceScore}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedCompany(company.id)}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              title="Send Notification"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = getFilteredUsers();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h2>
          <button
            onClick={loadData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="citizen">Citizens</option>
                <option value="company">Companies</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Last Activity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.role === 'citizen' ? `${user.firstName} ${user.lastName}` : 
                               user.role === 'company' ? user.organizationName : 
                               user.username}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'citizen' ? 'bg-green-100 text-green-800' :
                            user.role === 'company' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(user.lastActivity).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {user.isActive ? (
                              <button
                                onClick={() => handleDeactivateUser(user.id)}
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Deactivate User"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivateUser(user.id)}
                                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                title="Reactivate User"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalysis = () => {
    if (!analytics) return <div>Loading...</div>;

    // Requests by Region
    const regionData = {
      labels: Object.keys(analytics.requestsByRegion),
      datasets: [
        {
          label: 'Requests by Region',
          data: Object.values(analytics.requestsByRegion),
          backgroundColor: '#3b82f6',
          borderColor: '#1d4ed8',
          borderWidth: 1,
        },
      ],
    };

    // Requests Over Time
    const timeData = {
      labels: Object.keys(analytics.requestsOverTime),
      datasets: [
        {
          label: 'Total Requests',
          data: Object.values(analytics.requestsOverTime),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };

    // Request Outcomes
    const outcomeData = {
      labels: ['Completed', 'Pending', 'Rejected'],
      datasets: [
        {
          data: [analytics.completedRequests, analytics.pendingRequests, analytics.rejectedRequests],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 0,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    };

    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
      },
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Citizens</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalCitizens}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalCompanies}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalRequests}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requests by Region</h3>
            <div className="h-64">
              <Bar data={regionData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requests Over Time</h3>
            <div className="h-64">
              <Line data={timeData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request Outcomes</h3>
            <div className="h-64">
              <Pie data={outcomeData} options={pieOptions} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {users.filter(u => u.isActive).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Response Time</span>
                <span className="font-semibold text-gray-900 dark:text-white">2.3 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Platform Uptime</span>
                <span className="font-semibold text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Data Breaches</span>
                <span className="font-semibold text-green-600">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h2>
        <button
          onClick={generatePDFReport}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Generate PDF Report
        </button>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Citizens</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalCitizens}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalCompanies}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalRequests}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.completionRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Summary</h3>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400">
            This report provides a comprehensive overview of the OptiGov platform's performance and compliance metrics.
            The data includes user registrations, company onboarding, data request processing, and overall compliance rates.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Report generated by: {user?.username}
          </p>
        </div>
      </div>

      {/* Company Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Compliance Leaderboard</h3>
        <div className="space-y-3">
          {companies
            .sort((a, b) => {
              const aScore = a.totalRequests > 0 ? (a.completedRequests / a.totalRequests) * 100 : 0;
              const bScore = b.totalRequests > 0 ? (b.completedRequests / b.totalRequests) * 100 : 0;
              return bScore - aScore;
            })
            .slice(0, 10)
            .map((company, index) => {
              const complianceScore = company.totalRequests > 0 
                ? Math.round((company.completedRequests / company.totalRequests) * 100)
                : 0;
              return (
                <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {company.totalRequests} requests processed
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    complianceScore >= 80 ? 'bg-green-600 text-white' :
                    complianceScore >= 60 ? 'bg-yellow-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {complianceScore}%
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send Notifications</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Choose a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Message
            </label>
            <textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter notification message..."
            />
          </div>
          
          <button
            onClick={handleSendNotification}
            disabled={!selectedCompany || !notificationMessage}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Warning
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company List</h3>
        <div className="space-y-3">
          {companies.map((company) => (
            <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{company.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {company.warnings.length} warnings sent
                </p>
              </div>
              <button
                onClick={() => setSelectedCompany(company.id)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'companies':
        return renderCompanies();
      case 'users':
        return renderUsers();
      case 'analysis':
        return renderAnalysis();
      case 'reports':
        return renderReports();
      case 'notifications':
        return renderNotifications();
      default:
        return renderCompanies();
    }
  };

  return (
    <Layout 
      title="Admin Dashboard" 
      activeView={activeView} 
      onViewChange={setActiveView}
    >
      {renderContent()}
    </Layout>
  );
};

export default AdminDashboard;