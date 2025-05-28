import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { employeesAPI, departmentsAPI, allowanceTypesAPI, allowancesAPI, payrollRecordsAPI, auditLogsAPI } from '../services/api';

interface AllowanceType {
  id: number;
  name: string;
  isPercentage: boolean;
  description: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  dateHired: string;
  salary: number;
  maritalStatus: 'single' | 'married';
}

interface Payslip {
  id: number;
  employeeId: number;
  employeeName: string;
  period: string;
  grossSalary: number;
  totalDeductions: number;
  taxAmount: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  paymentDate: string | null;
}

interface Allowance {
  id: number;
  employeeId: number;
  allowanceTypeId: number;
  allowanceTypeName: string;
  amount: number;
  isPercentage: boolean;
}

interface AuditLog {
  id: number;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
}

interface PayrollContextType {
  allowanceTypes: AllowanceType[];
  employees: Employee[];
  payslips: Payslip[];
  allowances: Allowance[];
  auditLogs: AuditLog[];
  loading: boolean;
  error: string | null;
  
  addAllowanceType: (allowanceType: Omit<AllowanceType, 'id'>) => Promise<void>;
  updateAllowanceType: (id: number, allowanceType: Partial<AllowanceType>) => Promise<void>;
  deleteAllowanceType: (id: number) => Promise<void>;
  
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: number, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
  
  addPayslip: (payslip: Omit<Payslip, 'id'>) => Promise<void>;
  updatePayslip: (id: number, payslip: Partial<Payslip>) => Promise<void>;
  deletePayslip: (id: number) => Promise<void>;
  
  addAllowance: (allowance: Omit<Allowance, 'id'>) => Promise<void>;
  updateAllowance: (id: number, allowance: Partial<Allowance>) => Promise<void>;
  deleteAllowance: (id: number) => Promise<void>;
  
  calculateTax: (annualIncome: number, maritalStatus: 'single' | 'married') => number;
  formatCurrency: (amount: number) => string;
  
  logAction: (action: string, details: string, performedBy: string) => Promise<void>;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

const initialAllowanceTypes: AllowanceType[] = [
  { id: 1, name: 'Degree', isPercentage: true, description: 'It is acceptable for all employees' },
  { id: 2, name: 'Encourage', isPercentage: false, description: 'For all academic staff in university' },
  { id: 4, name: 'University Service', isPercentage: true, description: '' },
  { id: 5, name: 'Risk', isPercentage: true, description: '' },
];

const initialEmployees: Employee[] = [
  { 
    id: 1, 
    firstName: 'John', 
    lastName: 'Doe', 
    email: 'john.doe@seraphworld.edu', 
    position: 'Teacher', 
    department: 'Elementary', 
    dateHired: '2022-01-15', 
    salary: 45000,
    maritalStatus: 'single'
  },
  { 
    id: 2, 
    firstName: 'Jane', 
    lastName: 'Smith', 
    email: 'jane.smith@seraphworld.edu', 
    position: 'Administrator', 
    department: 'Management', 
    dateHired: '2021-06-10', 
    salary: 55000,
    maritalStatus: 'married'
  },
];

export const PayrollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allowanceTypes, setAllowanceTypes] = useState<AllowanceType[]>(initialAllowanceTypes);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch employees from API
        const employeesData = await employeesAPI.getAll();
        if (employeesData) {
          // Transform API data to match frontend model
          const transformedEmployees = employeesData.map((emp: any) => ({
            id: emp.id,
            firstName: emp.user.first_name,
            lastName: emp.user.last_name,
            email: emp.user.email,
            position: emp.position,
            department: emp.department_name || '',
            dateHired: emp.date_joined,
            salary: parseFloat(emp.salary || 0),
            maritalStatus: emp.gender === 'M' ? 'married' : 'single'
          }));
          setEmployees(transformedEmployees);
        }
        
        // Fetch departments
        const departmentsData = await departmentsAPI.getAll();
        if (departmentsData) {
          // You could use this data if needed in the context
          console.log('Departments loaded:', departmentsData.length);
        }
        
        // Fetch allowance types
        const allowanceTypesData = await allowanceTypesAPI.getAll();
        if (allowanceTypesData && allowanceTypesData.length > 0) {
          const transformedAllowanceTypes = allowanceTypesData.map((at: any) => ({
            id: at.id,
            name: at.name,
            isPercentage: at.is_percentage,
            description: at.description || ''
          }));
          setAllowanceTypes(transformedAllowanceTypes);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data from server');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);  // Empty dependency array means this runs once on mount

  const calculateTax = (annualIncome: number, maritalStatus: 'single' | 'married') => {
    const taxThreshold = maritalStatus === 'single' ? 500000 : 600000;
    if (annualIncome <= taxThreshold) {
      return annualIncome * 0.01; // 1% tax
    } else {
      // For income above threshold, calculate progressive tax
      const baseAmount = taxThreshold * 0.01;
      const excessAmount = (annualIncome - taxThreshold) * 0.015; // 1.5% for amount exceeding threshold
      return baseAmount + excessAmount;
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-IN')}`;
  };

  // Allowance Types CRUD
  const addAllowanceType = async (allowanceType: Omit<AllowanceType, 'id'>) => {
    try {
      setLoading(true);
      // Transform to API model
      const allowanceTypeData = {
        name: allowanceType.name,
        is_percentage: allowanceType.isPercentage,
        description: allowanceType.description || ''
      };
      
      // Call API
      const response = await allowanceTypesAPI.create(allowanceTypeData);
      
      // Update local state
      const newAllowanceType = {
        ...allowanceType,
        id: response.id || (allowanceTypes.length > 0 ? Math.max(...allowanceTypes.map(at => at.id)) + 1 : 1)
      };
      setAllowanceTypes([...allowanceTypes, newAllowanceType]);
      
      // Log action
      await logAction('Create', `Created allowance type: ${allowanceType.name}`, 'Admin');
      setError(null);
    } catch (err) {
      console.error('Error adding allowance type:', err);
      setError('Failed to add allowance type');
    } finally {
      setLoading(false);
    }
  };

  const updateAllowanceType = async (id: number, allowanceType: Partial<AllowanceType>) => {
    try {
      setLoading(true);
      
      // Transform to API model
      const allowanceTypeData: any = {};
      if (allowanceType.name) allowanceTypeData.name = allowanceType.name;
      if (allowanceType.isPercentage !== undefined) allowanceTypeData.is_percentage = allowanceType.isPercentage;
      if (allowanceType.description !== undefined) allowanceTypeData.description = allowanceType.description;
      
      // Call API
      await allowanceTypesAPI.update(id, allowanceTypeData);
      
      // Update local state
      setAllowanceTypes(allowanceTypes.map(at => 
        at.id === id ? { ...at, ...allowanceType } : at
      ));
      
      // Log action
      await logAction('Update', `Updated allowance type ID: ${id}`, 'Admin');
      setError(null);
    } catch (err) {
      console.error('Error updating allowance type:', err);
      setError('Failed to update allowance type');
    } finally {
      setLoading(false);
    }
  };

  const deleteAllowanceType = async (id: number) => {
    try {
      setLoading(true);
      
      // Call API
      await allowanceTypesAPI.delete(id);
      
      // Update local state
      setAllowanceTypes(allowanceTypes.filter(at => at.id !== id));
      
      // Log action
      await logAction('Delete', `Deleted allowance type ID: ${id}`, 'Admin');
      setError(null);
    } catch (err) {
      console.error('Error deleting allowance type:', err);
      setError('Failed to delete allowance type');
    } finally {
      setLoading(false);
    }
  };

  // Employees CRUD
  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    try {
      setLoading(true);
      
      // First, get the department ID from the name
      let departmentId;
      try {
        // Fetch all departments to find the ID for the selected department name
        const departments = await departmentsAPI.getAll();
        const selectedDepartment = departments.find((dept: { id: number; name: string }) => dept.name === employee.department);
        if (selectedDepartment) {
          departmentId = selectedDepartment.id;
        } else {
          // If department not found, use the first available department
          departmentId = departments.length > 0 ? departments[0].id : 1;
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        departmentId = 1; // Fallback to ID 1 if there's an error
      }
      
      // Transform frontend model to API model
      const employeeData = {
        username: employee.email.split('@')[0], // Generate username from email
        password: 'defaultpassword123', // Default password, should be changed
        email: employee.email,
        first_name: employee.firstName,
        last_name: employee.lastName,
        employee_id: `EMP${Math.floor(Math.random() * 10000)}`, // Generate random employee ID
        department: departmentId, // Use the department ID we found
        position: employee.position,
        date_joined: employee.dateHired,
        gender: employee.maritalStatus === 'married' ? 'M' : 'S'
      };
      
      // Call API to create employee
      const response = await employeesAPI.create(employeeData);
      
      // Add the new employee to state
      const newEmployee = {
        ...employee,
        id: response.id
      };
      setEmployees([...employees, newEmployee]);
      
      // Log the action
      logAction('Create', `Created employee: ${employee.firstName} ${employee.lastName}`, 'Admin');
      setError(null);
    } catch (err) {
      console.error('Error adding employee:', err);
      setError('Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (id: number, employee: Partial<Employee>) => {
    try {
      setLoading(true);
      
      // Find the current employee to get complete data
      const currentEmployee = employees.find(e => e.id === id);
      if (!currentEmployee) {
        throw new Error('Employee not found');
      }
      
      // Transform frontend model to API model
      const employeeData: any = {};
      
      if (employee.firstName) employeeData.first_name = employee.firstName;
      if (employee.lastName) employeeData.last_name = employee.lastName;
      if (employee.position) employeeData.position = employee.position;
      if (employee.dateHired) employeeData.date_joined = employee.dateHired;
      if (employee.maritalStatus) employeeData.gender = employee.maritalStatus === 'married' ? 'M' : 'S';
      
      // Call API to update employee
      await employeesAPI.update(id, employeeData);
      
      // Update local state
      setEmployees(employees.map(e => 
        e.id === id ? { ...e, ...employee } : e
      ));
      
      // Log the action
      logAction('Update', `Updated employee ID: ${id}`, 'Admin');
      setError(null);
    } catch (err) {
      console.error('Error updating employee:', err);
      setError('Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      setLoading(true);
      
      // Call API to delete employee
      await employeesAPI.delete(id);
      
      // Update local state
      setEmployees(employees.filter(e => e.id !== id));
      
      // Log the action
      logAction('Delete', `Deleted employee ID: ${id}`, 'Admin');
      setError(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  // Payslips CRUD
  const addPayslip = async (payslip: Omit<Payslip, 'id'>) => {
    try {
      setLoading(true);
      
      // Transform to API model
      const payslipData = {
        employee: payslip.employeeId,
        month: parseInt(payslip.period.split('-')[1]),
        year: parseInt(payslip.period.split('-')[0]),
        days_worked: 30, // Default value
        overtime_hours: 0,
        overtime_rate: 0,
        deductions: payslip.totalDeductions,
        tax: payslip.taxAmount,
        net_salary: payslip.netSalary,
        status: payslip.status,
        payment_date: payslip.paymentDate || undefined
      };
      
      // Call API
      const response = await payrollRecordsAPI.create(payslipData);
      
      // Update local state
      const newPayslip = {
        ...payslip,
        id: response.id || (payslips.length > 0 ? Math.max(...payslips.map(p => p.id)) + 1 : 1)
      };
      setPayslips([...payslips, newPayslip]);
      
      // Log action
      await logAction('Create', `Created payslip for employee ID: ${payslip.employeeId}`, 'Admin');
      setError(null);
    } catch (err) {
      console.error('Error adding payslip:', err);
      setError('Failed to add payslip');
    } finally {
      setLoading(false);
    }
  };

  const updatePayslip = async (id: number, payslip: Partial<Payslip>) => {
    try {
      setLoading(true);
      
      // Transform to API model
      const payslipData: any = {};
      if (payslip.status) payslipData.status = payslip.status;
      if (payslip.paymentDate) payslipData.payment_date = payslip.paymentDate;
      
      // Call API
      await payrollRecordsAPI.update(id, payslipData);
      
      // Update local state
      setPayslips(payslips.map(p => 
        p.id === id ? { ...p, ...payslip } : p
      ));
      
      // Log action
      await logAction('Update', `Updated payslip ID: ${id}`, 'Admin');
      setError(null);
    } catch (err) {
      console.error('Error updating payslip:', err);
      setError('Failed to update payslip');
    } finally {
      setLoading(false);
    }
  };

  const deletePayslip = async (id: number) => {
    try {
      setLoading(true);
      
      // Call API
      await payrollRecordsAPI.delete(id);
      
      // Update local state
      setPayslips(payslips.filter(p => p.id !== id));
      
      // Log action
      await logAction('Delete', `Deleted payslip ID: ${id}`, 'Admin');
      setError(null);
    } catch (err) {
      console.error('Error deleting payslip:', err);
      setError('Failed to delete payslip');
    } finally {
      setLoading(false);
    }
  };

  // Allowances CRUD
  const addAllowance = async (allowance: Omit<Allowance, 'id'>) => {
    try {
      setLoading(true);
      
      // Transform to API model
      const allowanceData = {
        employee: allowance.employeeId,
        allowance_type: allowance.allowanceTypeId,
        amount: allowance.amount,
        is_percentage: allowance.isPercentage
      };
      
      // Call API
      const response = await allowancesAPI.create(allowanceData);
      
      // Update local state
      const newAllowance = {
        ...allowance,
        id: response.id || (allowances.length > 0 ? Math.max(...allowances.map(a => a.id)) + 1 : 1)
      };
      setAllowances([...allowances, newAllowance]);
      
      // Log action
      await logAction('Create', `Created allowance for employee ID: ${allowance.employeeId}`, 'Admin');
      setError(null);
    } catch (err) {
      console.error('Error adding allowance:', err);
      setError('Failed to add allowance');
    } finally {
      setLoading(false);
    }
  };

  const updateAllowance = async (id: number, allowance: Partial<Allowance>) => {
    try {
      setLoading(true);
      
      // Transform to API model
      const allowanceData: any = {};
      if (allowance.amount !== undefined) allowanceData.amount = allowance.amount;
      if (allowance.isPercentage !== undefined) allowanceData.is_percentage = allowance.isPercentage;
      
      // Call API
      await allowancesAPI.update(id, allowanceData);
      
      // Update local state
      setAllowances(allowances.map(a => 
        a.id === id ? { ...a, ...allowance } : a
      ));
      
      // Log action
      await logAction('Update', `Updated allowance ID: ${id}`, 'Admin');
      setError(null);
    } catch (err) {
      console.error('Error updating allowance:', err);
      setError('Failed to update allowance');
    } finally {
      setLoading(false);
    }
  };

  const deleteAllowance = async (id: number) => {
    try {
      setLoading(true);
      
      // Call API
      await allowancesAPI.delete(id);
      
      // Update local state
      setAllowances(allowances.filter(a => a.id !== id));
      
      // Log action
      await logAction('Delete', `Deleted allowance ID: ${id}`, 'Admin');
      setError(null);
    } catch (err) {
      console.error('Error deleting allowance:', err);
      setError('Failed to delete allowance');
    } finally {
      setLoading(false);
    }
  };

  // Audit logging
  const logAction = async (action: string, details: string, performedBy: string) => {
    try {
      // Create log entry in API
      const logData = {
        action,
        details,
        performed_by: performedBy
      };
      
      // Call API to create log
      const response = await auditLogsAPI.create(logData);
      
      // Add to local state
      const newLog = {
        id: response?.id || (auditLogs.length > 0 ? Math.max(...auditLogs.map(log => log.id)) + 1 : 1),
        action,
        details,
        performedBy,
        timestamp: new Date().toISOString()
      };
      setAuditLogs([newLog, ...auditLogs]);
    } catch (err) {
      console.error('Error logging action:', err);
      // Still add to local state even if API fails
      const newLog = {
        id: auditLogs.length > 0 ? Math.max(...auditLogs.map(log => log.id)) + 1 : 1,
        action,
        details,
        performedBy,
        timestamp: new Date().toISOString()
      };
      setAuditLogs([newLog, ...auditLogs]);
    }
  };

  const value = {
    allowanceTypes,
    employees,
    payslips,
    allowances,
    auditLogs,
    loading,
    error,
    addAllowanceType,
    updateAllowanceType,
    deleteAllowanceType,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addPayslip,
    updatePayslip,
    deletePayslip,
    addAllowance,
    updateAllowance,
    deleteAllowance,
    calculateTax,
    formatCurrency,
    logAction
  };

  return <PayrollContext.Provider value={value}>{children}</PayrollContext.Provider>;
};

export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (context === undefined) {
    throw new Error('usePayroll must be used within a PayrollProvider');
  }
  return context;
};