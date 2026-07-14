import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// Seed Data
const INITIAL_USERS = [
  { id: 'u1', name: 'Admin User', email: 'admin@saas.com', password: 'password', role: 'Admin' },
  { id: 'u2', name: 'Manager User', email: 'manager@saas.com', password: 'password', role: 'Manager' },
  { id: 'u3', name: 'John Doe', email: 'employee@saas.com', password: 'password', role: 'Employee' },
  { id: 'u4', name: 'Jane Smith', email: 'partner@saas.com', password: 'password', role: 'Partner' },
  { id: 'u5', name: 'Sarah Jenkins', email: 'sarah@saas.com', password: 'password', role: 'Employee' },
  { id: 'u6', name: 'Bob Johnson', email: 'bob@globex.com', password: 'password', role: 'Partner' },
];

const INITIAL_COMPANIES = [
  { id: 'c1', name: 'Acme Corp', email: 'contact@acme.com', phone: '123-456-7890', website: 'acme.com' },
  { id: 'c2', name: 'Globex Corporation', email: 'info@globex.com', phone: '987-654-3210', website: 'globex.com' },
  { id: 'c3', name: 'Initech Inc', email: 'billing@initech.com', phone: '555-019-2834', website: 'initech.com' }
];

const INITIAL_PROJECTS = [
  { id: 'p1', name: 'Website Redesign', companyId: 'c1', description: 'Complete overhaul of the public website marketing and branding pages.' },
  { id: 'p2', name: 'Mobile App Development', companyId: 'c1', description: 'Building the cross-platform mobile application for Android and iOS.' },
  { id: 'p3', name: 'HR Automation System', companyId: 'c2', description: 'Automating internal onboarding, timesheet approval, and leave request processes.' }
];

const INITIAL_EMPLOYEES = [
  { id: 'e1', name: 'John Doe', email: 'employee@saas.com', phone: '777-888-9999', department: 'Engineering', role: 'Employee' },
  { id: 'e2', name: 'Sarah Jenkins', email: 'sarah@saas.com', phone: '333-444-5555', department: 'Design', role: 'Employee' },
  { id: 'e3', name: 'David Miller', email: 'david@saas.com', phone: '222-333-4444', department: 'Product', role: 'Manager' }
];

const INITIAL_PARTNERS = [
  { id: 'pt1', name: 'Jane Smith', companyId: 'c1', email: 'partner@saas.com', phone: '111-222-3333', role: 'Partner' },
  { id: 'pt2', name: 'Bob Johnson', companyId: 'c2', email: 'bob@globex.com', phone: '444-555-6666', role: 'Partner' }
];

const INITIAL_TASKS = [
  {
    id: 't1',
    title: 'Design Homepage Hero Section',
    description: 'Create responsive high-fidelity UI mockups for the homepage hero section with light/dark visual assets.',
    projectId: 'p1',
    companyId: 'c1',
    assigneeId: 'e2', // Sarah Jenkins
    assigneeType: 'Employee',
    status: 'Completed',
    priority: 'High',
    dueDate: '2026-07-10',
    attachments: [
      { name: 'hero_v2_desktop.png', size: '2.4 MB', type: 'image/png', date: '2026-07-09' }
    ],
    comments: [
      { id: 'cm1', author: 'Sarah Jenkins', text: 'Uploaded the desktop hero sketch.', date: '2026-07-09T14:30:00Z' },
      { id: 'cm2', author: 'Manager User', text: 'Looks clean. Let us proceed with coding this.', date: '2026-07-09T16:15:00Z' }
    ]
  },
  {
    id: 't2',
    title: 'Setup Database Schemas',
    description: 'Establish Postgres relational model diagrams and create migration files for user profiles, organizations, and project memberships.',
    projectId: 'p2',
    companyId: 'c1',
    assigneeId: 'e1', // John Doe
    assigneeType: 'Employee',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-07-20',
    attachments: [],
    comments: [
      { id: 'cm3', author: 'John Doe', text: 'Primary database configuration is done. Working on migration scripts.', date: '2026-07-13T09:00:00Z' }
    ]
  },
  {
    id: 't3',
    title: 'Partner APIs Integration',
    description: 'Implement secure webhook handlers and request validators to parse employee updates coming from Acme Corp payroll platform.',
    projectId: 'p3',
    companyId: 'c2',
    assigneeId: 'pt2', // Bob Johnson
    assigneeType: 'Partner',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '2026-07-25',
    attachments: [],
    comments: []
  },
  {
    id: 't4',
    title: 'Fix Header Responsiveness',
    description: 'Resolve CSS wrapping issues occurring on smaller tablet sizes (between 768px and 1024px widths) where the logo overrides navigation items.',
    projectId: 'p1',
    companyId: 'c1',
    assigneeId: 'e1', // John Doe
    assigneeType: 'Employee',
    status: 'In Progress',
    priority: 'Low',
    dueDate: '2026-07-05', // Overdue!
    attachments: [],
    comments: []
  },
  {
    id: 't5',
    title: 'Write Product Requirements Document',
    description: 'Compile core requirements, business objectives, success metrics, and epic stories for the automated employee onboarding system.',
    projectId: 'p3',
    companyId: 'c2',
    assigneeId: 'e3', // David Miller (Manager)
    assigneeType: 'Employee',
    status: 'On Hold',
    priority: 'Medium',
    dueDate: '2026-08-01',
    attachments: [],
    comments: []
  }
];

const INITIAL_ACTIVITIES = [
  { id: 'a1', text: 'Admin User created the project Website Redesign', date: '2026-07-01T09:00:00Z', taskId: null },
  { id: 'a2', text: 'Sarah Jenkins uploaded an attachment to Design Homepage Hero Section', date: '2026-07-09T14:30:00Z', taskId: 't1' },
  { id: 'a3', text: 'Sarah Jenkins marked Design Homepage Hero Section as Completed', date: '2026-07-10T17:00:00Z', taskId: 't1' },
  { id: 'a4', text: 'John Doe commented on Setup Database Schemas', date: '2026-07-13T09:00:00Z', taskId: 't2' }
];

export const AppProvider = ({ children }) => {
  // LocalStorage helper load
  const loadLocal = (key, initialValue) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (e) {
      return initialValue;
    }
  };

  // Auth State
  const [currentUser, setCurrentUser] = useState(() => loadLocal('ct_user', null));
  const [currentRole, setCurrentRole] = useState(() => loadLocal('ct_role', null));

  // Entities state
  const [companies, setCompanies] = useState(() => loadLocal('ct_companies', INITIAL_COMPANIES));
  const [projects, setProjects] = useState(() => loadLocal('ct_projects', INITIAL_PROJECTS));
  const [tasks, setTasks] = useState(() => loadLocal('ct_tasks', INITIAL_TASKS));
  const [employees, setEmployees] = useState(() => loadLocal('ct_employees', INITIAL_EMPLOYEES));
  const [partners, setPartners] = useState(() => loadLocal('ct_partners', INITIAL_PARTNERS));
  const [activities, setActivities] = useState(() => loadLocal('ct_activities', INITIAL_ACTIVITIES));
  const [usersList, setUsersList] = useState(() => loadLocal('ct_users_list', INITIAL_USERS));
  const [toasts, setToasts] = useState([]);

  // Sync to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('ct_user', JSON.stringify(currentUser));
    localStorage.setItem('ct_role', JSON.stringify(currentRole));
  }, [currentUser, currentRole]);

  useEffect(() => { localStorage.setItem('ct_companies', JSON.stringify(companies)); }, [companies]);
  useEffect(() => { localStorage.setItem('ct_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('ct_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('ct_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('ct_partners', JSON.stringify(partners)); }, [partners]);
  useEffect(() => { localStorage.setItem('ct_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('ct_users_list', JSON.stringify(usersList)); }, [usersList]);

  // Toast helper
  const addToast = (text, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity Logger helper
  const logActivity = (text, taskId = null) => {
    const newAct = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      date: new Date().toISOString(),
      taskId
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Auth Operations
  const login = (email, password) => {
    const found = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (found) {
      setCurrentUser(found);
      setCurrentRole(found.role);
      addToast(`Welcome back, ${found.name}!`, 'success');
      logActivity(`${found.name} logged into the system.`);
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password.' };
  };

  const register = (name, email, password, role) => {
    if (usersList.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email already registered.' };
    }
    
    const newUser = {
      id: 'u' + (usersList.length + 1),
      name,
      email,
      password,
      role
    };

    setUsersList((prev) => [...prev, newUser]);
    
    // Add to Employees or Partners depending on role
    if (role === 'Partner') {
      const newPartner = {
        id: 'pt' + (partners.length + 1),
        name,
        companyId: companies[0]?.id || 'c1',
        email,
        phone: 'Not provided',
        role: 'Partner'
      };
      setPartners((prev) => [...prev, newPartner]);
    } else {
      const newEmp = {
        id: 'e' + (employees.length + 1),
        name,
        email,
        phone: 'Not provided',
        department: 'General',
        role: role
      };
      setEmployees((prev) => [...prev, newEmp]);
    }

    setCurrentUser(newUser);
    setCurrentRole(role);
    addToast('Account created successfully!', 'success');
    logActivity(`${name} registered a new account.`);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logActivity(`${currentUser.name} logged out.`);
    }
    setCurrentUser(null);
    setCurrentRole(null);
    addToast('Logged out successfully.', 'success');
  };

  const forgotPassword = (email) => {
    const found = usersList.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      addToast('Simulated: A password reset link has been sent to your email.', 'success');
      return { success: true };
    }
    return { success: false, message: 'Email address not found in our records.' };
  };

  // Role Permissions Checker
  const checkPermission = (action, module) => {
    if (!currentRole) return false;
    
    // Admin has full permissions for everything
    if (currentRole === 'Admin') return true;

    if (currentRole === 'Manager') {
      // Managers can CRUD projects & tasks, view everything, but cannot edit employees/partners/companies
      if (module === 'Projects' || module === 'Tasks') return true;
      if (action === 'read') return true; // Can read Companies, Employees, Partners, Reports, Settings
      return false; // Can't write to Companies, Employees, Partners, Settings
    }

    if (currentRole === 'Employee') {
      // Employees can read Companies, Projects, Partners, Employees, Reports, Tasks
      // Employees can edit only tasks assigned to them: update status, add comments, add attachments
      if (action === 'read') {
        if (module === 'Settings') return true;
        return true;
      }
      if (module === 'Tasks' && (action === 'edit_status' || action === 'comment' || action === 'attach')) {
        return true;
      }
      return false;
    }

    if (currentRole === 'Partner') {
      // Partners can only read Tasks assigned to them and projects they are on.
      // No access to Companies list, Employees list, Reports, or Settings.
      if (module === 'Tasks' && (action === 'read' || action === 'edit_status' || action === 'comment')) {
        return true;
      }
      if (module === 'Projects' && action === 'read') {
        return true;
      }
      return false;
    }

    return false;
  };

  // Company Operations
  const addCompany = (company) => {
    const newComp = { ...company, id: 'c' + (companies.length + 1) };
    setCompanies((prev) => [...prev, newComp]);
    addToast(`Company "${company.name}" created.`, 'success');
    logActivity(`${currentUser.name} created company "${company.name}".`);
  };

  const updateCompany = (id, updatedCompany) => {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedCompany } : c)));
    addToast(`Company "${updatedCompany.name}" updated.`, 'success');
    logActivity(`${currentUser.name} updated company "${updatedCompany.name}".`);
  };

  const deleteCompany = (id) => {
    const target = companies.find((c) => c.id === id);
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    // Cascade delete projects & tasks? To keep simple, let's just log and clear relations
    addToast(`Company deleted successfully.`, 'success');
    if (target) {
      logActivity(`${currentUser.name} deleted company "${target.name}".`);
    }
  };

  // Project Operations
  const addProject = (project) => {
    const newProj = { ...project, id: 'p' + (projects.length + 1) };
    setProjects((prev) => [...prev, newProj]);
    addToast(`Project "${project.name}" created.`, 'success');
    logActivity(`${currentUser.name} created project "${project.name}".`);
  };

  const updateProject = (id, updatedProject) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedProject } : p)));
    addToast(`Project "${updatedProject.name}" updated.`, 'success');
    logActivity(`${currentUser.name} updated project "${updatedProject.name}".`);
  };

  const deleteProject = (id) => {
    const target = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    addToast(`Project deleted successfully.`, 'success');
    if (target) {
      logActivity(`${currentUser.name} deleted project "${target.name}".`);
    }
  };

  // Task Operations
  const addTask = (task) => {
    const newTask = {
      ...task,
      id: 't' + (tasks.length + 1),
      attachments: [],
      comments: []
    };
    setTasks((prev) => [...prev, newTask]);
    addToast(`Task "${task.title}" created.`, 'success');
    logActivity(`${currentUser.name} created task "${task.title}".`);
  };

  const updateTask = (id, updatedTask) => {
    // If status changed, log it!
    const oldTask = tasks.find((t) => t.id === id);
    if (oldTask && oldTask.status !== updatedTask.status) {
      logActivity(`${currentUser.name} updated status of "${updatedTask.title}" to ${updatedTask.status}`, id);
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)));
    addToast(`Task "${updatedTask.title}" updated.`, 'success');
  };

  const deleteTask = (id) => {
    const target = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addToast(`Task deleted successfully.`, 'success');
    if (target) {
      logActivity(`${currentUser.name} deleted task "${target.title}".`);
    }
  };

  const addTaskComment = (taskId, commentText) => {
    const authorName = currentUser?.name || 'Anonymous';
    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      author: authorName,
      text: commentText,
      date: new Date().toISOString()
    };
    
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            comments: [...t.comments, newComment]
          };
        }
        return t;
      })
    );
    
    logActivity(`${authorName} added a comment on task "${tasks.find(t => t.id === taskId)?.title}"`, taskId);
    addToast('Comment added.', 'success');
  };

  const addTaskAttachment = (taskId, fileName, fileSize, fileType) => {
    const newAttachment = {
      name: fileName,
      size: fileSize,
      type: fileType || 'application/octet-stream',
      date: new Date().toISOString().split('T')[0]
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            attachments: [...t.attachments, newAttachment]
          };
        }
        return t;
      })
    );

    logActivity(`${currentUser?.name || 'User'} attached "${fileName}" to task "${tasks.find(t => t.id === taskId)?.title}"`, taskId);
    addToast('File attached successfully.', 'success');
  };

  // Partner Operations
  const addPartner = (partner) => {
    const newPartner = { ...partner, id: 'pt' + (partners.length + 1) };
    setPartners((prev) => [...prev, newPartner]);
    
    // Also append to usersList so they can log in
    const newUser = {
      id: 'u_p' + (usersList.length + 1),
      name: partner.name,
      email: partner.email,
      password: 'password', // Default password
      role: 'Partner'
    };
    setUsersList((prev) => [...prev, newUser]);

    addToast(`Partner "${partner.name}" added.`, 'success');
    logActivity(`${currentUser.name} added partner "${partner.name}".`);
  };

  const updatePartner = (id, updatedPartner) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedPartner } : p)));
    // Also update usersList email/name
    const orig = partners.find(p => p.id === id);
    if (orig) {
      setUsersList((prev) => prev.map(u => u.email === orig.email ? { ...u, name: updatedPartner.name, email: updatedPartner.email } : u));
    }
    addToast(`Partner "${updatedPartner.name}" updated.`, 'success');
    logActivity(`${currentUser.name} updated partner "${updatedPartner.name}".`);
  };

  const deletePartner = (id) => {
    const target = partners.find((p) => p.id === id);
    setPartners((prev) => prev.filter((p) => p.id !== id));
    if (target) {
      setUsersList((prev) => prev.filter(u => u.email !== target.email));
      logActivity(`${currentUser.name} deleted partner "${target.name}".`);
    }
    addToast(`Partner deleted successfully.`, 'success');
  };

  // Employee Operations
  const addEmployee = (employee) => {
    const newEmp = { ...employee, id: 'e' + (employees.length + 1) };
    setEmployees((prev) => [...prev, newEmp]);

    // Also append to usersList so they can log in
    const newUser = {
      id: 'u_e' + (usersList.length + 1),
      name: employee.name,
      email: employee.email,
      password: 'password', // Default password
      role: employee.role // Manager, Employee, Admin
    };
    setUsersList((prev) => [...prev, newUser]);

    addToast(`Employee "${employee.name}" added.`, 'success');
    logActivity(`${currentUser.name} added employee "${employee.name}".`);
  };

  const updateEmployee = (id, updatedEmployee) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updatedEmployee } : e)));
    const orig = employees.find(e => e.id === id);
    if (orig) {
      setUsersList((prev) => prev.map(u => u.email === orig.email ? { ...u, name: updatedEmployee.name, email: updatedEmployee.email, role: updatedEmployee.role } : u));
    }
    addToast(`Employee "${updatedEmployee.name}" updated.`, 'success');
    logActivity(`${currentUser.name} updated employee "${updatedEmployee.name}".`);
  };

  const deleteEmployee = (id) => {
    const target = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    if (target) {
      setUsersList((prev) => prev.filter(u => u.email !== target.email));
      logActivity(`${currentUser.name} deleted employee "${target.name}".`);
    }
    addToast(`Employee deleted successfully.`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        companies,
        projects,
        tasks,
        employees,
        partners,
        activities,
        toasts,
        addToast,
        removeToast,
        login,
        register,
        logout,
        forgotPassword,
        checkPermission,
        addCompany,
        updateCompany,
        deleteCompany,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        addTaskComment,
        addTaskAttachment,
        addPartner,
        updatePartner,
        deletePartner,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        usersList
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
