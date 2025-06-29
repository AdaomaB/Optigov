// Central data management for localStorage operations
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'citizen' | 'company' | 'admin';
  createdAt: string;
}

export interface DataRequest {
  id: string;
  citizenId: string;
  companyId: string;
  citizenName: string;
  companyName: string;
  type: 'access' | 'delete';
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  description?: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  region: string;
  category: string;
  totalRequests: number;
  completedRequests: number;
  warnings: Notification[];
  createdAt: string;
}

export interface Alert {
  id: string;
  citizenId: string;
  message: string;
  type: 'breach' | 'warning' | 'info';
  date: string;
  resolved: boolean;
}

export interface Policy {
  id: string;
  companyId: string;
  fileName: string;
  uploadDate: string;
}

export interface ComplianceChecklist {
  id: string;
  companyId: string;
  rules: boolean[];
  lastUpdated: string;
}

export interface Notification {
  id: string;
  companyId: string;
  message: string;
  sentDate: string;
  type: 'warning' | 'info' | 'compliance';
}

export interface AppData {
  users: User[];
  requests: DataRequest[];
  companies: Company[];
  alerts: Alert[];
  policies: Policy[];
  complianceChecklists: ComplianceChecklist[];
  notifications: Notification[];
}

// Default compliance rules
export const DEFAULT_COMPLIANCE_RULES = [
  'Data Protection Officer Appointed',
  'Privacy Policy Published',
  'Data Breach Response Plan',
  'Staff Training Completed',
  'Data Retention Policy',
  'Consent Management System',
  'Data Subject Rights Process',
  'Regular Security Audits',
  'Third-party Vendor Assessment',
  'Incident Response Procedures'
];

// Predefined companies
export const PREDEFINED_COMPANIES = [
  { name: 'GTBank Nigeria', region: 'Lagos', category: 'Banking' },
  { name: 'Jumia Nigeria', region: 'Lagos', category: 'E-commerce' },
  { name: 'MTN Nigeria', region: 'Lagos', category: 'Telecommunications' },
  { name: 'Flutterwave', region: 'Lagos', category: 'Fintech' },
  { name: 'Paystack', region: 'Lagos', category: 'Fintech' },
  { name: 'Konga', region: 'Lagos', category: 'E-commerce' },
  { name: 'Airtel Nigeria', region: 'Lagos', category: 'Telecommunications' },
  { name: 'First Bank Nigeria', region: 'Lagos', category: 'Banking' },
  { name: 'Zenith Bank', region: 'Lagos', category: 'Banking' },
  { name: 'Access Bank', region: 'Lagos', category: 'Banking' }
];

class DataManager {
  private static instance: DataManager;
  private data: AppData;

  private constructor() {
    this.data = this.loadData();
    this.initializePredefinedCompanies();
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  private loadData(): AppData {
    const stored = localStorage.getItem('optigov_data');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      users: [],
      requests: [],
      companies: [],
      alerts: [],
      policies: [],
      complianceChecklists: [],
      notifications: []
    };
  }

  private saveData(): void {
    localStorage.setItem('optigov_data', JSON.stringify(this.data));
    // Trigger storage event for real-time updates
    window.dispatchEvent(new Event('optigov-data-updated'));
  }

  private initializePredefinedCompanies(): void {
    if (this.data.companies.length === 0) {
      PREDEFINED_COMPANIES.forEach(company => {
        const companyId = this.generateId();
        this.data.companies.push({
          id: companyId,
          name: company.name,
          email: `contact@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
          region: company.region,
          category: company.category,
          totalRequests: 0,
          completedRequests: 0,
          warnings: [],
          createdAt: new Date().toISOString()
        });

        // Initialize compliance checklist
        this.data.complianceChecklists.push({
          id: this.generateId(),
          companyId,
          rules: new Array(DEFAULT_COMPLIANCE_RULES.length).fill(false),
          lastUpdated: new Date().toISOString()
        });
      });
      this.saveData();
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // User operations
  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  getUser(email: string, password: string): User | null {
    return this.data.users.find(u => u.email === email && u.password === password) || null;
  }

  getUserById(id: string): User | null {
    return this.data.users.find(u => u.id === id) || null;
  }

  // Request operations
  createRequest(requestData: Omit<DataRequest, 'id' | 'date'>): DataRequest {
    const request: DataRequest = {
      ...requestData,
      id: this.generateId(),
      date: new Date().toISOString()
    };
    this.data.requests.push(request);
    
    // Update company request count
    const company = this.data.companies.find(c => c.id === request.companyId);
    if (company) {
      company.totalRequests++;
    }
    
    this.saveData();
    return request;
  }

  getRequestsByUser(userId: string): DataRequest[] {
    return this.data.requests.filter(r => r.citizenId === userId);
  }

  getRequestsByCompany(companyId: string): DataRequest[] {
    return this.data.requests.filter(r => r.companyId === companyId);
  }

  updateRequestStatus(requestId: string, status: 'completed' | 'rejected'): void {
    const request = this.data.requests.find(r => r.id === requestId);
    if (request) {
      const oldStatus = request.status;
      request.status = status;
      
      // Update company completed count
      if (status === 'completed' && oldStatus !== 'completed') {
        const company = this.data.companies.find(c => c.id === request.companyId);
        if (company) {
          company.completedRequests++;
        }
      } else if (oldStatus === 'completed' && status !== 'completed') {
        const company = this.data.companies.find(c => c.id === request.companyId);
        if (company) {
          company.completedRequests--;
        }
      }
      
      this.saveData();
    }
  }

  // Company operations
  createCompany(companyData: Omit<Company, 'id' | 'totalRequests' | 'completedRequests' | 'warnings' | 'createdAt'>): Company {
    const company: Company = {
      ...companyData,
      id: this.generateId(),
      totalRequests: 0,
      completedRequests: 0,
      warnings: [],
      createdAt: new Date().toISOString()
    };
    this.data.companies.push(company);
    
    // Initialize compliance checklist
    this.data.complianceChecklists.push({
      id: this.generateId(),
      companyId: company.id,
      rules: new Array(DEFAULT_COMPLIANCE_RULES.length).fill(false),
      lastUpdated: new Date().toISOString()
    });
    
    this.saveData();
    return company;
  }

  getCompanies(): Company[] {
    return this.data.companies;
  }

  getCompanyById(id: string): Company | null {
    return this.data.companies.find(c => c.id === id) || null;
  }

  getCompanyByUserId(userId: string): Company | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    return this.data.companies.find(c => c.email === user.email) || null;
  }

  // Alert operations
  createAlert(alertData: Omit<Alert, 'id' | 'date'>): Alert {
    const alert: Alert = {
      ...alertData,
      id: this.generateId(),
      date: new Date().toISOString()
    };
    this.data.alerts.push(alert);
    this.saveData();
    return alert;
  }

  getAlertsByUser(userId: string): Alert[] {
    return this.data.alerts.filter(a => a.citizenId === userId);
  }

  resolveAlert(alertId: string): void {
    const alert = this.data.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.saveData();
    }
  }

  // Policy operations
  createPolicy(policyData: Omit<Policy, 'id' | 'uploadDate'>): Policy {
    const policy: Policy = {
      ...policyData,
      id: this.generateId(),
      uploadDate: new Date().toISOString()
    };
    this.data.policies.push(policy);
    this.saveData();
    return policy;
  }

  getPoliciesByCompany(companyId: string): Policy[] {
    return this.data.policies.filter(p => p.companyId === companyId);
  }

  // Compliance operations
  getComplianceChecklist(companyId: string): ComplianceChecklist | null {
    return this.data.complianceChecklists.find(c => c.companyId === companyId) || null;
  }

  updateComplianceRule(companyId: string, ruleIndex: number, value: boolean): void {
    const checklist = this.data.complianceChecklists.find(c => c.companyId === companyId);
    if (checklist) {
      checklist.rules[ruleIndex] = value;
      checklist.lastUpdated = new Date().toISOString();
      this.saveData();
    }
  }

  // Notification operations
  createNotification(notificationData: Omit<Notification, 'id' | 'sentDate'>): Notification {
    const notification: Notification = {
      ...notificationData,
      id: this.generateId(),
      sentDate: new Date().toISOString()
    };
    this.data.notifications.push(notification);
    
    // Add to company warnings
    const company = this.data.companies.find(c => c.id === notification.companyId);
    if (company) {
      company.warnings.push(notification);
    }
    
    this.saveData();
    return notification;
  }

  getNotificationsByCompany(companyId: string): Notification[] {
    return this.data.notifications.filter(n => n.companyId === companyId);
  }

  // Analytics
  getAnalytics() {
    const totalCitizens = this.data.users.filter(u => u.role === 'citizen').length;
    const totalCompanies = this.data.companies.length;
    const totalRequests = this.data.requests.length;
    const completedRequests = this.data.requests.filter(r => r.status === 'completed').length;
    const pendingRequests = this.data.requests.filter(r => r.status === 'pending').length;
    const rejectedRequests = this.data.requests.filter(r => r.status === 'rejected').length;

    // Requests by region
    const requestsByRegion: { [key: string]: number } = {};
    this.data.requests.forEach(request => {
      const company = this.data.companies.find(c => c.id === request.companyId);
      if (company) {
        requestsByRegion[company.region] = (requestsByRegion[company.region] || 0) + 1;
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
    
    this.data.requests.forEach(request => {
      const monthKey = request.date.slice(0, 7);
      if (requestsOverTime.hasOwnProperty(monthKey)) {
        requestsOverTime[monthKey]++;
      }
    });

    return {
      totalCitizens,
      totalCompanies,
      totalRequests,
      completedRequests,
      pendingRequests,
      rejectedRequests,
      requestsByRegion,
      requestsOverTime
    };
  }

  // Get all data for debugging
  getAllData(): AppData {
    return this.data;
  }
}

export default DataManager;