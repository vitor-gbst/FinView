import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { authService } from '../services/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [isOpen, setIsOpen] = useState(false); 

  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false); 
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      
      
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair", error);
      navigate('/login');
    }
  };

  return (
    <>
      
      <button 
        className="mobile-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'} 
      </button>

      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        
        <div className="logo" onClick={() => handleNavigate('/dashboard')} style={{cursor: 'pointer'}}>
          FINANÇAS <span>PRO</span>
        </div>

        <nav className="menu-nav">
          <MenuItem 
            active={isActive('/dashboard')} 
            onClick={() => handleNavigate('/dashboard')}
            icon="📊" 
          >
            Dashboard
          </MenuItem>

        </nav>

        <div className="menu-footer">
          <div className="menu-item logout-btn" onClick={handleLogout}>
            <span style={{ marginRight: '10px' }}></span>
            Sair
          </div>
        </div>
      </div>
    </>
  );
};

const MenuItem = ({ children, active, onClick, icon }) => (
  <div 
    className={`menu-item ${active ? 'active' : ''}`} 
    onClick={onClick}
  >
    {icon && <span style={{ width: '24px', textAlign: 'center' }}>{icon}</span>}
    {children}
  </div>
);

export default Sidebar;