import React, { useState } from 'react';
import { Plus, FileDown } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { usePayroll } from '../context/PayrollContext';

interface PayslipFormData {
  employeeId: number;
  period: string;
  grossSalary: number;
  totalDeductions: number;
  status: 'draft' | 'approved' | 'paid';
  paymentDate: string | null;
}

const Payslips: React.FC = () => {
  const { payslips, employees, addPayslip, updatePayslip, deletePayslip, calculateTax, formatCurrency } = usePayroll();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayslip, setCurrentPayslip] = useState<PayslipFormData>({
    employeeId: 0,
    period: '',
    grossSalary: 0,
    totalDeductions: 0,
    status: 'draft',
    paymentDate: null
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const columns = [
    { id: 'id', label: 'ID', sortable: true },
    { id: 'employeeName', label: 'Employee', sortable: true },
    { id: 'period', label: 'Period', sortable: true },
    { id: 'grossSalary', label: 'Gross Salary', sortable: true },
    { id: 'taxAmount', label: 'Tax', sortable: true },
    { id: 'netSalary', label: 'Net Salary', sortable: true },
    { id: 'status', label: 'Status', sortable: true }
  ];

  const formattedData = payslips.map(payslip => ({
    id: payslip.id,
    employeeName: payslip.employeeName,
    period: payslip.period,
    grossSalary: formatCurrency(payslip.grossSalary),
    taxAmount: formatCurrency(payslip.taxAmount),
    netSalary: formatCurrency(payslip.netSalary),
    status: payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1)
  }));

  const handleAddNew = () => {
    const defaultEmployeeId = employees.length > 0 ? employees[0].id : 0;
    
    setCurrentPayslip({
      employeeId: defaultEmployeeId,
      period: new Date().toISOString().substring(0, 7),
      grossSalary: 0,
      totalDeductions: 0,
      status: 'draft',
      paymentDate: null
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    const payslip = payslips.find(p => p.id === item.id);
    if (payslip) {
      setCurrentPayslip({
        employeeId: payslip.employeeId,
        period: payslip.period,
        grossSalary: payslip.grossSalary,
        totalDeductions: payslip.totalDeductions,
        status: payslip.status,
        paymentDate: payslip.paymentDate
      });
      setEditingId(payslip.id);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (item: any) => {
    setDeleteId(item.id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deletePayslip(deleteId);
      setConfirmDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedEmployee = employees.find(emp => emp.id === currentPayslip.employeeId);
    if (!selectedEmployee) return;

    const employeeName = `${selectedEmployee.firstName} ${selectedEmployee.lastName}`;
    const annualIncome = currentPayslip.grossSalary * 12;
    const taxAmount = calculateTax(annualIncome, selectedEmployee.maritalStatus) / 12; // Monthly tax
    const netSalary = currentPayslip.grossSalary - currentPayslip.totalDeductions - taxAmount;
    
    const payslipData = {
      ...currentPayslip,
      employeeName,
      taxAmount,
      netSalary
    };
    
    if (editingId !== null) {
      updatePayslip(editingId, payslipData);
    } else {
      addPayslip(payslipData);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1 className="page-title">Payslips</h1>
      
      <button className="btn btn-primary" onClick={handleAddNew}>
        <Plus size={20} />
        Create New Payslip
      </button>
      
      <DataTable
        columns={columns}
        data={formattedData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Payslip' : 'Create New Payslip'}
        footer={
          <>
            <button className="btn\" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingId ? 'Update' : 'Save'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="employeeId">Employee</label>
            <select
              id="employeeId"
              className="form-control"
              value={currentPayslip.employeeId}
              onChange={(e) => setCurrentPayslip({ ...currentPayslip, employeeId: parseInt(e.target.value, 10) })}
              required
            >
              <option value="">Select Employee</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} ({employee.maritalStatus})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="period">Pay Period (YYYY-MM)</label>
            <input
              type="month"
              id="period"
              className="form-control"
              value={currentPayslip.period}
              onChange={(e) => setCurrentPayslip({ ...currentPayslip, period: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="grossSalary">Gross Salary (Rs.)</label>
            <input
              type="number"
              id="grossSalary"
              className="form-control"
              min="0"
              step="0.01"
              value={currentPayslip.grossSalary}
              onChange={(e) => setCurrentPayslip({ ...currentPayslip, grossSalary: parseFloat(e.target.value) })}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="totalDeductions">Other Deductions (Rs.)</label>
            <input
              type="number"
              id="totalDeductions"
              className="form-control"
              min="0"
              step="0.01"
              value={currentPayslip.totalDeductions}
              onChange={(e) => setCurrentPayslip({ ...currentPayslip, totalDeductions: parseFloat(e.target.value) })}
              required
            />
          </div>

          {currentPayslip.employeeId > 0 && (
            <div className="form-group">
              <label>Monthly Tax Amount (Rs.)</label>
              <p className="form-control">
                {formatCurrency(calculateTax(currentPayslip.grossSalary * 12, 
                  employees.find(e => e.id === currentPayslip.employeeId)?.maritalStatus || 'single') / 12)}
              </p>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              className="form-control"
              value={currentPayslip.status}
              onChange={(e) => setCurrentPayslip({ ...currentPayslip, status: e.target.value as 'draft' | 'approved' | 'paid' })}
              required
            >
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          
          {currentPayslip.status === 'paid' && (
            <div className="form-group">
              <label htmlFor="paymentDate">Payment Date</label>
              <input
                type="date"
                id="paymentDate"
                className="form-control"
                value={currentPayslip.paymentDate || ''}
                onChange={(e) => setCurrentPayslip({ ...currentPayslip, paymentDate: e.target.value })}
                required
              />
            </div>
          )}
          
          {currentPayslip.employeeId > 0 && (
            <div className="form-group">
              <label>Net Salary (Rs.)</label>
              <p className="form-control">
                {formatCurrency(
                  currentPayslip.grossSalary - 
                  currentPayslip.totalDeductions - 
                  (calculateTax(currentPayslip.grossSalary * 12, 
                    employees.find(e => e.id === currentPayslip.employeeId)?.maritalStatus || 'single') / 12)
                )}
              </p>
            </div>
          )}
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
        <p>Are you sure you want to delete this payslip? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default Payslips;