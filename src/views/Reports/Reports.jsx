import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';

export default function Reports({ setSelectedTaskId, setTaskDetailOpen }) {
  const { tasks, employees, partners, companies, checkPermission } = useContext(AppContext);

  // Check read permission
  if (!checkPermission('read', 'Reports')) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: 'red' }}>Access Denied</h3>
        <p>Your current role does not have permission to view workspace Reports.</p>
      </div>
    );
  }

  const todayStr = '2026-07-14'; // Mock today date for consistency

  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'pending', 'completed', 'overdue', 'employee', 'company'

  // Calculations
  const pendingList = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress');
  const completedList = tasks.filter(t => t.status === 'Completed');
  const overdueList = tasks.filter(t => t.dueDate < todayStr && t.status !== 'Completed');

  const getCompanyName = (companyId) => {
    return companies.find(c => c.id === companyId)?.name || 'Unknown Company';
  };

  const getAssigneeName = (assigneeId, type) => {
    if (type === 'Employee') {
      return employees.find(e => e.id === assigneeId)?.name || 'Unknown Employee';
    } else if (type === 'Partner') {
      return partners.find(p => p.id === assigneeId)?.name || 'Unknown Partner';
    }
    return 'Unassigned';
  };

  const handleTaskClick = (id) => {
    setSelectedTaskId(id);
    setTaskDetailOpen(true);
  };

  const handleExportSimulated = () => {
    alert('Simulated: Report successfully exported to CSV format. Your download will begin shortly.');
  };

  // Compile employee-wise summary
  const employeeReportData = employees.map(emp => {
    const empTasks = tasks.filter(t => t.assigneeId === emp.id && t.assigneeType === 'Employee');
    const total = empTasks.length;
    const completed = empTasks.filter(t => t.status === 'Completed').length;
    const pending = empTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    const overdue = empTasks.filter(t => t.dueDate < todayStr && t.status !== 'Completed').length;
    return { name: emp.name, department: emp.department, total, completed, pending, overdue };
  });

  // Compile company-wise summary
  const companyReportData = companies.map(comp => {
    const compTasks = tasks.filter(t => t.companyId === comp.id);
    const total = compTasks.length;
    const completed = compTasks.filter(t => t.status === 'Completed').length;
    const pending = compTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    const overdue = compTasks.filter(t => t.dueDate < todayStr && t.status !== 'Completed').length;
    return { name: comp.name, total, completed, pending, overdue };
  });

  return (
    <div>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Generate analytical summaries, active lists, and resource utilization worksheets.</p>
        <button className="btn btn-secondary" onClick={handleExportSimulated} style={{ gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export Report (CSV)
        </button>
      </div>

      {/* Tabs list navigation */}
      <div className="filter-bar" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button className={`btn btn-xs ${activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('summary')}>
          Overview Dashboard
        </button>
        <button className={`btn btn-xs ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('pending')}>
          Pending Tasks ({pendingList.length})
        </button>
        <button className={`btn btn-xs ${activeTab === 'completed' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('completed')}>
          Completed Tasks ({completedList.length})
        </button>
        <button className={`btn btn-xs ${activeTab === 'overdue' ? 'btn-primary' : 'btn-secondary'}`} style={{ color: overdueList.length > 0 && activeTab !== 'overdue' ? 'red' : 'inherit' }} onClick={() => setActiveTab('overdue')}>
          Overdue Tasks ({overdueList.length})
        </button>
        <button className={`btn btn-xs ${activeTab === 'employee' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('employee')}>
          Employee-wise Report
        </button>
        <button className={`btn btn-xs ${activeTab === 'company' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('company')}>
          Company-wise Report
        </button>
      </div>

      {/* Report Container */}
      <div style={{ marginTop: '20px' }}>
        
        {/* SUMMARY DASHBOARD VIEW */}
        {activeTab === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="widgets-grid" style={{ marginBottom: 0 }}>
              <div className="widget-card">
                <div className="widget-data">
                  <span className="widget-value">{pendingList.length}</span>
                  <span className="widget-label">Pending / In Progress</span>
                </div>
              </div>
              <div className="widget-card">
                <div className="widget-data">
                  <span className="widget-value">{completedList.length}</span>
                  <span className="widget-label">Completed Tasks</span>
                </div>
              </div>
              <div className="widget-card">
                <div className="widget-data">
                  <span className="widget-value" style={{ color: overdueList.length > 0 ? 'red' : 'inherit' }}>{overdueList.length}</span>
                  <span className="widget-label">Overdue Tasks</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">General Workspace Summary</h3>
              <p style={{ lineHeight: 1.6, color: 'var(--text-muted)' }}>
                This workspace is currently tracking <strong>{tasks.length} tasks</strong> across <strong>{companies.length} companies</strong>.
                There are <strong>{employees.length} employees</strong> and <strong>{partners.length} partners</strong> assigned as resources. 
                <br/><br/>
                Currently, <strong>{completedList.length} tasks</strong> are fully resolved, representing a completion quotient of <strong>{tasks.length ? Math.round((completedList.length / tasks.length) * 100) : 0}%</strong>.
                There are <strong>{overdueList.length} tasks</strong> that have slipped past their target due date.
              </p>
            </div>
          </div>
        )}

        {/* PENDING TASKS LIST VIEW */}
        {activeTab === 'pending' && (
          <div className="card" style={{ padding: 0 }}>
            {pendingList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No pending tasks in queue.</div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Company</th>
                      <th>Assignee</th>
                      <th>Due Date</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingList.map(t => (
                      <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => handleTaskClick(t.id)}>
                        <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{t.title}</td>
                        <td>{getCompanyName(t.companyId)}</td>
                        <td>{getAssigneeName(t.assigneeId, t.assigneeType)}</td>
                        <td style={{ color: t.dueDate < todayStr ? 'red' : 'inherit', fontWeight: t.dueDate < todayStr ? '700' : 'normal' }}>
                          {t.dueDate} {t.dueDate < todayStr && '(Overdue)'}
                        </td>
                        <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* COMPLETED TASKS LIST VIEW */}
        {activeTab === 'completed' && (
          <div className="card" style={{ padding: 0 }}>
            {completedList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No completed tasks recorded.</div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Company</th>
                      <th>Assignee</th>
                      <th>Due Date</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedList.map(t => (
                      <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => handleTaskClick(t.id)}>
                        <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{t.title}</td>
                        <td>{getCompanyName(t.companyId)}</td>
                        <td>{getAssigneeName(t.assigneeId, t.assigneeType)}</td>
                        <td>{t.dueDate}</td>
                        <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* OVERDUE TASKS LIST VIEW */}
        {activeTab === 'overdue' && (
          <div className="card" style={{ padding: 0 }}>
            {overdueList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Excellent! No overdue tasks in this workspace.</div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ color: 'red' }}>Task Title (Overdue)</th>
                      <th>Company</th>
                      <th>Assignee</th>
                      <th style={{ color: 'red' }}>Due Date</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueList.map(t => (
                      <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => handleTaskClick(t.id)}>
                        <td style={{ fontWeight: '600', color: 'red' }}>{t.title}</td>
                        <td>{getCompanyName(t.companyId)}</td>
                        <td>{getAssigneeName(t.assigneeId, t.assigneeType)}</td>
                        <td style={{ color: 'red', fontWeight: '700' }}>{t.dueDate}</td>
                        <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* EMPLOYEE-WISE STATS VIEW */}
        {activeTab === 'employee' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Total Assigned</th>
                    <th>Completed</th>
                    <th>Active (Pending)</th>
                    <th style={{ color: 'red' }}>Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeReportData.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{row.name}</td>
                      <td>{row.department}</td>
                      <td style={{ fontWeight: '700' }}>{row.total}</td>
                      <td style={{ color: 'green', fontWeight: '700' }}>{row.completed}</td>
                      <td style={{ color: '#ea580c', fontWeight: '700' }}>{row.pending}</td>
                      <td style={{ color: row.overdue > 0 ? 'red' : 'inherit', fontWeight: '700' }}>{row.overdue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COMPANY-WISE STATS VIEW */}
        {activeTab === 'company' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Total Scope Tasks</th>
                    <th>Completed</th>
                    <th>Active (Pending)</th>
                    <th style={{ color: 'red' }}>Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {companyReportData.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{row.name}</td>
                      <td style={{ fontWeight: '700' }}>{row.total}</td>
                      <td style={{ color: 'green', fontWeight: '700' }}>{row.completed}</td>
                      <td style={{ color: '#ea580c', fontWeight: '700' }}>{row.pending}</td>
                      <td style={{ color: row.overdue > 0 ? 'red' : 'inherit', fontWeight: '700' }}>{row.overdue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
