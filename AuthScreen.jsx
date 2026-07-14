import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

export default function AuthScreen() {
  const { login, register, forgotPassword } = useContext(AppContext);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot'

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');

  // Validation / Error states
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (authMode === 'register' && !name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (authMode !== 'forgot') {
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const res = login(email, password);
    if (!res.success) {
      setErrors({ auth: res.message });
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const res = register(name, email, password, role);
    if (!res.success) {
      setErrors({ auth: res.message });
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const res = forgotPassword(email);
    if (res.success) {
      setAuthMode('login');
      // Reset fields
      setEmail('');
    } else {
      setErrors({ auth: res.message });
    }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setErrors({});
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-container">
      {/* Marketing Side Panel */}
      <div className="auth-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>CleverTask</span>
        </div>

        <h1 className="auth-sidebar-title">Manage your tasks, projects & teams effortlessly.</h1>
        <p className="auth-sidebar-desc">
          Collaborate with managers, employees, and external partners in a clean, role-based ecosystem.
        </p>

        {/* Credentials hints card */}
        <div style={{
          marginTop: '60px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ fontWeight: '700', marginBottom: '10px', fontSize: '15px' }}>Demo Accounts (Password: password)</h4>
          <ul style={{ listStyle: 'none', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', opacity: 0.9 }}>
            <li>👨‍💼 <strong>Admin:</strong> admin@saas.com</li>
            <li>👥 <strong>Employee:</strong> employee@saas.com</li>
            <li>🤝 <strong>Partner:</strong> partner@saas.com</li>
          </ul>
        </div>
      </div>

      {/* Forms Action Panel */}
      <div className="auth-panel">
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="auth-header">
              <h2 className="auth-title">Welcome back</h2>
              <p className="auth-subtitle">
                Don't have an account? <span className="auth-link" onClick={() => switchMode('register')}>Sign Up</span>
              </p>
            </div>

            {errors.auth && (
              <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontWeight: '500' }}>
                {errors.auth}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="text"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <span className="auth-link" style={{ fontSize: '13px' }} onClick={() => switchMode('forgot')}>Forgot Password?</span>
              </div>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Sign In
            </button>
          </form>
        )}

        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="auth-header">
              <h2 className="auth-title">Create an account</h2>
              <p className="auth-subtitle">
                Already have an account? <span className="auth-link" onClick={() => switchMode('login')}>Sign In</span>
              </p>
            </div>

            {errors.auth && (
              <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontWeight: '500' }}>
                {errors.auth}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="text"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Select Your Role</label>
              <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
                <option value="Partner">Partner</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Create Account
            </button>
          </form>
        )}

        {authMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit}>
            <div className="auth-header">
              <h2 className="auth-title">Forgot password?</h2>
              <p className="auth-subtitle">
                Remember your password? <span className="auth-link" onClick={() => switchMode('login')}>Sign In</span>
              </p>
            </div>

            {errors.auth && (
              <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontWeight: '500' }}>
                {errors.auth}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label">Email Address</label>
              <input
                type="text"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Send Recovery Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
