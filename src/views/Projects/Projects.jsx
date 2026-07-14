import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../../components/Modal';

export default function Projects() {
  const { 
    projects, 
    companies, 
    tasks, 
    addProject, 
    updateProject, 
    deleteProject, 
    checkPermission 
  } = useContext(AppContext);

  // Check read permission
  if (!checkPermission('read', 'Projects')) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: 'red' }}>Access Denied</h3>
        <p>Your current role does not have permission to view the Projects dashboard.</p>
      </div>
    );
  }

  const canModify = checkPermission('write', 'Projects');

  // Search, Filter, Sort, Pagination states
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // null means adding
  const [formData, setFormData] = useState({ name: '', companyId: '', description: '' });
  const [errors, setErrors] = useState({});

  // Delete Confirmation state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Helper selectors
  const getCompanyName = (companyId) => {
    return companies.find((c) => c.id === companyId)?.name || 'Unknown Company';
  };

  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === 'Completed').length;
    const rate = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
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

  const handleOpenForm = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        companyId: project.companyId,
        description: project.description || ''
      });
    } else {
      setEditingProject(null);
      setFormData({ name: '', companyId: companies[0]?.id || '', description: '' });
    }
    setErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Project Name is required.';
    if (!formData.companyId) newErrors.companyId = 'Please select a company.';
    if (!formData.description.trim()) newErrors.description = 'Please write a brief description.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      addProject(formData);
    }
    setIsFormOpen(false);
  };

  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteProject(deletingId);
    setIsDeleteOpen(false);
    setDeletingId(null);
    // Adjust page pagination
    const updatedCount = filteredProjects.length - 1;
    const maxPage = Math.max(1, Math.ceil(updatedCount / itemsPerPage));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  };

  // Filtered & Sorted Projects list
  const filteredProjects = projects
    .filter((p) => {
      const matchText = search.toLowerCase();
      const compName = getCompanyName(p.companyId).toLowerCase();
      
      const matchesSearch = 
        p.name.toLowerCase().includes(matchText) ||
        compName.includes(matchText) ||
        (p.description && p.description.toLowerCase().includes(matchText));
      
      const matchesCompany = companyFilter ? p.companyId === companyFilter : true;

      return matchesSearch && matchesCompany;
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'company') {
        valA = getCompanyName(a.companyId).toLowerCase();
        valB = getCompanyName(b.companyId).toLowerCase();
      } else if (sortBy === 'progress') {
        valA = getProjectStats(a.id).rate;
        valB = getProjectStats(b.id).rate;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination Slice
  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Track project tasks progress, client assignments, and scopes.</p>
        {canModify && (
          <button className="btn btn-primary" onClick={() => handleOpenForm()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Project
          </button>
        )}
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
            placeholder="Search projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

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

        {/* Sorting buttons wrapper */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button className={`btn btn-sm ${sortBy === 'name' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleSort('name')}>
            Sort by Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
          </button>
          <button className={`btn btn-sm ${sortBy === 'company' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleSort('company')}>
            Sort by Company {sortBy === 'company' && (sortOrder === 'asc' ? '▲' : '▼')}
          </button>
          <button className={`btn btn-sm ${sortBy === 'progress' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleSort('progress')}>
            Sort by Progress {sortBy === 'progress' && (sortOrder === 'asc' ? '▲' : '▼')}
          </button>
        </div>
      </div>

      {/* Projects Cards Grid */}
      {totalItems === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No projects found matching search or filter constraints.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {paginatedProjects.map((p) => {
              const { total, completed, rate } = getProjectStats(p.id);
              return (
                <div key={p.id} className="card card-hoverable" style={{ display: 'flex', flexDirection: 'column', height: '100%', marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="badge badge-pending" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                      {getCompanyName(p.companyId)}
                    </span>
                    {canModify && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-secondary btn-xs" onClick={() => handleOpenForm(p)}>Edit</button>
                        <button className="btn btn-danger btn-xs" onClick={() => handleOpenDelete(p.id)}>Delete</button>
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>{p.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', flex: 1, marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description || 'No description provided.'}
                  </p>

                  {/* Task Progress Tracker */}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-muted)' }}>
                      <span>Progress</span>
                      <span>{rate}% ({completed}/{total} tasks)</span>
                    </div>
                    {/* Visual Progress bar container */}
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${rate}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="pagination" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
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

      {/* Add / Edit Project Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProject ? 'Modify Project Scope' : 'Initialize New Project'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingProject ? 'Save Changes' : 'Launch Project'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Mobile Application V2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Client Company</label>
            <select
              className={`form-control ${errors.companyId ? 'is-invalid' : ''}`}
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
            >
              <option value="">Select Company Link...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.companyId && <div className="invalid-feedback">{errors.companyId}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Project Description</label>
            <textarea
              rows="4"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              placeholder="Write core project objectives and deliverable descriptions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Project"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
          Are you sure you want to delete this project? All associated tasks inside this project will lose their project scope mapping.
        </p>
      </Modal>
    </div>
  );
}
