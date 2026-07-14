import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Header({ activeView, setMobileOpen }) {
  const { currentUser, currentRole, setCurrentRole } = useContext(AppContext);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleRoleChange = (e) => {
    setCurrentRole(e.target.value);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={() => setMobileOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="breadcrumbs">
          <span>{activeView}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Role Simulator Selector */}
        <div className="role-switcher-container">
          <span className="role-label">Simulated Role:</span>
          <select 
            className="role-select" 
            value={currentRole || ''} 
            onChange={handleRoleChange}
          >
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
            <option value="Partner">Partner</option>
          </select>
        </div>

        {currentUser && (
          <div className="user-profile">
            <div className="user-avatar">
              {getInitials(currentUser.name)}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role">{currentRole}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
