import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payslips from './pages/Payslips';
import Reports from './pages/Reports';
import Auditing from './pages/Auditing';
import AllowanceTypes from './pages/AllowanceTypes';
import Allowances from './pages/Allowances';
import { PayrollProvider } from './context/PayrollContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <PayrollProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="payslips" element={<Payslips />} />
              <Route path="reports" element={<Reports />} />
              <Route path="auditing" element={<Auditing />} />
              <Route path="allowance-types" element={<AllowanceTypes />} />
              <Route path="allowances" element={<Allowances />} />
            </Route>
          </Routes>
        </Router>
      </PayrollProvider>
    </AuthProvider>
  );
}

export default App;