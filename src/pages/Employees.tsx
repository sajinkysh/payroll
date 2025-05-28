import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { usePayroll } from '../context/PayrollContext';
import { departmentsAPI } from '../services/api';

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  dateHired: string;
  salary: number;
  maritalStatus: 'single' | 'married';
}

interface Department {
  id: number;
  name: string;
  description?: string;
}

const Employees: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, formatCurrency, loading, error } = usePayroll();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    department: '',
    dateHired: '',
    salary: 0,
    maritalStatus: 'single'
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch departments when component mounts
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await departmentsAPI.getAll();
        setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    
    fetchDepartments();
  }, []);

  const columns = [
    { id: 'id', label: 'ID', sortable: true },
    { id: 'name', label: 'Name', sortable: true },
    { id: 'position', label: 'Position', sortable: true },
    { id: 'department', label: 'Department', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'salary', label: 'Salary', sortable: true },
    { id: 'maritalStatus', label: 'Marital Status', sortable: true }
  ];

  const formattedData = employees.map(employee => ({
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`,
    position: employee.position,
    department: employee.department,
    email: employee.email,
    salary: formatCurrency(employee.salary),
    maritalStatus: employee.maritalStatus === 'married' ? 'Married' : 'Single'
  }));

  const handleAddNew = () => {
    setCurrentEmployee({
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      department: '',
      dateHired: '',
      salary: 0,
      maritalStatus: 'single'
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    const employee = employees.find(e => e.id === item.id);
    if (employee) {
      setCurrentEmployee({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        dateHired: employee.dateHired,
        salary: employee.salary,
        maritalStatus: employee.maritalStatus
      });
      setEditingId(employee.id);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (item: any) => {
    setDeleteId(item.id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteEmployee(deleteId);
      setConfirmDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!currentEmployee.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!currentEmployee.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!currentEmployee.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmployee.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!currentEmployee.position.trim()) {
      errors.position = 'Position is required';
    }
    
    if (!currentEmployee.department.trim()) {
      errors.department = 'Department is required';
    }
    
    if (!currentEmployee.dateHired.trim()) {
      errors.dateHired = 'Date hired is required';
    }
    
    if (!currentEmployee.salary || currentEmployee.salary <= 0) {
      errors.salary = 'Salary must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingId !== null) {
        await updateEmployee(editingId, currentEmployee);
      } else {
        await addEmployee(currentEmployee);
      }
      
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error submitting employee:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Employees</h1>
      
      <button className="btn btn-primary" onClick={handleAddNew}>
        <Plus size={20} />
        Add New Employee
      </button>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="text-center mt-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={formattedData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Employee' : 'Add New Employee'}
        footer={
          <>
            <button className="btn" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {editingId ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                editingId ? 'Update' : 'Save'
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              className={`form-control ${formErrors.firstName ? 'is-invalid' : ''}`}
              value={currentEmployee.firstName}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, firstName: e.target.value })}
              required
            />
            {formErrors.firstName && <div className="invalid-feedback">{formErrors.firstName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              className={`form-control ${formErrors.lastName ? 'is-invalid' : ''}`}
              value={currentEmployee.lastName}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, lastName: e.target.value })}
              required
            />
            {formErrors.lastName && <div className="invalid-feedback">{formErrors.lastName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
              value={currentEmployee.email}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, email: e.target.value })}
              required
            />
            {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="position">Position</label>
            <input
              type="text"
              id="position"
              className={`form-control ${formErrors.position ? 'is-invalid' : ''}`}
              value={currentEmployee.position}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, position: e.target.value })}
              required
            />
            {formErrors.position && <div className="invalid-feedback">{formErrors.position}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              className={`form-control ${formErrors.department ? 'is-invalid' : ''}`}
              value={currentEmployee.department}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, department: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
            {formErrors.department && <div className="invalid-feedback">{formErrors.department}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="dateHired">Date Hired</label>
            <input
              type="date"
              id="dateHired"
              className={`form-control ${formErrors.dateHired ? 'is-invalid' : ''}`}
              value={currentEmployee.dateHired}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, dateHired: e.target.value })}
              required
            />
            {formErrors.dateHired && <div className="invalid-feedback">{formErrors.dateHired}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="salary">Monthly Salary (Rs.)</label>
            <input
              type="number"
              id="salary"
              className={`form-control ${formErrors.salary ? 'is-invalid' : ''}`}
              min="0"
              step="0.01"
              value={currentEmployee.salary}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, salary: parseFloat(e.target.value) || 0 })}
              required
            />
            {formErrors.salary && <div className="invalid-feedback">{formErrors.salary}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="maritalStatus">Marital Status</label>
            <select
              id="maritalStatus"
              className="form-control"
              value={currentEmployee.maritalStatus}
              onChange={(e) => setCurrentEmployee({ ...currentEmployee, maritalStatus: e.target.value as 'single' | 'married' })}
              required
            >
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
          </div>
        </form>
      </Modal>
      
      <Modal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Confirm Delete"
        footer={
          <>
            <button className="btn\" onClick={() => setConfirmDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        <p>Are you sure you want to delete this employee? This action cannot be undone and will remove all associated payslips and allowances.</p>
      </Modal>
    </div>
  );
};

export default Employees;