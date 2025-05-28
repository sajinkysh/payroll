import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Users, FileText, PieChart, Search, Receipt, ChevronDown } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [allowancesOpen, setAllowancesOpen] = useState(true);

  const toggleAllowances = () => {
    setAllowancesOpen(!allowancesOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <BarChart3 size={24} />
          <h2>PMS</h2>
        </div>
      </div>
      <div className="sidebar-title">
        <h3>Payroll</h3>
        <h3>Management</h3>
        <h3>System</h3>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/employees" className={({ isActive }) => isActive ? 'active' : ''}>
          <Users size={20} />
          <span>Employees</span>
        </NavLink>
        <NavLink to="/payslips" className={({ isActive }) => isActive ? 'active' : ''}>
          <FileText size={20} />
          <span>Payslips</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
          <PieChart size={20} />
          <span>Reports</span>
          <ChevronDown className="dropdown-icon" size={16} />
        </NavLink>
        <NavLink to="/auditing" className={({ isActive }) => isActive ? 'active' : ''}>
          <Search size={20} />
          <span>Auditing</span>
          <ChevronDown className="dropdown-icon" size={16} />
        </NavLink>
        <div className={`nav-item dropdown ${allowancesOpen ? 'open' : ''}`} onClick={toggleAllowances}>
          <div className="nav-link">
            <Receipt size={20} />
            <span>Allowances</span>
            <ChevronDown className="dropdown-icon" size={16} />
          </div>
          <div className="dropdown-menu">
            <NavLink to="/allowance-types" className={({ isActive }) => isActive ? 'active' : ''}>
              <span>Allowance Types</span>
            </NavLink>
            <NavLink to="/allowances" className={({ isActive }) => isActive ? 'active' : ''}>
              <span>Allowances</span>
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;