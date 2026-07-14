import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../../components/Modal';

export default function Companies() {
  const { 
    companies, 
    projects, 
    addCompany, 
    updateCompany, 
    deleteCompany, 
    checkPermission 
  } = useContext(AppContext);

  // Read permission check
  if (!checkPermission('read', 'Companies')) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: 'red' }}>Access Denied</h3>
        <p>Your current role does not have permission to view the Companies directory.</p>
      </div>
    );
  }

  const canModify = checkPermission('write', 'Companies');

  // Search, Sort, Pagination states
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null); // null means adding
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', website: '' });
  const [errors, setErrors] = useState({});

  // Delete Confirmation state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Handlers
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleOpenForm = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        email: company.email,
        phone: company.phone,
        website: company.website
      });
    } else {
      setEditingCompany(null);
      setFormData({ name: '', email: '', phone: '', website: '' });
    }
    setErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.name.trim()) newErrors.name = 'Company Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!formData.website.trim()) newErrors.website = 'Website is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCompany) {
      updateCompany(editingCompany.id, formData);
    } else {
      addCompany(formData);
    }
    setIsFormOpen(false);
  };

  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteCompany(deletingId);
    setIsDeleteOpen(false);
    setDeletingId(null);
    // adjust page index if last element was deleted
    const updatedCount = filteredCompanies.length - 1;
    const maxPage = Math.max(1, Math.ceil(updatedCount / itemsPerPage));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  };

  // Filtered & Sorted companies
  const filteredCompanies = companies
    .filter((c) => {
      const matchText = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(matchText) ||
        c.email.toLowerCase().includes(matchText) ||
        c.website.toLowerCase().includes(matchText)
      );
    })
    .sort((a, b) => {
      let valA = a[sortBy].toLowerCase();
      let valB = b[sortBy].toLowerCase();
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Projects Count calculation per company
  const getProjectsCount = (companyId) => {
    return projects.filter(p => p.companyId === companyId).length;
  };

  // Pagination Slice
  const totalItems = filteredCompanies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {/* Header and Add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Manage registered companies and client accounts.</p>
        {canModify && (
          <button className="btn btn-primary" onClick={() => handleOpenForm()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Company
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search companies by name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset page to 1
            }}
          />
        </div>
      </div>

      {/* Companies Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {totalItems === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No companies found matching search criteria.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th className="sortable-header" onClick={() => handleSort('name')}>
                      Company Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="sortable-header" onClick={() => handleSort('email')}>
                      Email Address {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th>Phone</th>
                    <th className="sortable-header" onClick={() => handleSort('website')}>
                      Website {sortBy === 'website' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th>Projects</th>
                    {canModify && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedCompanies.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>
                        <a href={`https://${c.website}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                          {c.website}
                        </a>
                      </td>
                      <td>
                        <span className="badge badge-inprogress" style={{ fontWeight: '700' }}>
                          {getProjectsCount(c.id)} Projects
                        </span>
                      </td>
                      {canModify && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button className="btn btn-secondary btn-xs" onClick={() => handleOpenForm(c)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-xs" onClick={() => handleOpenDelete(c.id)}>
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

            {/* Pagination controls */}
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

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCompany ? 'Edit Company Information' : 'Register New Company'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingCompany ? 'Save Changes' : 'Create Company'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Acme Industries"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input
              type="text"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="billing@acme.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Website Domain</label>
              <input
                type="text"
                className={`form-control ${errors.website ? 'is-invalid' : ''}`}
                placeholder="acme.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
              {errors.website && <div className="invalid-feedback">{errors.website}</div>}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Deletion"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
          Are you sure you want to delete this company? All associated project connections will lose their reference. This action is irreversible.
        </p>
      </Modal>
    </div>
  );
}
