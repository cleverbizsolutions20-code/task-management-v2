import React, { useState, useEffect, useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import AuthScreen from './views/Auth/AuthScreen';
import Dashboard from './views/Dashboard/Dashboard';
import Companies from './views/Companies/Companies';
import Projects from './views/Projects/Projects';
import Tasks from './views/Tasks/Tasks';
import Partners from './views/Partners/Partners';
import Employees from './views/Employees/Employees';
import Reports from './views/Reports/Reports';
import Settings from './views/Settings/Settings';
import './App.css';

function MainAppShell() {
  const { currentUser, currentRole, checkPermission } = useContext(AppContext);
  const [activeView, setActiveView] = useState('Dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // States to control task detail drawer globally (e.g. to open from Dashboard or Reports)
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);

  // Safeguard view access on role simulation changes
  useEffect(() => {
    if (currentRole) {
      const allowed = checkPermission('read', activeView);
      if (!allowed) {
        // Fallback redirection rules
        if (currentRole === 'Partner') {
          setActiveView('Tasks');
        } else {
          setActiveView('Dashboard');
        }
      }
    }
  }, [currentRole, activeView, checkPermission]);

  if (!currentUser) {
    return <AuthScreen />;
  }

  // View Router helper
  const renderView = () => {
    switch (activeView) {
      case 'Dashboard':
        return (
          <Dashboard 
            setActiveView={setActiveView} 
            setSelectedTaskId={setSelectedTaskId} 
            setTaskDetailOpen={setTaskDetailOpen} 
          />
        );
      case 'Companies':
        return <Companies />;
      case 'Projects':
        return <Projects />;
      case 'Tasks':
        return (
          <Tasks 
            selectedTaskId={selectedTaskId} 
            setSelectedTaskId={setSelectedTaskId} 
            taskDetailOpen={taskDetailOpen} 
            setTaskDetailOpen={setTaskDetailOpen} 
          />
        );
      case 'Partners':
        return <Partners />;
      case 'Employees':
        return <Employees />;
      case 'Reports':
        return (
          <Reports 
            setSelectedTaskId={setSelectedTaskId} 
            setTaskDetailOpen={setTaskDetailOpen} 
          />
        );
      case 'Settings':
        return <Settings />;
      default:
        return <Dashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* Main body content pane */}
      <div className="main-content">
        <Header activeView={activeView} setMobileOpen={setMobileOpen} />
        
        <main className="content-body">
          {renderView()}
        </main>
      </div>

      {/* Global Task details modal (drawer) for cross-module triggers */}
      {activeView !== 'Tasks' && (
        <Tasks 
          selectedTaskId={selectedTaskId} 
          setSelectedTaskId={setSelectedTaskId} 
          taskDetailOpen={taskDetailOpen} 
          setTaskDetailOpen={setTaskDetailOpen} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
      <Toast />
    </AppProvider>
  );
}
