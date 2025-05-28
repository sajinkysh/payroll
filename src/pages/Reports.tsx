import React, { useState } from 'react';
import { FileDown, Filter } from 'lucide-react';
import { usePayroll } from '../context/PayrollContext';
import './Reports.css';

const Reports: React.FC = () => {
  const { employees, payslips, allowances } = usePayroll();
  
  const [reportType, setReportType] = useState('payroll');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  
  // Get unique departments from employees
  const departments = [...new Set(employees.map(emp => emp.department))];
  
  // Filter payslips based on selected month
  const filteredPayslips = filterMonth 
    ? payslips.filter(p => p.period.startsWith(filterMonth))
    : payslips;
  
  // Filter employees based on selected department
  const filteredEmployees = filterDepartment
    ? employees.filter(e => e.department === filterDepartment)
    : employees;
  
  // Calculate department totals for the payroll summary report
  const departmentTotals = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept);
    const deptEmployeeIds = deptEmployees.map(e => e.id);
    
    const deptPayslips = filteredPayslips.filter(p => deptEmployeeIds.includes(p.employeeId));
    
    const totalGross = deptPayslips.reduce((sum, p) => sum + p.grossSalary, 0);
    const totalNet = deptPayslips.reduce((sum, p) => sum + p.netSalary, 0);
    const totalDeductions = deptPayslips.reduce((sum, p) => sum + p.totalDeductions, 0);
    
    return {
      department: dept,
      employeeCount: deptEmployees.length,
      totalGross,
      totalDeductions,
      totalNet
    };
  });
  
  const grandTotal = {
    employeeCount: employees.length,
    totalGross: filteredPayslips.reduce((sum, p) => sum + p.grossSalary, 0),
    totalDeductions: filteredPayslips.reduce((sum, p) => sum + p.totalDeductions, 0),
    totalNet: filteredPayslips.reduce((sum, p) => sum + p.netSalary, 0)
  };
  
  return (
    <div>
      <h1 className="page-title">Reports</h1>
      
      <div className="report-controls">
        <div className="report-type-selector">
          <label>Report Type:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="payroll">Payroll Summary</option>
            <option value="employee">Employee Report</option>
            <option value="allowance">Allowance Report</option>
          </select>
        </div>
        
        <div className="report-filters">
          <div className="filter">
            <label>Month:</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />
          </div>
          
          {reportType === 'employee' && (
            <div className="filter">
              <label>Department:</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <button className="btn btn-primary">
          <FileDown size={18} />
          Export Report
        </button>
      </div>
      
      {reportType === 'payroll' && (
        <div className="report-content">
          <h2>Payroll Summary Report {filterMonth && `(${filterMonth})`}</h2>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employees</th>
                  <th>Gross Salary</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                </tr>
              </thead>
              <tbody>
                {departmentTotals.map((dept, index) => (
                  <tr key={index}>
                    <td>{dept.department}</td>
                    <td>{dept.employeeCount}</td>
                    <td>${dept.totalGross.toFixed(2)}</td>
                    <td>${dept.totalDeductions.toFixed(2)}</td>
                    <td>${dept.totalNet.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Grand Total</strong></td>
                  <td><strong>{grandTotal.employeeCount}</strong></td>
                  <td><strong>${grandTotal.totalGross.toFixed(2)}</strong></td>
                  <td><strong>${grandTotal.totalDeductions.toFixed(2)}</strong></td>
                  <td><strong>${grandTotal.totalNet.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="report-summary">
            <div className="summary-item">
              <h3>Total Employees</h3>
              <p>{grandTotal.employeeCount}</p>
            </div>
            <div className="summary-item">
              <h3>Total Gross Salary</h3>
              <p>${grandTotal.totalGross.toFixed(2)}</p>
            </div>
            <div className="summary-item">
              <h3>Total Deductions</h3>
              <p>${grandTotal.totalDeductions.toFixed(2)}</p>
            </div>
            <div className="summary-item">
              <h3>Total Net Salary</h3>
              <p>${grandTotal.totalNet.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
      
      {reportType === 'employee' && (
        <div className="report-content">
          <h2>Employee Report {filterDepartment && `(${filterDepartment})`}</h2>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Date Hired</th>
                  <th>Salary</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{employee.firstName} {employee.lastName}</td>
                    <td>{employee.position}</td>
                    <td>{employee.department}</td>
                    <td>{employee.dateHired}</td>
                    <td>${employee.salary.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="report-summary">
            <div className="summary-item">
              <h3>Total Employees</h3>
              <p>{filteredEmployees.length}</p>
            </div>
            <div className="summary-item">
              <h3>Average Salary</h3>
              <p>
                ${filteredEmployees.length > 0 
                  ? (filteredEmployees.reduce((sum, e) => sum + e.salary, 0) / filteredEmployees.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
          </div>
        </div>
      )}
      
      {reportType === 'allowance' && (
        <div className="report-content">
          <h2>Allowance Report</h2>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Allowance Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {allowances.map((allowance) => {
                  const employee = employees.find(e => e.id === allowance.employeeId);
                  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
                  
                  return (
                    <tr key={allowance.id}>
                      <td>{employeeName}</td>
                      <td>{allowance.allowanceTypeName}</td>
                      <td>
                        {allowance.isPercentage 
                          ? `${allowance.amount}%` 
                          : `$${allowance.amount.toFixed(2)}`
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="report-summary">
            <div className="summary-item">
              <h3>Total Allowances</h3>
              <p>{allowances.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;