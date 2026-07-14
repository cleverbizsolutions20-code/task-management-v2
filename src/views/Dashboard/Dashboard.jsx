import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

export default function Dashboard({ setActiveView, setSelectedTaskId, setTaskDetailOpen }) {
  const { tasks, projects, companies, activities } = useContext(AppContext);

  const todayStr = '2026-07-14'; // Set to current system mock date for consistency

  // Stats Calculations
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const overdueTasks = tasks.filter(t => t.dueDate < todayStr && t.status !== 'Completed').length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // High Priority Open Tasks
  const highPriorityTasks = tasks
    .filter(t => t.priority === 'High' && t.status !== 'Completed')
    .slice(0, 5);

  const getProjectName = (projectId) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const getCompanyName = (companyId) => {
    return companies.find(c => c.id === companyId)?.name || 'Unknown Company';
  };

  const formatActivityTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleTaskClick = (id) => {
    setSelectedTaskId(id);
    setTaskDetailOpen(true);
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '1px solid var(--primary-border)',
        padding: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h2 style={{ color: 'var(--primary-hover)', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
            Hello, Welcome Back! 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px' }}>
            Here is a summary of your workspace activities, overdue assignments, and task performance metrics.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveView('Tasks')}>
          View Active Tasks
        </button>
      </div>

      {/* Widgets Grid */}
      <div className="widgets-grid">
        {/* Total Tasks */}
        <div className="widget-card">
          <div className="widget-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="widget-data">
            <span className="widget-value">{totalTasks}</span>
            <span className="widget-label">Total Tasks</span>
          </div>
        </div>

        {/* Pending & In Progress */}
        <div className="widget-card">
          <div className="widget-icon" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="widget-data">
            <span className="widget-value">{pendingTasks}</span>
            <span className="widget-label">Active Tasks</span>
          </div>
        </div>

        {/* Completed */}
        <div className="widget-card">
          <div className="widget-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="widget-data">
            <span className="widget-value">{completedTasks}</span>
            <span className="widget-label">Completed Tasks</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="widget-card">
          <div className="widget-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div className="widget-data">
            <span className="widget-value" style={{ color: overdueTasks > 0 ? '#dc2626' : 'inherit' }}>
              {overdueTasks}
            </span>
            <span className="widget-label">Overdue Tasks</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout splits */}
      <div className="grid-2">
        {/* Left Column: High Priority Tasks */}
        <div className="card">
          <div className="card-title">
            <span>⚠️ Urgent Open Tasks</span>
            <button className="btn btn-secondary btn-xs" onClick={() => setActiveView('Tasks')}>View All</button>
          </div>
          {highPriorityTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No urgent high-priority tasks pending. Good job!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Project</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {highPriorityTasks.map((t) => (
                    <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => handleTaskClick(t.id)}>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{t.title}</td>
                      <td>
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{getProjectName(t.projectId)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{getCompanyName(t.companyId)}</div>
                      </td>
                      <td style={{ color: t.dueDate < todayStr ? 'red' : 'inherit', fontWeight: t.dueDate < todayStr ? '600' : 'normal' }}>
                        {t.dueDate} {t.dueDate < todayStr && '(Overdue)'}
                      </td>
                      <td>
                        <span className={`badge badge-${t.status.toLowerCase().replace(' ', '')}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Performance & Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Progress Card */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 className="card-title">Completion Rate</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '15px 0' }}>
              <div style={{
                position: 'relative',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: `conic-gradient(var(--primary) ${completionRate * 3.6}deg, var(--border-color) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '16px'
                }}>
                  {completionRate}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700' }}>Task Analytics</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {completedTasks} out of {totalTasks} tasks closed.
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed Card */}
          <div className="card" style={{ flex: 1, marginBottom: 0 }}>
            <h3 className="card-title">🚀 Workspace Activity Feed</h3>
            <div className="activity-feed">
              {activities.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                  No recent activities recorded.
                </div>
              ) : (
                activities.slice(0, 6).map((act) => (
                  <div key={act.id} className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <span className="activity-header">{act.text}</span>
                      <span className="activity-time">{formatActivityTime(act.date)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
