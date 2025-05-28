import axios from 'axios';

// Create an axios instance with default config
const API = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/CSRF
});

// Add a request interceptor to include auth token if available
API.interceptors.request.use(
  (config: any) => {
    const user = localStorage.getItem('user');
    if (user) {
      // In a real app, you would include an auth token here
      // config.headers.Authorization = `Bearer ${JSON.parse(user).token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
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
    try {
      const response = await API.post('auth/login/', { username, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await API.post('auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await API.get('auth/user/');
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },
};

// Departments API
export const departmentsAPI = {
  getAll: async () => {
    try {
      const response = await API.get('departments/');
      return response.data;
    } catch (error) {
      console.error('Get departments error:', error);
      throw error;
    }
  },
  getById: async (id: number) => {
    try {
      const response = await API.get(`departments/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Get department ${id} error:`, error);
      throw error;
    }
  },
  create: async (department: Partial<Department>) => {
    try {
      const response = await API.post('departments/', department);
      return response.data;
    } catch (error) {
      console.error('Create department error:', error);
      throw error;
    }
  },
  update: async (id: number, department: Partial<Department>) => {
    try {
      const response = await API.patch(`departments/${id}/`, department);
      return response.data;
    } catch (error) {
      console.error(`Update department ${id} error:`, error);
      throw error;
    }
  },
  delete: async (id: number) => {
    try {
      await API.delete(`departments/${id}/`);
    } catch (error) {
      console.error(`Delete department ${id} error:`, error);
      throw error;
    }
  },
};

// Employees API
export const employeesAPI = {
  getAll: async () => {
    try {
      const response = await API.get('employees/');
      return response.data;
    } catch (error) {
      console.error('Get employees error:', error);
      throw error;
    }
  },
  getById: async (id: number) => {
    try {
      const response = await API.get(`employees/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Get employee ${id} error:`, error);
      throw error;
    }
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
    try {
      const response = await API.post('employees/', employeeData);
      return response.data;
    } catch (error) {
      console.error('Create employee error:', error);
      throw error;
    }
  },
  update: async (id: number, employee: Partial<Employee>) => {
    try {
      const response = await API.patch(`employees/${id}/`, employee);
      return response.data;
    } catch (error) {
      console.error(`Update employee ${id} error:`, error);
      throw error;
    }
  },
  delete: async (id: number) => {
    try {
      await API.delete(`employees/${id}/`);
    } catch (error) {
      console.error(`Delete employee ${id} error:`, error);
      throw error;
    }
  },
  getSalaryHistory: async (id: number) => {
    try {
      const response = await API.get(`employees/${id}/salary_history/`);
      return response.data;
    } catch (error) {
      console.error(`Get employee ${id} salary history error:`, error);
      throw error;
    }
  },
  getPayrollRecords: async (id: number) => {
    try {
      const response = await API.get(`employees/${id}/payroll_records/`);
      return response.data;
    } catch (error) {
      console.error(`Get employee ${id} payroll records error:`, error);
      throw error;
    }
  },
};

// Allowance Types API
export const allowanceTypesAPI = {
  getAll: async () => {
    try {
      const response = await API.get('allowance-types/');
      return response.data;
    } catch (error) {
      console.error('Get allowance types error:', error);
      throw error;
    }
  },
  getById: async (id: number) => {
    try {
      const response = await API.get(`allowance-types/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Get allowance type ${id} error:`, error);
      throw error;
    }
  },
  create: async (allowanceType: {
    name: string;
    is_percentage: boolean;
    description: string;
  }) => {
    try {
      const response = await API.post('allowance-types/', allowanceType);
      return response.data;
    } catch (error) {
      console.error('Create allowance type error:', error);
      throw error;
    }
  },
  update: async (id: number, allowanceType: Partial<AllowanceType>) => {
    try {
      const response = await API.patch(`allowance-types/${id}/`, allowanceType);
      return response.data;
    } catch (error) {
      console.error(`Update allowance type ${id} error:`, error);
      throw error;
    }
  },
  delete: async (id: number) => {
    try {
      await API.delete(`allowance-types/${id}/`);
    } catch (error) {
      console.error(`Delete allowance type ${id} error:`, error);
      throw error;
    }
  },
};

// Allowances API
export const allowancesAPI = {
  getAll: async () => {
    try {
      const response = await API.get('allowances/');
      return response.data;
    } catch (error) {
      console.error('Get allowances error:', error);
      throw error;
    }
  },
  getById: async (id: number) => {
    try {
      const response = await API.get(`allowances/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Get allowance ${id} error:`, error);
      throw error;
    }
  },
  create: async (allowance: {
    employee: number;
    allowance_type: number;
    amount: number;
    is_percentage: boolean;
  }) => {
    try {
      const response = await API.post('allowances/', allowance);
      return response.data;
    } catch (error) {
      console.error('Create allowance error:', error);
      throw error;
    }
  },
  update: async (id: number, allowance: Partial<Allowance>) => {
    try {
      const response = await API.patch(`allowances/${id}/`, allowance);
      return response.data;
    } catch (error) {
      console.error(`Update allowance ${id} error:`, error);
      throw error;
    }
  },
  delete: async (id: number) => {
    try {
      await API.delete(`allowances/${id}/`);
    } catch (error) {
      console.error(`Delete allowance ${id} error:`, error);
      throw error;
    }
  },
  getByEmployee: async (employeeId: number) => {
    try {
      const response = await API.get(`allowances/?employee=${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Get allowances for employee ${employeeId} error:`, error);
      throw error;
    }
  },
};

// Payroll Records API
export const payrollRecordsAPI = {
  getAll: async () => {
    try {
      const response = await API.get('payroll-records/');
      return response.data;
    } catch (error) {
      console.error('Get payroll records error:', error);
      throw error;
    }
  },
  getById: async (id: number) => {
    try {
      const response = await API.get(`payroll-records/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Get payroll record ${id} error:`, error);
      throw error;
    }
  },
  create: async (payrollRecord: Partial<PayrollRecord>) => {
    try {
      const response = await API.post('payroll-records/', payrollRecord);
      return response.data;
    } catch (error) {
      console.error('Create payroll record error:', error);
      throw error;
    }
  },
  update: async (id: number, payrollRecord: Partial<PayrollRecord>) => {
    try {
      const response = await API.patch(`payroll-records/${id}/`, payrollRecord);
      return response.data;
    } catch (error) {
      console.error(`Update payroll record ${id} error:`, error);
      throw error;
    }
  },
  delete: async (id: number) => {
    try {
      await API.delete(`payroll-records/${id}/`);
    } catch (error) {
      console.error(`Delete payroll record ${id} error:`, error);
      throw error;
    }
  },
  getCurrentMonth: async () => {
    try {
      const response = await API.get('payroll-records/current_month/');
      return response.data;
    } catch (error) {
      console.error('Get current month payroll records error:', error);
      throw error;
    }
  },
  getByPeriod: async (month: number, year: number) => {
    try {
      const response = await API.get(`payroll-records/by_period/?month=${month}&year=${year}`);
      return response.data;
    } catch (error) {
      console.error(`Get payroll records for ${month}/${year} error:`, error);
      throw error;
    }
  },
};

// Audit Logs API
export const auditLogsAPI = {
  getAll: async () => {
    try {
      const response = await API.get('audit-logs/');
      return response.data;
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  },
  create: async (log: {
    action: string;
    details: string;
    performed_by: string;
  }) => {
    try {
      const response = await API.post('audit-logs/', log);
      return response.data;
    } catch (error) {
      console.error('Create audit log error:', error);
      throw error;
    }
  },
};

export default API;
