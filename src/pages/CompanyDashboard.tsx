import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import DataManager, { DataRequest, Company, ComplianceChecklist, Policy, Notification, DEFAULT_COMPLIANCE_RULES } from '../utils/dataManager';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  Shield,
  MessageSquare,
  Building,
  Eye,
  Calendar,
  User,
  Send,
  XCircle,
  Check,
  X
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [complianceChecklist, setComplianceChecklist] = useState<ComplianceChecklist | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [responseStatus, setResponseStatus] = useState<'completed' | 'rejected'>('completed');
  
  const dataManager = DataManager.getInstance();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    // Listen for data updates
    const handleDataUpdate = () => {
      loadData();
    };

    window.addEventListener('optigov-data-updated', handleDataUpdate);
    return () => window.removeEventListener('optigov-data-updated', handleDataUpdate);
  }, [user]);

  const loadData = () => {
    if (!user) return;

    const userCompany = dataManager.getCompanyByUserId(user.id);
    if (userCompany) {
      setCompany(userCompany);
      
      const companyRequests = dataManager.getRequestsByCompany(userCompany.id);
      const companyCompliance = dataManager.getComplianceChecklist(userCompany.id);
      const companyPolicies = dataManager.getPoliciesByCompany(userCompany.id);
      const companyNotifications = dataManager.getNotificationsByCompany(userCompany.id);
      
      setRequests(companyRequests);
      setComplianceChecklist(companyCompliance);
      setPolicies(companyPolicies);
      setNotifications(companyNotifications);
    }
  };

  const handleRespondToRequest = (requestId: string, status: 'completed' | 'rejected') => {
    dataManager.updateRequestStatus(requestId, status);
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status } : req
    ));
    setSelectedRequest(null);
  };

  const handleComplianceToggle = (ruleIndex: number) => {
    if (!company || !complianceChecklist) return;
    
    const newValue = !complianceChecklist.rules[ruleIndex];
    dataManager.updateComplianceRule(company.id, ruleIndex, newValue);
    
    setComplianceChecklist(prev => prev ? {
      ...prev,
      rules: prev.rules.map((rule, index) => index === ruleIndex ? newValue : rule)
    } : null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && company) {
      const policy = dataManager.createPolicy({
        companyId: company.id,
        fileName: file.name
      });
      setPolicies(prev => [...prev, policy]);
    }
  };

  const getComplianceScore = () => {
    if (!complianceChecklist) return 0;
    const completedRules = complianceChecklist.rules.filter(rule => rule).length;
    return Math.round((completedRules / complianceChecklist.rules.length) * 100);
  };

  const getRequestHandlingScore = () => {
    if (requests.length === 0) return 0;
    const completedRequests = requests.filter(req => req.status === 'completed').length;
    return Math.round((completedRequests / requests.length) * 100);
  };

  // Compliance Chart Data
  const complianceScore = getComplianceScore();
  const complianceData = {
    labels: ['Compliant', 'Non-Compliant'],
    datasets: [
      {
        data: [complianceScore, 100 - complianceScore],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  // Request Handling Chart Data
  const requestScore = getRequestHandlingScore();
  const requestData = {
    labels: ['Completed', 'Pending/Rejected'],
    datasets: [
      {
        data: [requestScore, 100 - requestScore],
        backgroundColor: ['#3b82f6', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
    cutout: '70%',
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Company Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Building className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company?.name || user?.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{company?.category || 'Technology'} • {company?.region || 'Lagos'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">{company?.email || user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {requests.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{complianceScore}%</p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Score</h3>
          <div className="relative h-48">
            <Doughnut data={complianceData} options={chartOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{complianceScore}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Compliant</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request Handling</h3>
          <div className="relative h-48">
            <Doughnut data={requestData} options={chartOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{requestScore}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{notification.message}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  {new Date(notification.sentDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Requests</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No requests yet</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Data requests from citizens will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Citizen</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{request.citizenName}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">{request.type}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          request.status === 'completed' ? 'bg-green-600 text-white' :
                          request.status === 'rejected' ? 'bg-red-600 text-white' :
                          'bg-orange-600 text-white'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(request.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="inline-flex items-center px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Respond
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Respond to Request
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Citizen: {selectedRequest.citizenName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Type: {selectedRequest.type}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Description: {selectedRequest.description}</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Response
              </label>
              <select
                value={responseStatus}
                onChange={(e) => setResponseStatus(e.target.value as 'completed' | 'rejected')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="completed">Approve & Complete</option>
                <option value="rejected">Reject</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleRespondToRequest(selectedRequest.id, responseStatus)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Response
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPolicy = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Privacy Policy
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload your company's privacy policy document
              </p>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {policies.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Uploaded Policies</h3>
              <div className="space-y-3">
                {policies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{policy.fileName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Uploaded: {new Date(policy.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance Checklist</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">NDPR Compliance</h3>
            <span className="text-2xl font-bold text-green-600">{complianceScore}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${complianceScore}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3">
          {DEFAULT_COMPLIANCE_RULES.map((rule, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleComplianceToggle(index)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    complianceChecklist?.rules[index]
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {complianceChecklist?.rules[index] && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
                <p className={`text-sm ${
                  complianceChecklist?.rules[index]
                    ? 'text-gray-500 dark:text-gray-400 line-through'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {rule}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'requests':
        return renderRequests();
      case 'policy':
        return renderPolicy();
      case 'compliance':
        return renderCompliance();
      default:
        return renderDashboard();
    }
  };

  return (
    <Layout 
      title="Company Dashboard" 
      activeView={activeView} 
      onViewChange={setActiveView}
    >
      {renderContent()}
    </Layout>
  );
};

export default CompanyDashboard;