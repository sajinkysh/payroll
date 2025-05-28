import React from 'react';
import { Users, DollarSign, FileText, Clock } from 'lucide-react';
import { usePayroll } from '../context/PayrollContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { employees, payslips, allowanceTypes, formatCurrency } = usePayroll();
  
  // Calculate statistics
  const totalEmployees = employees.length;
  const totalPayslips = payslips.length;
  const pendingPayslips = payslips.filter(p => p.status === 'draft').length;
  const totalAllowanceTypes = allowanceTypes.length;
  
  // Get the current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <h2 className="dashboard-subtitle">Seraph World Pre-School</h2>
      <p className="dashboard-period">{currentMonth} {currentYear}</p>
      
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon employee-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Employees</h3>
            <p className="stat-value">{totalEmployees}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon payslip-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Payslips</h3>
            <p className="stat-value">{totalPayslips}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Pending Payslips</h3>
            <p className="stat-value">{pendingPayslips}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon allowance-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Allowance Types</h3>
            <p className="stat-value">{totalAllowanceTypes}</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-panels">
        <div className="dashboard-panel">
          <h3>Recent Payslips</h3>
          {payslips.length > 0 ? (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payslips.slice(0, 5).map(payslip => (
                  <tr key={payslip.id}>
                    <td>{payslip.employeeName}</td>
                    <td>{payslip.period}</td>
                    <td>{formatCurrency(payslip.netSalary)}</td>
                    <td>
                      <span className={`status status-${payslip.status}`}>
                        {payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No payslips available yet</p>
          )}
        </div>
        
        <div className="dashboard-panel">
          <h3>Recent Employees</h3>
          {employees.length > 0 ? (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 5).map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.firstName} {employee.lastName}</td>
                    <td>{employee.position}</td>
                    <td>{employee.department}</td>
                    <td>{formatCurrency(employee.salary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No employees available yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;