import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { usePayroll } from '../context/PayrollContext';

interface AllowanceTypeFormData {
  name: string;
  isPercentage: boolean;
  description: string;
}

const AllowanceTypes: React.FC = () => {
  const { allowanceTypes, addAllowanceType, updateAllowanceType, deleteAllowanceType } = usePayroll();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAllowanceType, setCurrentAllowanceType] = useState<AllowanceTypeFormData>({
    name: '',
    isPercentage: false,
    description: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const columns = [
    { id: 'id', label: 'ID', sortable: true },
    { id: 'name', label: 'Allowance Name', sortable: true },
    { id: 'isPercentage', label: 'Is Percentage', sortable: true },
    { id: 'description', label: 'Description', sortable: true }
  ];

  const formattedData = allowanceTypes.map(type => ({
    ...type,
    isPercentage: type.isPercentage ? 'Yes' : 'No'
  }));

  const handleAddNew = () => {
    setCurrentAllowanceType({
      name: '',
      isPercentage: false,
      description: ''
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setCurrentAllowanceType({
      name: item.name,
      isPercentage: item.isPercentage === 'Yes',
      description: item.description
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleDelete = (item: any) => {
    setDeleteId(item.id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteAllowanceType(deleteId);
      setConfirmDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId !== null) {
      updateAllowanceType(editingId, currentAllowanceType);
    } else {
      addAllowanceType(currentAllowanceType);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1 className="page-title">Allowance Types</h1>
      
      <button className="btn btn-primary" onClick={handleAddNew}>
        <Plus size={20} />
        Add New Allowance Type
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
        title={editingId ? 'Edit Allowance Type' : 'Add New Allowance Type'}
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
            <label htmlFor="name">Allowance Name</label>
            <input
              type="text"
              id="name"
              className="form-control"
              value={currentAllowanceType.name}
              onChange={(e) => setCurrentAllowanceType({ ...currentAllowanceType, name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <div className="form-check">
              <input
                type="checkbox"
                id="isPercentage"
                checked={currentAllowanceType.isPercentage}
                onChange={(e) => setCurrentAllowanceType({ ...currentAllowanceType, isPercentage: e.target.checked })}
              />
              <label htmlFor="isPercentage">Is Percentage</label>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-control"
              value={currentAllowanceType.description}
              onChange={(e) => setCurrentAllowanceType({ ...currentAllowanceType, description: e.target.value })}
              rows={3}
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
        <p>Are you sure you want to delete this allowance type? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default AllowanceTypes;