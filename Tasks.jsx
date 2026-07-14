import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../../components/Modal';

export default function Tasks({ selectedTaskId, setSelectedTaskId, taskDetailOpen, setTaskDetailOpen }) {
  const {
    tasks,
    projects,
    companies,
    employees,
    partners,
    activities,
    addTask,
    updateTask,
    deleteTask,
    addTaskComment,
    addTaskAttachment,
    checkPermission,
    currentUser,
    currentRole
  } = useContext(AppContext);

  // Read permission check
  if (!checkPermission('read', 'Tasks')) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: 'red' }}>Access Denied</h3>
        <p>Your current role does not have permission to view the Task tracker.</p>
      </div>
    );
  }

  const canModifyCore = checkPermission('write', 'Tasks'); // Admin/Manager can write tasks

  // Search, Filter, Sort, Pagination states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [viewType, setViewType] = useState('list'); // 'list' or 'kanban'
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assigneeCombinedId: '', // Format: 'type_id' (e.g. 'Employee_e1' or 'Partner_pt1')
    status: 'Pending',
    priority: 'Medium',
    dueDate: ''
  });
  const [errors, setErrors] = useState({});

  // Delete Confirmation state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Simulated File Upload state
  const [simulatedFileName, setSimulatedFileName] = useState('');

  // Comment state
  const [newCommentText, setNewCommentText] = useState('');

  // Helpers
  const getProjectName = (projectId) => {
    return projects.find((p) => p.id === projectId)?.name || 'Unknown Project';
  };

  const getCompanyName = (companyId) => {
    return companies.find((c) => c.id === companyId)?.name || 'Unknown Company';
  };

  const getAssigneeName = (assigneeId, type) => {
    if (type === 'Employee') {
      return employees.find((e) => e.id === assigneeId)?.name || 'Unknown Employee';
    } else if (type === 'Partner') {
      return partners.find((p) => p.id === assigneeId)?.name || 'Unknown Partner';
    }
    return 'Unassigned';
  };

  // Check if a task is assigned to current user
  const isAssignedToCurrentUser = (task) => {
    if (!currentUser) return false;
    
    // Find employee or partner ID corresponding to current logged in user email
    let matchingUserId = null;
    let matchingUserType = null;
    
    const emp = employees.find(e => e.email.toLowerCase() === currentUser.email.toLowerCase());
    if (emp) {
      matchingUserId = emp.id;
      matchingUserType = 'Employee';
    } else {
      const part = partners.find(p => p.email.toLowerCase() === currentUser.email.toLowerCase());
      if (part) {
        matchingUserId = part.id;
        matchingUserType = 'Partner';
      }
    }
    
    // Fallback: check matching name or email
    return task.assigneeId === matchingUserId && task.assigneeType === matchingUserType;
  };

  // Determine if current role can update this specific task's status
  const canUpdateStatus = (task) => {
    if (currentRole === 'Admin' || currentRole === 'Manager') return true;
    // Employee & Partner can only update status if the task is assigned to them
    return isAssignedToCurrentUser(task);
  };

  // Handlers
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleOpenForm = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        assigneeCombinedId: `${task.assigneeType}_${task.assigneeId}`,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        projectId: projects[0]?.id || '',
        assigneeCombinedId: employees[0] ? `Employee_${employees[0].id}` : '',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Task Title is required.';
    if (!formData.description.trim()) newErrors.description = 'Task Description is required.';
    if (!formData.projectId) newErrors.projectId = 'Project linkage is required.';
    if (!formData.assigneeCombinedId) newErrors.assigneeCombinedId = 'Assignee selection is required.';
    if (!formData.dueDate) newErrors.dueDate = 'Due Date is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const [assigneeType, assigneeId] = formData.assigneeCombinedId.split('_');
    const selectedProject = projects.find(p => p.id === formData.projectId);
    const companyId = selectedProject ? selectedProject.companyId : '';

    const payload = {
      title: formData.title,
      description: formData.description,
      projectId: formData.projectId,
      companyId,
      assigneeId,
      assigneeType,
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate
    };

    if (editingTask) {
      // Keep comments and attachments
      updateTask(editingTask.id, {
        ...payload,
        attachments: editingTask.attachments,
        comments: editingTask.comments
      });
    } else {
      addTask(payload);
    }
    setIsFormOpen(false);
  };

  const handleOpenDelete = (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteTask(deletingId);
    setIsDeleteOpen(false);
    setDeletingId(null);
    if (selectedTaskId === deletingId) setTaskDetailOpen(false);
    
    // adjust page
    const updatedCount = filteredTasks.length - 1;
    const maxPage = Math.max(1, Math.ceil(updatedCount / itemsPerPage));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addTaskComment(selectedTaskId, newCommentText);
    setNewCommentText('');
  };

  const handleAttachmentSubmit = (e) => {
    e.preventDefault();
    if (!simulatedFileName.trim()) return;

    // Simulate file properties
    const ext = simulatedFileName.split('.').pop() || 'txt';
    const mockSize = `${(Math.random() * 5 + 0.1).toFixed(1)} MB`;
    const mockType = ext === 'png' || ext === 'jpg' ? 'image/' + ext : 'application/' + ext;

    addTaskAttachment(selectedTaskId, simulatedFileName, mockSize, mockType);
    setSimulatedFileName('');
  };

  const handleStatusUpdateDetail = (e) => {
    const nextStatus = e.target.value;
    const taskObj = tasks.find((t) => t.id === selectedTaskId);
    if (taskObj) {
      updateTask(selectedTaskId, { ...taskObj, status: nextStatus });
    }
  };

  // Filter Tasks list
  const filteredTasks = tasks.filter((t) => {
    const matchText = search.toLowerCase();
    const projName = getProjectName(t.projectId).toLowerCase();
    const compName = getCompanyName(t.companyId).toLowerCase();
    const assigneeName = getAssigneeName(t.assigneeId, t.assigneeType).toLowerCase();

    const matchesSearch =
      t.title.toLowerCase().includes(matchText) ||
      t.description.toLowerCase().includes(matchText) ||
      projName.includes(matchText) ||
      compName.includes(matchText) ||
      assigneeName.includes(matchText);

    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;
    const matchesProject = projectFilter ? t.projectId === projectFilter : true;
    const matchesCompany = companyFilter ? t.companyId === companyFilter : true;

    // Partners can only read tasks belonging to their company/assigned tasks
    if (currentRole === 'Partner') {
      const currentPartner = partners.find(p => p.email.toLowerCase() === currentUser.email.toLowerCase());
      if (currentPartner && t.companyId !== currentPartner.companyId && t.assigneeId !== currentPartner.id) {
        return false;
      }
    }

    // Employees can read all tasks, but let's double check general permissions
    return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesCompany;
  });

  // Sorted Tasks list
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let valA, valB;
    if (sortBy === 'title') {
      valA = a.title.toLowerCase();
      valB = b.title.toLowerCase();
    } else if (sortBy === 'dueDate') {
      valA = a.dueDate;
      valB = b.dueDate;
    } else if (sortBy === 'priority') {
      const weight = { 'High': 3, 'Medium': 2, 'Low': 1 };
      valA = weight[a.priority] || 0;
      valB = weight[b.priority] || 0;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Slice
  const totalItems = sortedTasks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = sortedTasks.slice(startIndex, startIndex + itemsPerPage);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const taskActivities = activities.filter((act) => act.taskId === selectedTaskId);

  return (
    <div>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Collaborate on tasks, adjust timelines, and add files.</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* View toggle */}
          <div className="view-toggle-btn">
            <button
              className={`btn btn-xs ${viewType === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewType('list')}
            >
              List View
            </button>
            <button
              className={`btn btn-xs ${viewType === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewType('kanban')}
            >
              Kanban Board
            </button>
          </div>

          {canModifyCore && (
            <button className="btn btn-primary" onClick={() => handleOpenForm()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search tasks by title, description, assignee..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="form-control filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>

        <select
          className="form-control filter-select"
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          className="form-control filter-select"
          value={projectFilter}
          onChange={(e) => {
            setProjectFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          className="form-control filter-select"
          value={companyFilter}
          onChange={(e) => {
            setCompanyFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Render selected View Type */}
      {viewType === 'list' ? (
        /* List View rendering */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {totalItems === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tasks found matching criteria.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th className="sortable-header" onClick={() => handleSort('title')}>
                        Task Title {sortBy === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th>Project</th>
                      <th>Assignee</th>
                      <th className="sortable-header" onClick={() => handleSort('dueDate')}>
                        Due Date {sortBy === 'dueDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="sortable-header" onClick={() => handleSort('priority')}>
                        Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th>Status</th>
                      {canModifyCore && <th style={{ textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTasks.map((t) => (
                      <tr
                        key={t.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedTaskId(t.id);
                          setTaskDetailOpen(true);
                        }}
                      >
                        <td>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{t.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '300px' }}>
                            {t.description}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>{getProjectName(t.projectId)}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{getCompanyName(t.companyId)}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '500' }}>
                            {getAssigneeName(t.assigneeId, t.assigneeType)}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-light)', display: 'block' }}>
                            {t.assigneeType}
                          </span>
                        </td>
                        <td>{t.dueDate}</td>
                        <td>
                          <span className={`badge badge-${t.priority.toLowerCase()}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${t.status.toLowerCase().replace(' ', '')}`}>
                            {t.status}
                          </span>
                        </td>
                        {canModifyCore && (
                          <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button className="btn btn-secondary btn-xs" onClick={() => handleOpenForm(t)}>
                                Edit
                              </button>
                              <button className="btn btn-danger btn-xs" onClick={(e) => handleOpenDelete(e, t.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <span className="pagination-info">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
                </span>
                <div className="pagination-buttons">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Kanban Board rendering */
        <div className="kanban-board">
          {['Pending', 'In Progress', 'Completed', 'On Hold'].map((colStatus) => {
            const columnTasks = filteredTasks.filter((t) => t.status === colStatus);
            return (
              <div key={colStatus} className="kanban-column">
                <div className="kanban-column-title">
                  <span>{colStatus}</span>
                  <span className="kanban-column-count">{columnTasks.length}</span>
                </div>
                {columnTasks.map((t) => (
                  <div
                    key={t.id}
                    className="kanban-card"
                    onClick={() => {
                      setSelectedTaskId(t.id);
                      setTaskDetailOpen(true);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className={`badge badge-${t.priority.toLowerCase()}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                        {t.priority}
                      </span>
                      {canModifyCore && (
                        <button
                          className="btn btn-secondary btn-xs"
                          style={{ border: 'none', background: 'none', padding: '0 4px' }}
                          onClick={(e) => handleOpenDelete(e, t.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="kanban-card-title">{t.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      💼 {getProjectName(t.projectId)}
                    </div>
                    <div className="kanban-card-meta">
                      <span style={{ fontSize: '11px' }}>📅 {t.dueDate}</span>
                      <div className="kanban-card-assignee" title={`${t.assigneeType}: ${getAssigneeName(t.assigneeId, t.assigneeType)}`}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          fontSize: '9px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          {getAssigneeName(t.assigneeId, t.assigneeType)[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Task Create / Edit Dialog Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTask ? 'Modify Task Details' : 'Assign New Task'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingTask ? 'Save Changes' : 'Assign Task'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Develop Stripe Payment handlers"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Linked Project Link</label>
            <select
              className={`form-control ${errors.projectId ? 'is-invalid' : ''}`}
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            >
              <option value="">Select Project scope...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({getCompanyName(p.companyId)})
                </option>
              ))}
            </select>
            {errors.projectId && <div className="invalid-feedback">{errors.projectId}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Assignee</label>
            <select
              className={`form-control ${errors.assigneeCombinedId ? 'is-invalid' : ''}`}
              value={formData.assigneeCombinedId}
              onChange={(e) => setFormData({ ...formData, assigneeCombinedId: e.target.value })}
            >
              <option value="">Select Resource assignee...</option>
              <optgroup label="Employees">
                {employees.map((e) => (
                  <option key={e.id} value={`Employee_${e.id}`}>{e.name} ({e.role})</option>
                ))}
              </optgroup>
              <optgroup label="Partners">
                {partners.map((p) => (
                  <option key={p.id} value={`Partner_${p.id}`}>{p.name} ({getCompanyName(p.companyId)})</option>
                ))}
              </optgroup>
            </select>
            {errors.assigneeCombinedId && <div className="invalid-feedback">{errors.assigneeCombinedId}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-control"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            {errors.dueDate && <div className="invalid-feedback">{errors.dueDate}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Task Description</label>
            <textarea
              rows="4"
              className="form-control"
              placeholder="Provide explicit completion requirements and notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Task Detail Modal (Drawer) */}
      {selectedTask && (
        <Modal
          isOpen={taskDetailOpen}
          onClose={() => setTaskDetailOpen(false)}
          title={`Task details: ${selectedTask.id}`}
          size="lg"
          footer={
            <button className="btn btn-secondary" onClick={() => setTaskDetailOpen(false)}>Close Pane</button>
          }
        >
          <div className="grid-2">
            {/* Left Column: Title, Description, Comments, Attachments */}
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                  {selectedTask.title}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {selectedTask.description}
                </p>
              </div>

              {/* Attachments Section */}
              <div style={{ marginBottom: '24px' }}>
                <div className="section-title">📎 Attachments ({selectedTask.attachments?.length || 0})</div>
                
                {/* Upload simulated form */}
                {checkPermission('attach', 'Tasks') && (
                  <form onSubmit={handleAttachmentSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      placeholder="e.g. design_specification.pdf"
                      value={simulatedFileName}
                      onChange={(e) => setSimulatedFileName(e.target.value)}
                    />
                    <button type="submit" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                      Attach File
                    </button>
                  </form>
                )}

                {selectedTask.attachments?.length === 0 ? (
                  <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>No attachments uploaded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedTask.attachments?.map((att, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-main)',
                          fontSize: '13px'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{att.name}</span>
                          <span style={{ color: 'var(--text-light)', fontSize: '11px', marginLeft: '8px' }}>({att.size})</span>
                        </div>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); alert(`Simulated download of ${att.name}`); }}
                          style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div>
                <div className="section-title">💬 Conversation & Comments ({selectedTask.comments?.length || 0})</div>
                
                {/* Comment input form */}
                {checkPermission('comment', 'Tasks') && (
                  <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <textarea
                      rows="2"
                      className="form-control"
                      placeholder="Add an update or ask a question..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>
                      Submit Comment
                    </button>
                  </form>
                )}

                {selectedTask.comments?.length === 0 ? (
                  <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>No comments posted yet.</p>
                ) : (
                  <div className="comments-list">
                    {selectedTask.comments.map((cm) => (
                      <div key={cm.id} className="comment-item">
                        <div className="comment-header">
                          <span className="comment-author">{cm.author}</span>
                          <span className="comment-date">
                            {new Date(cm.date).toLocaleDateString()} at{' '}
                            {new Date(cm.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="comment-body">{cm.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Metadata Panel */}
            <div style={{ backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px', height: 'fit-content' }}>
              <div className="section-title" style={{ borderBottomColor: 'var(--border-color)', marginBottom: '8px' }}>Metadata Details</div>
              
              <ul className="meta-list">
                <li className="meta-item">
                  <span className="meta-label">Client Company</span>
                  <span className="meta-value">{getCompanyName(selectedTask.companyId)}</span>
                </li>
                <li className="meta-item">
                  <span className="meta-label">Linked Project</span>
                  <span className="meta-value">{getProjectName(selectedTask.projectId)}</span>
                </li>
                <li className="meta-item">
                  <span className="meta-label">Priority Tier</span>
                  <span className="meta-value">
                    <span className={`badge badge-${selectedTask.priority.toLowerCase()}`}>
                      {selectedTask.priority}
                    </span>
                  </span>
                </li>
                <li className="meta-item">
                  <span className="meta-label">Due Date</span>
                  <span className="meta-value" style={{
                    color: selectedTask.dueDate < '2026-07-14' && selectedTask.status !== 'Completed' ? 'red' : 'inherit',
                    fontWeight: selectedTask.dueDate < '2026-07-14' && selectedTask.status !== 'Completed' ? '700' : 'normal'
                  }}>
                    {selectedTask.dueDate}
                  </span>
                </li>
                <li className="meta-item" style={{ flexDirection: 'column', gap: '4px', alignItems: 'stretch' }}>
                  <span className="meta-label">Status Code</span>
                  {canUpdateStatus(selectedTask) ? (
                    <select
                      className="form-control"
                      style={{ fontSize: '13px', padding: '6px 8px', marginTop: '4px' }}
                      value={selectedTask.status}
                      onChange={handleStatusUpdateDetail}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  ) : (
                    <span className="meta-value" style={{ marginTop: '4px' }}>
                      <span className={`badge badge-${selectedTask.status.toLowerCase().replace(' ', '')}`}>
                        {selectedTask.status}
                      </span>
                    </span>
                  )}
                </li>
                <li className="meta-item">
                  <span className="meta-label">Resource Assignee</span>
                  <span className="meta-value" style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong>{getAssigneeName(selectedTask.assigneeId, selectedTask.assigneeType)}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>({selectedTask.assigneeType})</span>
                  </span>
                </li>
              </ul>

              {/* Task specific Activity Timeline */}
              {taskActivities.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <div className="section-title" style={{ borderBottomColor: 'var(--border-color)', marginBottom: '12px' }}>Audit Log History</div>
                  <div className="activity-feed" style={{ paddingLeft: '16px' }}>
                    {taskActivities.map((act) => (
                      <div key={act.id} className="activity-item" style={{ marginBottom: '12px' }}>
                        <div className="activity-dot" style={{ width: '8px', height: '8px', left: '-16px', top: '7px' }}></div>
                        <div className="activity-content">
                          <span className="activity-header" style={{ fontSize: '12px' }}>{act.text}</span>
                          <span className="activity-time" style={{ fontSize: '10px' }}>
                            {new Date(act.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Task Deletion"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
          Are you sure you want to delete this task? All comments, attachments, and activity history for this task will be permanently lost.
        </p>
      </Modal>
    </div>
  );
}
