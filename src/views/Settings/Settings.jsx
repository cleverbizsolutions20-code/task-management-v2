import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';

export default function Settings() {
  const { currentUser, currentRole, checkPermission, addToast } = useContext(AppContext);

  // Check read permission
  if (!checkPermission('read', 'Settings')) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: 'red' }}>Access Denied</h3>
        <p>Your current role does not have permission to view Settings.</p>
      </div>
    );
  }

  // Profile Form state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('password'); // Hidden default password
  const [errors, setErrors] = useState({});

  // Simulated App settings state
  const [companyName, setCompanyName] = useState('CleverTask Inc.');
  const [timeZone, setTimeZone] = useState('GMT+5:30 (IST)');

  const handleProfileSave = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!profileName.trim()) newErrors.name = 'Name is required.';
    if (!profileEmail.trim()) newErrors.email = 'Email address is required.';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    // Simulate updating context (to keep it simple we trigger a success toast)
    addToast('Profile configuration updated successfully.', 'success');
  };

  const handleAppSave = (e) => {
    e.preventDefault();
    addToast('Application configuration saved.', 'success');
  };

  return (
    <div className="grid-2">
      {/* Left Column: Profile and System configuration */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title">👤 User Profile Details</h3>
          <form onSubmit={handleProfileSave} style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="text"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Security Password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-sm">
              Save Changes
            </button>
          </form>
        </div>

        {/* Global SaaS App settings */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 className="card-title">⚙️ Workspace Settings</h3>
          <form onSubmit={handleAppSave} style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Tenant Name</label>
              <input
                type="text"
                className="form-control"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">System Timezone</label>
              <select className="form-control" value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
                <option value="GMT-5:00 (EST)">GMT-5:00 (EST)</option>
                <option value="GMT+0:00 (UTC)">GMT+0:00 (UTC)</option>
                <option value="GMT+1:00 (BST)">GMT+1:00 (BST)</option>
                <option value="GMT+5:30 (IST)">GMT+5:30 (IST)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-sm">
              Save Workspace
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Roles & Access explanation Card */}
      <div className="card" style={{ backgroundColor: 'var(--border-light)', height: 'fit-content' }}>
        <h3 className="card-title">🔑 SaaS Role Permissions matrix</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
          Your current simulated security context is <strong>{currentRole}</strong>. 
          To test how other user roles interact with this workspace, use the selector dropdown in the top header.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
          {/* Admin */}
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ color: 'var(--text-main)' }}>👨‍💼 Admin User</strong>
              <span className="badge badge-high" style={{ fontSize: '9px', padding: '2px 6px' }}>Full Root</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Full read/write permissions to create, edit, and delete companies, projects, tasks, comments, files, and users.
            </span>
          </div>

          {/* Manager */}
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ color: 'var(--text-main)' }}>👥 Manager Role</strong>
              <span className="badge badge-medium" style={{ fontSize: '9px', padding: '2px 6px' }}>Edit Specs</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Full CRUD privileges for Projects and Tasks. Read-only permissions for Companies, Partners, and Employees.
            </span>
          </div>

          {/* Employee */}
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ color: 'var(--text-main)' }}>💻 Employee Role</strong>
              <span className="badge badge-completed" style={{ fontSize: '9px', padding: '2px 6px' }}>Collab</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Read-only view access across the workspace. Can update status, write comment threads, and attach files ONLY on tasks explicitly assigned to them.
            </span>
          </div>

          {/* Partner */}
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ color: 'var(--text-main)' }}>🤝 Partner Role</strong>
              <span className="badge badge-onhold" style={{ fontSize: '9px', padding: '2px 6px' }}>External</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Restricted external access. Can only view projects and tasks associated with their client account. Can write comments and modify statuses on their tasks. Hides contacts, companies, settings, and reports.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
