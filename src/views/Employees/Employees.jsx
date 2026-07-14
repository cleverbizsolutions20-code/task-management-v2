import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../../components/Modal';

export default function Employees() {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    checkPermission
  } = useContext(AppContext);

  // Check read permission
  if (!checkPermission('read', 'Employees')) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: 'red' }}>Access Denied</h3>
        <p>Your current role does not have permission to view the Employees database.</p>
      </div>
    );
  }

  const canModify = checkPermission('write', 'Employees');

  // Search, Sort, Pagination states
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', department: '', role: 'Employee' });
  const [errors, setErrors] = useState({});

  // Delete Confirmation state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Departments List for filter
  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  // Handlers
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleOpenForm = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department || 'General',
        role: employee.role || 'Employee'
      });
    } else {
      setEditingEmployee(null);
      setFormData({ name: '', email: '', phone: '', department: 'Engineering', role: 'Employee' });
    }
    setErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = 'Employee Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!formData.department.trim()) newErrors.department = 'Department name is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
    } else {
      addEmployee(formData);
    }
    setIsFormOpen(false);
  };

  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteEmployee(deletingId);
    setIsDeleteOpen(false);
    setDeletingId(null);
    // adjust page
    const updatedCount = filteredEmployees.length - 1;
    const maxPage = Math.max(1, Math.ceil(updatedCount / itemsPerPage));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  };

  // Filtered & Sorted employees
  const filteredEmployees = employees
    .filter((e) => {
      const matchText = search.toLowerCase();
      const matchesSearch =
        e.name.toLowerCase().includes(matchText) ||
        e.email.toLowerCase().includes(matchText) ||
        (e.department && e.department.toLowerCase().includes(matchText));
      
      const matchesDept = departmentFilter ? e.department === departmentFilter : true;
      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'email') {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      } else if (sortBy === 'department') {
        valA = (a.department || '').toLowerCase();
        valB = (b.department || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination Slice
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Manage internal organization directory, departments, and administrative roles.</p>
        {canModify && (
          <button className="btn btn-primary" onClick={() => handleOpenForm()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Employee
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
            placeholder="Search employees by name, email, department..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="form-control filter-select"
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {totalItems === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No employees found matching search criteria.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th className="sortable-header" onClick={() => handleSort('name')}>
                      Employee Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="sortable-header" onClick={() => handleSort('department')}>
                      Department {sortBy === 'department' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="sortable-header" onClick={() => handleSort('email')}>
                      Email Address {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th>Phone</th>
                    <th>Security Role</th>
                    {canModify && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{e.name}</td>
                      <td>
                        <span className="badge badge-inprogress" style={{ background: '#f8fafc', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: '600' }}>
                          {e.department}
                        </span>
                      </td>
                      <td>{e.email}</td>
                      <td>{e.phone}</td>
                      <td>
                        <span className={`badge ${e.role === 'Admin' ? 'badge-high' : e.role === 'Manager' ? 'badge-medium' : 'badge-completed'}`}>
                          {e.role}
                        </span>
                      </td>
                      {canModify && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button className="btn btn-secondary btn-xs" onClick={() => handleOpenForm(e)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-xs" onClick={() => handleOpenDelete(e.id)}>
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
        title={editingEmployee ? 'Modify Employee Profile' : 'Onboard New Employee'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingEmployee ? 'Save Changes' : 'Onboard Employee'}
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
              placeholder="e.g. Sarah Jenkins"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">System Role</label>
            <select
              className="form-control"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                placeholder="Engineering, Design, HR..."
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
              {errors.department && <div className="invalid-feedback">{errors.department}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                placeholder="+1 (555) 019-2834"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Email Address</label>
            <input
              type="text"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="sarah@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
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
          Are you sure you want to offboard this employee? This will also disable their credential access and clear their user logins sheet.
        </p>
      </Modal>
    </div>
  );
}
