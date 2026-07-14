import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../../components/Modal';

export default function Partners() {
  const {
    partners,
    companies,
    addPartner,
    updatePartner,
    deletePartner,
    checkPermission
  } = useContext(AppContext);

  // Check read permission
  if (!checkPermission('read', 'Partners')) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: 'red' }}>Access Denied</h3>
        <p>Your current role does not have permission to view the Partners database.</p>
      </div>
    );
  }

  const canModify = checkPermission('write', 'Partners');

  // Search, Sort, Pagination states
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({ name: '', companyId: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});

  // Delete Confirmation state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Helpers
  const getCompanyName = (companyId) => {
    return companies.find((c) => c.id === companyId)?.name || 'Unknown Company';
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

  const handleOpenForm = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        companyId: partner.companyId,
        email: partner.email,
        phone: partner.phone
      });
    } else {
      setEditingPartner(null);
      setFormData({ name: '', companyId: companies[0]?.id || '', email: '', phone: '' });
    }
    setErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = 'Partner Name is required.';
    if (!formData.companyId) newErrors.companyId = 'Please select a company.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      companyId: formData.companyId,
      email: formData.email,
      phone: formData.phone,
      role: 'Partner'
    };

    if (editingPartner) {
      updatePartner(editingPartner.id, payload);
    } else {
      addPartner(payload);
    }
    setIsFormOpen(false);
  };

  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    deletePartner(deletingId);
    setIsDeleteOpen(false);
    setDeletingId(null);
    // adjust page
    const updatedCount = filteredPartners.length - 1;
    const maxPage = Math.max(1, Math.ceil(updatedCount / itemsPerPage));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  };

  // Filtered & Sorted partners
  const filteredPartners = partners
    .filter((p) => {
      const matchText = search.toLowerCase();
      const compName = getCompanyName(p.companyId).toLowerCase();
      return (
        p.name.toLowerCase().includes(matchText) ||
        p.email.toLowerCase().includes(matchText) ||
        compName.includes(matchText)
      );
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'email') {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      } else if (sortBy === 'company') {
        valA = getCompanyName(a.companyId).toLowerCase();
        valB = getCompanyName(b.companyId).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination Slice
  const totalItems = filteredPartners.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPartners = filteredPartners.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Manage external contractors, client points of contact, and business partners.</p>
        {canModify && (
          <button className="btn btn-primary" onClick={() => handleOpenForm()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Partner
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
            placeholder="Search partners by name, company, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {totalItems === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No partners found matching search criteria.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th className="sortable-header" onClick={() => handleSort('name')}>
                      Partner Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="sortable-header" onClick={() => handleSort('company')}>
                      Associated Company {sortBy === 'company' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="sortable-header" onClick={() => handleSort('email')}>
                      Email Address {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th>Phone</th>
                    <th>System Role</th>
                    {canModify && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedPartners.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.name}</td>
                      <td>
                        <span className="badge badge-pending" style={{ background: '#eff6ff', color: 'var(--primary)', fontWeight: '700' }}>
                          {getCompanyName(p.companyId)}
                        </span>
                      </td>
                      <td>{p.email}</td>
                      <td>{p.phone}</td>
                      <td>
                        <span className="badge badge-onhold" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                          Partner Contact
                        </span>
                      </td>
                      {canModify && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button className="btn btn-secondary btn-xs" onClick={() => handleOpenForm(p)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-xs" onClick={() => handleOpenDelete(p.id)}>
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

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingPartner ? 'Modify Partner Profile' : 'Add Partner Contact'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingPartner ? 'Save Changes' : 'Create Partner'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Jane Smith"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Company Affiliation</label>
            <select
              className={`form-control ${errors.companyId ? 'is-invalid' : ''}`}
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
            >
              <option value="">Select Company...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.companyId && <div className="invalid-feedback">{errors.companyId}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input
              type="text"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="jane@partnercompany.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="+1 (555) 012-3456"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
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
          Are you sure you want to delete this partner contact? This will also remove their simulated login user account from the system credentials sheet.
        </p>
      </Modal>
    </div>
  );
}
