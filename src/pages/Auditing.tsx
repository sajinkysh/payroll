import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { usePayroll } from '../context/PayrollContext';
import './Auditing.css';

const Auditing: React.FC = () => {
  const { auditLogs } = usePayroll();
  
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  
  // Filter audit logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesAction = actionFilter === '' || log.action === actionFilter;
    const matchesDate = dateFilter === '' || log.timestamp.startsWith(dateFilter);
    const matchesUser = userFilter === '' || log.performedBy.toLowerCase().includes(userFilter.toLowerCase());
    
    return matchesAction && matchesDate && matchesUser;
  });
  
  // Get unique actions for filter
  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];
  
  return (
    <div>
      <h1 className="page-title">Audit Log</h1>
      
      <div className="audit-filters">
        <div className="filter">
          <label>Action:</label>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="">All Actions</option>
            {uniqueActions.map((action, index) => (
              <option key={index} value={action}>{action}</option>
            ))}
          </select>
        </div>
        
        <div className="filter">
          <label>Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        
        <div className="filter">
          <label>User:</label>
          <input
            type="text"
            value={userFilter}
            placeholder="Search by user"
            onChange={(e) => setUserFilter(e.target.value)}
          />
        </div>
        
        <button className="btn" onClick={() => {
          setActionFilter('');
          setDateFilter('');
          setUserFilter('');
        }}>
          Clear Filters
        </button>
      </div>
      
      <div className="audit-log">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const date = new Date(log.timestamp);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString();
            
            return (
              <div key={log.id} className="audit-entry">
                <div className="audit-timestamp">
                  <div className="audit-date">{formattedDate}</div>
                  <div className="audit-time">{formattedTime}</div>
                </div>
                <div className={`audit-action audit-action-${log.action.toLowerCase()}`}>
                  {log.action}
                </div>
                <div className="audit-details">
                  <p>{log.details}</p>
                  <div className="audit-user">By: {log.performedBy}</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-logs">
            <p>No audit logs matching the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auditing;