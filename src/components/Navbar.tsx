import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <button className="menu-toggle" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>
      <div className="navbar-right">
        <div className="user-info">
          <User size={20} />
          <span>{user?.username}</span>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;