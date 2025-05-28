import axios from 'axios';

// Create an axios instance with default config
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/CSRF
});

// Add a request interceptor to include auth token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types that match our Django models
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  user: User;
  employee_id: string;
  department: number;
  department_name?: string;
  position: string;
  date_of_birth?: string;
  date_joined: string;
  phone_number?: string;
  address?: string;
  gender?: string;
  profile_picture?: string;
  is_active: boolean;
}

export interface AllowanceType {
  id: number;
  name: string;
  is_percentage: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Allowance {
  id: number;
  employee: number;
  employee_name?: string;
  allowance_type: number;
  allowance_type_name?: string;
  amount: number;
  is_percentage: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: number;
  employee: number;
  employee_name?: string;
  month: number;
  year: number;
  days_worked: number;
  overtime_hours: number;
  overtime_rate: number;
  deductions: number;
  tax: number;
  net_salary: number;
  status: string;
  payment_date?: string;
  payment_method?: string;
  transaction_id?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await API.post('auth/login/', { username, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },
  
  logout: async () => {
    await API.post('auth/logout/');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async () => {
    const response = await API.get('auth/user/');
    return response.data;
  },
};

// Departments API
export const departmentsAPI = {
  getAll: async () => {
    const response = await API.get('departments/');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await API.get(`departments/${id}/`);
    return response.data;
  },
  
  create: async (department: Partial<Department>) => {
    const response = await API.post('departments/', department);
    return response.data;
  },
  
  update: async (id: number, department: Partial<Department>) => {
    const response = await API.patch(`departments/${id}/`, department);
    return response.data;
  },
  
  delete: async (id: number) => {
    await API.delete(`departments/${id}/`);
  },
};

// Employees API
export const employeesAPI = {
  getAll: async () => {
    const response = await API.get('employees/');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await API.get(`employees/${id}/`);
    return response.data;
  },
  
  create: async (employeeData: {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    department: number;
    position: string;
    date_joined: string;
    date_of_birth?: string;
    phone_number?: string;
    address?: string;
    gender?: string;
  }) => {
    const response = await API.post('employees/', employeeData);
    return response.data;
  },
  
  update: async (id: number, employee: Partial<Employee>) => {
    const response = await API.patch(`employees/${id}/`, employee);
    return response.data;
  },
  
  delete: async (id: number) => {
    await API.delete(`employees/${id}/`);
  },
  
  getSalaryHistory: async (id: number) => {
    const response = await API.get(`employees/${id}/salary-history/`);
    return response.data;
  },
  
  getPayrollRecords: async (id: number) => {
    const response = await API.get(`employees/${id}/payroll-records/`);
    return response.data;
  },
};

// Allowance Types API
export const allowanceTypesAPI = {
  getAll: async () => {
    const response = await API.get('allowance-types/');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await API.get(`allowance-types/${id}/`);
    return response.data;
  },
  
  create: async (allowanceType: {
    name: string;
    is_percentage: boolean;
    description: string;
  }) => {
    const response = await API.post('allowance-types/', allowanceType);
    return response.data;
  },
  
  update: async (id: number, allowanceType: Partial<AllowanceType>) => {
    const response = await API.patch(`allowance-types/${id}/`, allowanceType);
    return response.data;
  },
  
  delete: async (id: number) => {
    await API.delete(`allowance-types/${id}/`);
  },
};

// Allowances API
export const allowancesAPI = {
  getAll: async () => {
    const response = await API.get('allowances/');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await API.get(`allowances/${id}/`);
    return response.data;
  },
  
  create: async (allowance: {
    employee: number;
    allowance_type: number;
    amount: number;
    is_percentage: boolean;
  }) => {
    const response = await API.post('allowances/', allowance);
    return response.data;
  },
  
  update: async (id: number, allowance: Partial<Allowance>) => {
    const response = await API.patch(`allowances/${id}/`, allowance);
    return response.data;
  },
  
  delete: async (id: number) => {
    await API.delete(`allowances/${id}/`);
  },
  
  getByEmployee: async (employeeId: number) => {
    const response = await API.get(`allowances/?employee=${employeeId}`);
    return response.data;
  },
};

// Payroll Records API
export const payrollRecordsAPI = {
  getAll: async () => {
    const response = await API.get('payroll-records/');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await API.get(`payroll-records/${id}/`);
    return response.data;
  },
  
  create: async (payrollRecord: Partial<PayrollRecord>) => {
    const response = await API.post('payroll-records/', payrollRecord);
    return response.data;
  },
  
  update: async (id: number, payrollRecord: Partial<PayrollRecord>) => {
    const response = await API.patch(`payroll-records/${id}/`, payrollRecord);
    return response.data;
  },
  
  delete: async (id: number) => {
    await API.delete(`payroll-records/${id}/`);
  },
  
  getCurrentMonth: async () => {
    const response = await API.get('payroll-records/current-month/');
    return response.data;
  },
  
  getByPeriod: async (month: number, year: number) => {
    const response = await API.get(`payroll-records/by-period/?month=${month}&year=${year}`);
    return response.data;
  },
};

// Audit Logs API
export const auditLogsAPI = {
  getAll: async () => {
    const response = await API.get('audit-logs/');
    return response.data;
  },
  
  create: async (log: {
    action: string;
    details: string;
    performed_by: string;
  }) => {
    const response = await API.post('audit-logs/', log);
    return response.data;
  },
};

export default API;