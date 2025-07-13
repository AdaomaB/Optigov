import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import DataManager, { DataRequest, Alert, DEFAULT_COMPLIANCE_RULES, User } from '../utils/dataManager';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  Download, 
  Send,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  User as UserIcon,
  Building,
  Calendar,
  Bell,
  Settings,
  Lock,
  Database,
  UserCheck,
  FileCheck,
  Zap,
  Home,
  Users,
  Activity,
  Award,
  BookOpen,
  HelpCircle,
  ExternalLink,
  Flag,
  Edit,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';

interface NDPRRight {
  id: string;
  title: string;
  description: string;
  icon: any;
  details: string;
}

const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [companies, setCompanies] = useState<User[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showRightModal, setShowRightModal] = useState<NDPRRight | null>(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [requestType, setRequestType] = useState<'access' | 'delete'>('access');
  const [requestDescription, setRequestDescription] = useState('');
  const [requestPriority, setRequestPriority] = useState<'high' | 'normal'>('normal');
  const [editingRequest, setEditingRequest] = useState<DataRequest | null>(null);
  
  const dataManager = DataManager.getInstance();

  const ndprRights: NDPRRight[] = [
    {
      id: '1',
      title: 'Right to be Informed',
      description: 'Know how your personal data is being used',
      details: 'You have the right to be informed about the collection and use of your personal data. This includes information about what data is collected, how it is used, how long it is kept, and whether it is shared with third parties.',
      icon: Eye
    },
    {
      id: '2',
      title: 'Right of Access',
      description: 'Request access to your personal data',
      details: 'You have the right to request access to your personal data and to ask how your data is processed. This is commonly known as making a subject access request.',
      icon: FileText
    },
    {
      id: '3',
      title: 'Right to Rectification',
      description: 'Correct inaccurate personal data',
      details: 'You have the right to have inaccurate personal data rectified, or completed if it is incomplete. You can request that incorrect or incomplete data be corrected.',
      icon: FileCheck
    },
    {
      id: '4',
      title: 'Right to Erasure (Right to be Forgotten)',
      description: 'Request deletion of your personal data',
      details: 'You have the right to request the deletion or removal of personal data where there is no compelling reason for its continued processing.',
      icon: Trash2
    },
    {
      id: '5',
      title: 'Right to Restrict Processing',
      description: 'Limit how your data is processed',
      details: 'You have the right to request the restriction or suppression of your personal data. This is not an absolute right and only applies in certain circumstances.',
      icon: Lock
    },
    {
      id: '6',
      title: 'Right to Data Portability',
      description: 'Transfer your data between services',
      details: 'You have the right to obtain and reuse your personal data for your own purposes across different services. This allows you to move, copy or transfer personal data easily from one IT environment to another.',
      icon: Database
    },
    {
      id: '7',
      title: 'Right to Object',
      description: 'Object to processing of your data',
      details: 'You have the right to object to the processing of your personal data in certain circumstances. This includes processing for direct marketing purposes.',
      icon: Shield
    }
  ];

  useEffect(() => {
    // Check if user has correct role
    if (user && user.role !== 'citizen') {
      navigate('/login');
      return;
    }
    
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

    const userRequests = dataManager.getRequestsByUser(user.id);
    const userAlerts = dataManager.getAlertsByUser(user.id);
    const allUsers = dataManager.getAllUsers();
    const companyUsers = allUsers.filter(u => u.role === 'company');

    setRequests(userRequests);
    setAlerts(userAlerts);
    setCompanies(companyUsers);
  };

  const handleSubmitRequest = () => {
    if (!selectedCompany || !requestDescription || !user) return;

    const company = companies.find(c => c.id === selectedCompany);
    if (!company) return;

    const requestData = {
      citizenId: user.id,
      companyId: selectedCompany,
      citizenName: `${user.firstName} ${user.lastName}` || user.username,
      companyName: company.organizationName || company.username,
      type: requestType,
      status: 'pending' as const,
      priority: requestPriority,
      description: requestDescription
    };

    if (editingRequest) {
      // Update existing request
      const updatedRequest = { ...editingRequest, ...requestData };
      const allRequests = dataManager.getAllRequests();
      const requestIndex = allRequests.findIndex(r => r.id === editingRequest.id);
      if (requestIndex !== -1) {
        allRequests[requestIndex] = updatedRequest;
        localStorage.setItem('optigov_requests', JSON.stringify(allRequests));
        setRequests(prev => prev.map(r => r.id === editingRequest.id ? updatedRequest : r));
        showToast('Request updated successfully', 'success');
      }
      setEditingRequest(null);
    } else {
      // Create new request
      const newRequest = dataManager.createRequest(requestData);
      setRequests(prev => [...prev, newRequest]);
      showToast('Request submitted successfully', 'success');
    }

    setSelectedCompany('');
    setRequestDescription('');
    setRequestPriority('normal');
    setShowRequestForm(false);
  };

  const handleEditRequest = (request: DataRequest) => {
    if (request.status !== 'pending') {
      showToast('Only pending requests can be edited', 'warning');
      return;
    }

    setEditingRequest(request);
    setSelectedCompany(request.companyId);
    setRequestType(request.type);
    setRequestDescription(request.description || '');
    setRequestPriority(request.priority);
    setShowRequestForm(true);
  };

  const handleCancelRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request || request.status !== 'pending') {
      showToast('Only pending requests can be cancelled', 'warning');
      return;
    }

    if (window.confirm('Are you sure you want to cancel this request?')) {
      dataManager.deleteRequest(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      showToast('Request cancelled successfully', 'success');
    }
  };

  const resolveAlert = (alertId: string) => {
    dataManager.resolveAlert(alertId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    showToast('Alert resolved', 'success');
  };

  const downloadRequestPDF = (request: DataRequest) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Data Request Receipt', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Request ID: ${request.id}`, 20, 50);
    doc.text(`Company: ${request.companyName}`, 20, 65);
    doc.text(`Type: ${request.type.toUpperCase()}`, 20, 80);
    doc.text(`Priority: ${request.priority.toUpperCase()}`, 20, 95);
    doc.text(`Status: ${request.status.toUpperCase()}`, 20, 110);
    doc.text(`Date: ${new Date(request.date).toLocaleDateString()}`, 20, 125);
    doc.text(`Description: ${request.description || 'N/A'}`, 20, 140);
    doc.text(`Requested by: ${request.citizenName}`, 20, 155);
    
    if (request.responseMessage) {
      doc.text(`Response: ${request.responseMessage}`, 20, 175);
      doc.text(`Response Date: ${new Date(request.responseDate!).toLocaleDateString()}`, 20, 190);
    }
    
    doc.save(`data-request-${request.id}.pdf`);
  };

  const downloadWeeklySummary = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('OptiGov - Weekly Summary Report', 20, 30);
    
    doc.setFontSize(14);
    doc.text(`User: ${user?.firstName} ${user?.lastName}` || user?.username || '', 20, 50);
    doc.text(`Email: ${user?.email}`, 20, 65);
    doc.text(`Phone: ${user?.phone}`, 20, 80);
    
    doc.setFontSize(12);
    doc.text('Recent Data Requests:', 20, 100);
    requests.slice(0, 10).forEach((request, index) => {
      const y = 115 + (index * 15);
      doc.text(`${index + 1}. ${request.companyName} - ${request.type} (${request.status})`, 25, y);
    });
    
    const alertsStartY = 115 + (Math.min(requests.length, 10) * 15) + 20;
    doc.text('Recent Alerts:', 20, alertsStartY);
    alerts.slice(0, 5).forEach((alert, index) => {
      const y = alertsStartY + 15 + (index * 15);
      doc.text(`${index + 1}. ${alert.message} (${alert.resolved ? 'Resolved' : 'Active'})`, 25, y);
    });
    
    doc.save(`optigov-weekly-summary-${user?.email}.pdf`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-600 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-600 text-white">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-600 text-white">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    return priority === 'high' ? (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
        High Priority
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        Normal
      </span>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName} {user?.lastName || user?.username}!</h1>
        <p className="text-green-100">
          Manage your data protection rights and stay informed about your privacy
        </p>
      </div>

      {/* Quick Stats */}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => !a.resolved).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rights Available</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ndprRights.length}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Requests</h3>
            <button
              onClick={() => setShowRequestForm(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </button>
          </div>
        </div>
        <div className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No requests yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start exercising your data rights by submitting your first request.
              </p>
              <button
                onClick={() => setShowRequestForm(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit First Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">{request.companyName}</p>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(request.priority)}
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{request.type} request</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(request.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleEditRequest(request)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit Request"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCancelRequest(request.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Cancel Request"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => downloadRequestPDF(request)}
                      className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingRequest ? 'Edit Request' : 'Submit Data Request'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Company
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.organizationName || company.username}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Request Type
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as 'access' | 'delete')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="access">Access My Data</option>
                  <option value="delete">Delete My Data</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={requestPriority}
                  onChange={(e) => setRequestPriority(e.target.value as 'high' | 'normal')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe your request..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitRequest}
                  disabled={!selectedCompany || !requestDescription}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingRequest ? 'Update Request' : 'Submit Request'}
                </button>
                <button
                  onClick={() => {
                    setShowRequestForm(false);
                    setEditingRequest(null);
                    setSelectedCompany('');
                    setRequestDescription('');
                    setRequestPriority('normal');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRights = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your NDPR Rights</h2>
        <button
          onClick={downloadWeeklySummary}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Summary
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ndprRights.map((right) => (
          <div key={right.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <right.icon className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{right.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{right.description}</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{right.details}</p>
            
            <button
              onClick={() => setShowRightModal(right)}
              className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Learn More
            </button>
          </div>
        ))}
      </div>

      {/* Right Modal */}
      {showRightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {showRightModal.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {showRightModal.details}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRightModal(null);
                  setActiveView('submit');
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Exercise This Right
              </button>
              <button
                onClick={() => setShowRightModal(null)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSubmitRequest = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Data Request</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Choose a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.organizationName || company.username}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Request Type
            </label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as 'access' | 'delete')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="access">Access My Data</option>
              <option value="delete">Delete My Data</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={requestPriority}
              onChange={(e) => setRequestPriority(e.target.value as 'high' | 'normal')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={requestDescription}
              onChange={(e) => setRequestDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Describe your request..."
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSubmitRequest}
              disabled={!selectedCompany || !requestDescription}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
            <button
              onClick={() => {
                setSelectedCompany('');
                setRequestDescription('');
                setRequestPriority('normal');
              }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Data Requests</h2>
        <button
          onClick={() => setShowRequestForm(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No requests yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start exercising your data rights by submitting your first request.
              </p>
              <button
                onClick={() => setShowRequestForm(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit First Request
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{request.companyName}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">{request.type}</td>
                      <td className="py-3 px-4">{getPriorityBadge(request.priority)}</td>
                      <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{new Date(request.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleEditRequest(request)}
                                className="inline-flex items-center px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleCancelRequest(request.id)}
                                className="inline-flex items-center px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                title="Cancel"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => downloadRequestPDF(request)}
                            className="inline-flex items-center px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="h-3 w-3" />
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

  const renderAlerts = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts & Notifications</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No alerts</h3>
              <p className="text-gray-500 dark:text-gray-400">
                You'll be notified here about data breaches, policy updates, and request responses.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.resolved 
                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
                    : alert.type === 'breach' 
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : alert.type === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{alert.message}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(alert.date).toLocaleDateString()}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'rights':
        return renderRights();
      case 'submit':
        return renderSubmitRequest();
      case 'requests':
        return renderRequests();
      case 'alerts':
        return renderAlerts();
      default:
        return renderDashboard();
    }
  };

  return (
    <Layout 
      title="Citizen Dashboard" 
      activeView={activeView} 
      onViewChange={setActiveView}
    >
      {renderContent()}
    </Layout>
  );
};

export default CitizenDashboard;