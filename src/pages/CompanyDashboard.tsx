import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import DataManager, { DataRequest, ComplianceItem, Upload, Notification, COMPLIANCE_CHECKLIST } from '../utils/dataManager';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  Upload as UploadIcon, 
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
  X,
  Bell,
  Star,
  Activity,
  BarChart3,
  Settings,
  Download
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState('dashboard');
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [complianceChecklist, setComplianceChecklist] = useState<ComplianceItem | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [responseStatus, setResponseStatus] = useState<'approved' | 'rejected'>('approved');
  const [responseMessage, setResponseMessage] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [selectedRequestForChat, setSelectedRequestForChat] = useState<DataRequest | null>(null);
  
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

    const companyRequests = dataManager.getRequestsByCompany(user.id);
    const companyCompliance = dataManager.getComplianceChecklist(user.id);
    const companyUploads = dataManager.getUploadsByUser(user.id);
    const companyNotifications = dataManager.getNotificationsByUser(user.id, 'company');
    
    setRequests(companyRequests);
    setComplianceChecklist(companyCompliance);
    setUploads(companyUploads);
    setNotifications(companyNotifications);
  };

  const handleRespondToRequest = (requestId: string, status: 'approved' | 'rejected') => {
    dataManager.updateRequestStatus(requestId, status, responseMessage);
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status, responseMessage, responseDate: new Date().toISOString() } : req
    ));
    setSelectedRequest(null);
    setResponseMessage('');
    showToast(`Request ${status} successfully`, 'success');
  };

  const handleComplianceToggle = (ruleIndex: number) => {
    if (!user || !complianceChecklist) return;
    
    const newValue = !complianceChecklist.checklist[ruleIndex];
    dataManager.updateComplianceItem(user.id, ruleIndex, newValue);
    
    setComplianceChecklist(prev => prev ? {
      ...prev,
      checklist: prev.checklist.map((rule, index) => index === ruleIndex ? newValue : rule)
    } : null);
    
    showToast(`Compliance item ${newValue ? 'completed' : 'unchecked'}`, 'success');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      dataManager.createUpload(user.id, file.name, 'privacy_policy');
      setUploads(prev => [...prev, {
        id: Date.now().toString(),
        userId: user.id,
        fileName: file.name,
        type: 'privacy_policy',
        uploadDate: new Date().toISOString()
      }]);
      showToast('Privacy policy uploaded successfully', 'success');
    }
  };

  const handleSendChatMessage = () => {
    if (!selectedRequestForChat || !chatMessage.trim() || !user) return;
    
    dataManager.createChatMessage(
      selectedRequestForChat.id,
      user.organizationName || user.username,
      'company',
      chatMessage
    );
    
    setChatMessage('');
    setShowChatModal(false);
    setSelectedRequestForChat(null);
    showToast('Message sent successfully', 'success');
  };

  const getComplianceScore = () => {
    if (!complianceChecklist) return 0;
    const completedRules = complianceChecklist.checklist.filter(rule => rule).length;
    return Math.round((completedRules / complianceChecklist.checklist.length) * 100);
  };

  const getRequestHandlingScore = () => {
    if (requests.length === 0) return 0;
    const approvedRequests = requests.filter(req => req.status === 'approved').length;
    return Math.round((approvedRequests / requests.length) * 100);
  };

  const getPendingRequestsOver48Hours = () => {
    const now = new Date();
    return requests.filter(req => {
      if (req.status !== 'pending') return false;
      const requestDate = new Date(req.date);
      const hoursDiff = (now.getTime() - requestDate.getTime()) / (1000 * 60 * 60);
      return hoursDiff > 48;
    });
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 80) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 60) return { status: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  // Chart Data
  const complianceScore = getComplianceScore();
  const requestScore = getRequestHandlingScore();
  const complianceStatus = getComplianceStatus(complianceScore);

  const complianceData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [complianceScore, 100 - complianceScore],
        backgroundColor: ['#22c55e', '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };

  const requestData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          requests.filter(r => r.status === 'approved').length,
          requests.filter(r => r.status === 'pending').length,
          requests.filter(r => r.status === 'rejected').length
        ],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
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

  const renderDashboard = () => {
    const overdue = getPendingRequestsOver48Hours();
    
    return (
      <div className="space-y-6">
        {/* Company Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.organizationName || user?.username}</h1>
                <p className="text-blue-100">{user?.organizationType || 'Technology'} • {user?.address || 'Lagos, Nigeria'}</p>
                <p className="text-sm text-blue-200">{user?.email}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${complianceStatus.bgColor} ${complianceStatus.color}`}>
                {complianceStatus.status}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Incoming Data Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Total received</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Notifications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Awaiting response</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Checklist</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{complianceScore}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">NDPR Compliance</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Summary</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{requestScore}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Response rate</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Company Profile */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Profile</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Organization</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.organizationName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.organizationType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Registration</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contact Person</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.contactPerson}</p>
                </div>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy Policy</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  <UploadIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload privacy policy</p>
                  <label className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors cursor-pointer">
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                
                {uploads.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Files:</p>
                    {uploads.map((upload) => (
                      <div key={upload.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{upload.fileName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(upload.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            {/* Incoming Data Requests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Incoming Data Requests</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{requests.length} total</span>
              </div>
              
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No requests received yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {requests.slice(0, 5).map((request) => (
                    <div key={request.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">{request.citizenName}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{request.type} request</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(request.date).toLocaleDateString()}</p>
                      {request.status === 'pending' && (
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Respond
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequestForChat(request);
                              setShowChatModal(true);
                            }}
                            className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                          >
                            Chat
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Notifications</h3>
              
              {overdue.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {overdue.length} request(s) overdue (>48 hours)
                    </p>
                  </div>
                </div>
              )}
              
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{notification.message}</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Compliance Checklist */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compliance Checklist</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{complianceScore}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">NDPR Compliance</div>
                </div>
              </div>
              
              <div className="relative h-32 mb-4">
                <Doughnut data={complianceData} options={chartOptions} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{complianceScore}%</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {COMPLIANCE_CHECKLIST.slice(0, 5).map((rule, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <button
                      onClick={() => handleComplianceToggle(index)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        complianceChecklist?.checklist[index]
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {complianceChecklist?.checklist[index] && (
                        <Check className="h-2 w-2 text-white" />
                      )}
                    </button>
                    <p className={`text-xs ${
                      complianceChecklist?.checklist[index]
                        ? 'text-gray-500 dark:text-gray-400 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Summary</h3>
              
              <div className="relative h-32 mb-4">
                <Doughnut data={requestData} options={chartOptions} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{requestScore}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Response Rate</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Approved</span>
                  <span className="font-medium text-green-600">{requests.filter(r => r.status === 'approved').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Pending</span>
                  <span className="font-medium text-orange-600">{requests.filter(r => r.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Rejected</span>
                  <span className="font-medium text-red-600">{requests.filter(r => r.status === 'rejected').length}</span>
                </div>
              </div>
            </div>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Date: {new Date(selectedRequest.date).toLocaleDateString()}</p>
                {selectedRequest.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Description: {selectedRequest.description}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response
                </label>
                <select
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value as 'approved' | 'rejected')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="approved">Approve Request</option>
                  <option value="rejected">Reject Request</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response Message (Optional)
                </label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add a message for the citizen..."
                />
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

        {/* Chat Modal */}
        {showChatModal && selectedRequestForChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Chat with {selectedRequestForChat.citizenName}
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Request: {selectedRequestForChat.type}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Type your message..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatMessage.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Message
                </button>
                <button
                  onClick={() => {
                    setShowChatModal(false);
                    setSelectedRequestForChat(null);
                    setChatMessage('');
                  }}
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
  };

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
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Priority</th>
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
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {request.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          request.status === 'approved' ? 'bg-green-600 text-white' :
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
                        <div className="flex space-x-2">
                          {request.status === 'pending' && (
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="inline-flex items-center px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Respond
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedRequestForChat(request);
                              setShowChatModal(true);
                            }}
                            className="inline-flex items-center px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Chat
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
              <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload your company's privacy policy document
              </p>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <UploadIcon className="h-4 w-4 mr-2" />
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

          {uploads.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Uploaded Policies</h3>
              <div className="space-y-3">
                {uploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{upload.fileName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Uploaded: {new Date(upload.uploadDate).toLocaleDateString()}
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
          {COMPLIANCE_CHECKLIST.map((rule, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleComplianceToggle(index)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    complianceChecklist?.checklist[index]
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {complianceChecklist?.checklist[index] && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
                <p className={`text-sm ${
                  complianceChecklist?.checklist[index]
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