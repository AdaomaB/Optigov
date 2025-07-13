// Enhanced Data Manager for OptiGov Platform
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  role: 'citizen' | 'company' | 'admin';
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
  
  // Citizen specific fields
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  
  // Company specific fields
  organizationName?: string;
  organizationType?: string;
  registrationNumber?: string;
  contactPerson?: string;
  address?: string;
  website?: string;
  
  // Admin specific fields
  department?: string;
  employmentId?: string;
  permissionLevel?: number;
}

export interface DataRequest {
  id: string;
  citizenId: string;
  companyId: string;
  citizenName: string;
  companyName: string;
  type: 'access' | 'delete';
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'normal';
  date: string;
  description?: string;
  responseMessage?: string;
  responseDate?: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  role: 'citizen' | 'company' | 'admin';
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface Alert {
  id: string;
  citizenId: string;
  message: string;
  type: 'breach' | 'warning' | 'info';
  date: string;
  resolved: boolean;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  region: string;
  category: string;
  totalRequests: number;
  completedRequests: number;
  warnings: string[];
  createdAt: string;
}

export interface ComplianceItem {
  companyId: string;
  checklist: boolean[];
  lastUpdated: string;
}

export interface Upload {
  id: string;
  userId: string;
  fileName: string;
  type: 'privacy_policy' | 'id_card' | 'document';
  uploadDate: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'request' | 'response' | 'upload' | 'login' | 'notification';
}

export interface ChatMessage {
  requestId: string;
  messages: Array<{
    id: string;
    sender: string;
    senderRole: 'citizen' | 'company';
    message: string;
    timestamp: string;
  }>;
}

// Default compliance checklist items
export const DEFAULT_COMPLIANCE_RULES = [
  'Data Protection Officer Appointed',
  'Privacy Policy Published and Updated',
  'Data Breach Response Plan Implemented',
  'Staff Training on NDPR Completed',
  'Data Retention Policy Established',
  'Consent Management System Active',
  'Data Subject Rights Process Defined',
  'Regular Security Audits Conducted',
  'Third-party Vendor Assessment Done',
  'Incident Response Procedures Ready'
];

class DataManager {
  private static instance: DataManager;

  private constructor() {
    this.initializeDefaultData();
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStorageItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
    this.triggerStorageEvent();
  }

  private triggerStorageEvent(): void {
    window.dispatchEvent(new Event('optigov-data-updated'));
  }

  private initializeDefaultData(): void {
    // Initialize with some default companies if none exist
    const users = this.getStorageItem<User[]>('optigov_users', []);
    const companies = users.filter(u => u.role === 'company');
    
    if (companies.length === 0) {
      const defaultCompanies = [
        { name: 'GTBank Nigeria', type: 'Banking', email: 'contact@gtbank.com' },
        { name: 'Jumia Nigeria', type: 'E-commerce', email: 'contact@jumia.com.ng' },
        { name: 'MTN Nigeria', type: 'Telecommunications', email: 'contact@mtn.ng' },
        { name: 'Flutterwave', type: 'Fintech', email: 'contact@flutterwave.com' },
        { name: 'Paystack', type: 'Fintech', email: 'contact@paystack.com' }
      ];

      defaultCompanies.forEach((company, index) => {
        const companyUser: User = {
          id: this.generateId(),
          username: company.name.toLowerCase().replace(/\s+/g, ''),
          email: company.email,
          password: 'password123',
          phone: `+234${8000000000 + index}`,
          role: 'company',
          organizationName: company.name,
          organizationType: company.type,
          registrationNumber: `RC${1000 + index}`,
          contactPerson: 'Johnson Blessing',
          address: 'Lagos, Nigeria',
          website: `https://${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          isActive: true
        };
        
        users.push(companyUser);
        
        // Initialize compliance checklist
        this.createComplianceChecklist(companyUser.id);
      });
      
      this.setStorageItem('optigov_users', users);
    }
  }

  // User Management
  createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastActivity' | 'isActive'>): User {
    const users = this.getStorageItem<User[]>('optigov_users', []);
    
    // Check for existing user
    const existingUser = users.find(u => u.email === userData.email || u.username === userData.username);
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }
    
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      isActive: true
    };
    
    users.push(newUser);
    this.setStorageItem('optigov_users', users);
    
    // Initialize compliance checklist for companies
    if (newUser.role === 'company') {
      this.createComplianceChecklist(newUser.id);
    }
    
    this.logActivity(newUser.id, 'User Registration', `${newUser.role} account created`, 'login');
    
    return newUser;
  }

  getUser(email: string, password: string): User | null {
    const users = this.getStorageItem<User[]>('optigov_users', []);
    const user = users.find(u => u.email === email && u.password === password && u.isActive);
    
    if (user) {
      this.updateUserActivity(user.id);
    }
    
    return user || null;
  }

  getUserById(id: string): User | null {
    const users = this.getStorageItem<User[]>('optigov_users', []);
    return users.find(u => u.id === id && u.isActive) || null;
  }

  getAllUsers(): User[] {
    return this.getStorageItem<User[]>('optigov_users', []);
  }

  getCompanies(): Company[] {
    const users = this.getAllUsers();
    return users
      .filter(u => u.role === 'company')
      .map(u => {
        const requests = this.getRequestsByCompany(u.id);
        return {
          id: u.id,
          name: u.organizationName || u.username,
          email: u.email,
          region: 'Lagos', // Default region
          category: u.organizationType || 'Technology',
          totalRequests: requests.length,
          completedRequests: requests.filter(r => r.status === 'approved').length,
          warnings: [],
          createdAt: u.createdAt
        };
      });
  }

  updateUser(userId: string, updates: Partial<User>): void {
    const users = this.getStorageItem<User[]>('optigov_users', []);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      this.setStorageItem('optigov_users', users);
    }
  }

  updateUserActivity(userId: string): void {
    this.updateUser(userId, { lastActivity: new Date().toISOString() });
  }

  // Request Management
  createRequest(requestData: Omit<DataRequest, 'id' | 'date'>): DataRequest {
    const requests = this.getStorageItem<DataRequest[]>('optigov_requests', []);
    
    const newRequest: DataRequest = {
      ...requestData,
      id: this.generateId(),
      date: new Date().toISOString()
    };
    
    requests.push(newRequest);
    this.setStorageItem('optigov_requests', requests);
    
    // Create notifications
    this.createNotification({
      recipientId: requestData.companyId,
      role: 'company',
      message: `New ${requestData.type} request from ${requestData.citizenName}`,
      type: 'info'
    });
    
    this.createNotification({
      recipientId: requestData.citizenId,
      role: 'citizen',
      message: `Your ${requestData.type} request has been submitted to ${requestData.companyName}`,
      type: 'success'
    });
    
    this.logActivity(requestData.citizenId, 'Request Submitted', `${requestData.type} request to ${requestData.companyName}`, 'request');
    
    return newRequest;
  }

  getRequestsByUser(userId: string): DataRequest[] {
    const requests = this.getStorageItem<DataRequest[]>('optigov_requests', []);
    return requests.filter(r => r.citizenId === userId);
  }

  getRequestsByCompany(companyId: string): DataRequest[] {
    const requests = this.getStorageItem<DataRequest[]>('optigov_requests', []);
    return requests.filter(r => r.companyId === companyId);
  }

  getAllRequests(): DataRequest[] {
    return this.getStorageItem<DataRequest[]>('optigov_requests', []);
  }

  updateRequestStatus(requestId: string, status: 'approved' | 'rejected', responseMessage?: string): void {
    const requests = this.getStorageItem<DataRequest[]>('optigov_requests', []);
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex !== -1) {
      const request = requests[requestIndex];
      requests[requestIndex] = {
        ...request,
        status,
        responseMessage,
        responseDate: new Date().toISOString()
      };
      
      this.setStorageItem('optigov_requests', requests);
      
      // Notify citizen
      this.createNotification({
        recipientId: request.citizenId,
        role: 'citizen',
        message: `Your ${request.type} request to ${request.companyName} has been ${status}`,
        type: status === 'approved' ? 'success' : 'warning'
      });
      
      this.logActivity(request.companyId, 'Request Response', `${status} ${request.type} request from ${request.citizenName}`, 'response');
    }
  }

  deleteRequest(requestId: string): void {
    const requests = this.getStorageItem<DataRequest[]>('optigov_requests', []);
    const filteredRequests = requests.filter(r => r.id !== requestId);
    this.setStorageItem('optigov_requests', filteredRequests);
  }

  // Notification Management
  createNotification(notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const notifications = this.getStorageItem<Notification[]>('optigov_notifications', []);
    
    const newNotification: Notification = {
      ...notificationData,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    notifications.push(newNotification);
    this.setStorageItem('optigov_notifications', notifications);
    
    return newNotification;
  }

  getNotificationsByUser(userId: string, role: string): Notification[] {
    const notifications = this.getStorageItem<Notification[]>('optigov_notifications', []);
    return notifications.filter(n => n.recipientId === userId && n.role === role);
  }

  markNotificationAsRead(notificationId: string): void {
    const notifications = this.getStorageItem<Notification[]>('optigov_notifications', []);
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex !== -1) {
      notifications[notificationIndex].read = true;
      this.setStorageItem('optigov_notifications', notifications);
    }
  }

  // Alert Management
  createAlert(alertData: Omit<Alert, 'id' | 'date'>): Alert {
    const alerts = this.getStorageItem<Alert[]>('optigov_alerts', []);
    
    const newAlert: Alert = {
      ...alertData,
      id: this.generateId(),
      date: new Date().toISOString()
    };
    
    alerts.push(newAlert);
    this.setStorageItem('optigov_alerts', alerts);
    
    return newAlert;
  }

  getAlertsByUser(userId: string): Alert[] {
    const alerts = this.getStorageItem<Alert[]>('optigov_alerts', []);
    return alerts.filter(a => a.citizenId === userId);
  }

  resolveAlert(alertId: string): void {
    const alerts = this.getStorageItem<Alert[]>('optigov_alerts', []);
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex !== -1) {
      alerts[alertIndex].resolved = true;
      this.setStorageItem('optigov_alerts', alerts);
    }
  }

  // Compliance Management
  createComplianceChecklist(companyId: string): void {
    const compliance = this.getStorageItem<ComplianceItem[]>('optigov_compliance', []);
    
    if (!compliance.find(c => c.companyId === companyId)) {
      compliance.push({
        companyId,
        checklist: new Array(DEFAULT_COMPLIANCE_RULES.length).fill(false),
        lastUpdated: new Date().toISOString()
      });
      
      this.setStorageItem('optigov_compliance', compliance);
    }
  }

  getComplianceChecklist(companyId: string): ComplianceItem | null {
    const compliance = this.getStorageItem<ComplianceItem[]>('optigov_compliance', []);
    return compliance.find(c => c.companyId === companyId) || null;
  }

  updateComplianceItem(companyId: string, itemIndex: number, value: boolean): void {
    const compliance = this.getStorageItem<ComplianceItem[]>('optigov_compliance', []);
    const complianceIndex = compliance.findIndex(c => c.companyId === companyId);
    
    if (complianceIndex !== -1) {
      compliance[complianceIndex].checklist[itemIndex] = value;
      compliance[complianceIndex].lastUpdated = new Date().toISOString();
      this.setStorageItem('optigov_compliance', compliance);
    }
  }

  getComplianceScore(companyId: string): number {
    const compliance = this.getComplianceChecklist(companyId);
    if (!compliance) return 0;
    
    const completedItems = compliance.checklist.filter(item => item).length;
    return Math.round((completedItems / compliance.checklist.length) * 100);
  }

  // Upload Management
  createUpload(userId: string, fileName: string, type: 'privacy_policy' | 'id_card' | 'document'): void {
    const uploads = this.getStorageItem<Upload[]>('optigov_uploads', []);
    
    uploads.push({
      id: this.generateId(),
      userId,
      fileName,
      type,
      uploadDate: new Date().toISOString()
    });
    
    this.setStorageItem('optigov_uploads', uploads);
    this.logActivity(userId, 'File Upload', `Uploaded ${type}: ${fileName}`, 'upload');
  }

  getUploadsByUser(userId: string): Upload[] {
    const uploads = this.getStorageItem<Upload[]>('optigov_uploads', []);
    return uploads.filter(u => u.userId === userId);
  }

  // Activity Logging
  logActivity(userId: string, action: string, details: string, type: 'request' | 'response' | 'upload' | 'login' | 'notification'): void {
    const activities = this.getStorageItem<ActivityLog[]>('optigov_activities', []);
    
    activities.push({
      id: this.generateId(),
      userId,
      action,
      details,
      type,
      timestamp: new Date().toISOString()
    });
    
    this.setStorageItem('optigov_activities', activities);
  }

  getActivitiesByUser(userId: string): ActivityLog[] {
    const activities = this.getStorageItem<ActivityLog[]>('optigov_activities', []);
    return activities.filter(a => a.userId === userId);
  }

  getAllActivities(): ActivityLog[] {
    return this.getStorageItem<ActivityLog[]>('optigov_activities', []);
  }

  // Analytics
  getAnalytics() {
    const users = this.getAllUsers();
    const requests = this.getAllRequests();
    
    const totalCitizens = users.filter(u => u.role === 'citizen').length;
    const totalCompanies = users.filter(u => u.role === 'company').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'approved').length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const rejectedRequests = requests.filter(r => r.status === 'rejected').length;
    
    // Requests by region (based on company locations)
    const requestsByRegion: { [key: string]: number } = {};
    requests.forEach(request => {
      const company = users.find(u => u.id === request.companyId);
      if (company) {
        const region = 'Lagos'; // Default region for now
        requestsByRegion[region] = (requestsByRegion[region] || 0) + 1;
      }
    });
    
    // Requests over time (last 12 months)
    const requestsOverTime: { [key: string]: number } = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      requestsOverTime[monthKey] = 0;
    }
    
    requests.forEach(request => {
      const monthKey = request.date.slice(0, 7);
      if (requestsOverTime.hasOwnProperty(monthKey)) {
        requestsOverTime[monthKey]++;
      }
    });
    
    return {
      totalCitizens,
      totalCompanies,
      totalAdmins,
      totalRequests,
      completedRequests,
      pendingRequests,
      rejectedRequests,
      requestsByRegion,
      requestsOverTime,
      completionRate: totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0
    };
  }

  // Clear all data (for testing)
  clearAllData(): void {
    const keys = [
      'optigov_users',
      'optigov_requests',
      'optigov_notifications',
      'optigov_alerts',
      'optigov_compliance',
      'optigov_uploads',
      'optigov_activities'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    this.initializeDefaultData();
  }
}

export default DataManager;