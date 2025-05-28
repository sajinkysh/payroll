import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { usePayroll } from '../context/PayrollContext';

interface AllowanceFormData {
  employeeId: number;
  allowanceTypeId: number;
  amount: number;
}

const Allowances: React.FC = () => {
  const { allowances, employees, allowanceTypes, addAllowance, updateAllowance, deleteAllowance } = usePayroll();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAllowance, setCurrentAllowance] = useState<AllowanceFormData>({
    employeeId: 0,
    allowanceTypeId: 0,
    amount: 0
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const columns = [
    { id: 'id', label: 'ID', sortable: true },
    { id: 'employeeName', label: 'Employee', sortable: true },
    { id: 'allowanceTypeName', label: 'Allowance Type', sortable: true },
    { id: 'amount', label: 'Amount', sortable: true },
    { id: 'isPercentage', label: 'Is Percentage', sortable: true }
  ];

  const formattedData = allowances.map(allowance => {
    const employee = employees.find(e => e.id === allowance.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
    
    return {
      id: allowance.id,
      employeeName,
      allowanceTypeName: allowance.allowanceTypeName,
      amount: allowance.isPercentage ? `${allowance.amount}%` : `$${allowance.amount.toFixed(2)}`,
      isPercentage: allowance.isPercentage ? 'Yes' : 'No'
    };
  });

  const handleAddNew = () => {
    // Default to the first employee and allowance type if available
    const defaultEmployeeId = employees.length > 0 ? employees[0].id : 0;
    const defaultAllowanceTypeId = allowanceTypes.length > 0 ? allowanceTypes[0].id : 0;
    
    setCurrentAllowance({
      employeeId: defaultEmployeeId,
      allowanceTypeId: defaultAllowanceTypeId,
      amount: 0
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    const allowance = allowances.find(a => a.id === item.id);
    if (allowance) {
      setCurrentAllowance({
        employeeId: allowance.employeeId,
        allowanceTypeId: allowance.allowanceTypeId,
        amount: allowance.amount
      });
      setEditingId(allowance.id);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (item: any) => {
    setDeleteId(item.id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteAllowance(deleteId);
      setConfirmDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedAllowanceType = allowanceTypes.find(at => at.id === currentAllowance.allowanceTypeId);
    
    if (selectedAllowanceType) {
      const allowanceData = {
        ...currentAllowance,
        allowanceTypeName: selectedAllowanceType.name,
        isPercentage: selectedAllowanceType.isPercentage
      };
      
      if (editingId !== null) {
        updateAllowance(editingId, allowanceData);
      } else {
        addAllowance(allowanceData);
      }
      
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Allowances</h1>
      
      <button className="btn btn-primary" onClick={handleAddNew}>
        <Plus size={20} />
        Add New Allowance
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
        title={editingId ? 'Edit Allowance' : 'Add New Allowance'}
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
              value={currentAllowance.employeeId}
              onChange={(e) => setCurrentAllowance({ ...currentAllowance, employeeId: parseInt(e.target.value, 10) })}
              required
            >
              <option value="">Select Employee</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="allowanceTypeId">Allowance Type</label>
            <select
              id="allowanceTypeId"
              className="form-control"
              value={currentAllowance.allowanceTypeId}
              onChange={(e) => setCurrentAllowance({ ...currentAllowance, allowanceTypeId: parseInt(e.target.value, 10) })}
              required
            >
              <option value="">Select Allowance Type</option>
              {allowanceTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.isPercentage ? 'Percentage' : 'Fixed Amount'})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">
              Amount 
              {currentAllowance.allowanceTypeId && (
                <span>
                  ({allowanceTypes.find(at => at.id === currentAllowance.allowanceTypeId)?.isPercentage ? '%' : '$'})
                </span>
              )}
            </label>
            <input
              type="number"
              id="amount"
              className="form-control"
              min="0"
              step="0.01"
              value={currentAllowance.amount}
              onChange={(e) => setCurrentAllowance({ ...currentAllowance, amount: parseFloat(e.target.value) })}
              required
            />
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
        <p>Are you sure you want to delete this allowance? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default Allowances;