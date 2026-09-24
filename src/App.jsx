import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { Dashboard } from './pages/Admin/Dashboard';
import { Analytics } from './pages/Admin/Analytics';
import { Escalations } from './pages/Admin/Escalations';
import { SensitiveComplaints } from './pages/Admin/SensitiveComplaints';
import { AuditLogs } from './pages/Admin/AuditLogs';
import { Select } from './components/Base/Forms';

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Analytics', href: '/analytics', icon: '📈' },
    { label: 'Escalations', href: '/escalations', icon: '⬆️' },
    { label: 'Sensitive', href: '/sensitive', icon: '🔒' },
    { label: 'Audit Logs', href: '/audit', icon: '📝' },
  ].map(link => ({
    ...link,
    active: location.pathname === link.href,
    onClick: (e) => {
      e.preventDefault();
      navigate(link.href);
    }
  }));

  return <DashboardLayout sidebarLinks={links} />;
}

// Wrapper for DashboardLayout to intercept links correctly in react-router
function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();

  const links = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Analytics', href: '/analytics', icon: '📈' },
    { label: 'Escalations', href: '/escalations', icon: '⬆️' },
    { label: 'Sensitive', href: '/sensitive', icon: '🔒' },
    { label: 'Audit Logs', href: '/audit', icon: '📝' },
  ].map(link => ({
    ...link,
    active: location.pathname === link.href,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '8px 24px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ font: 'var(--font-caption)', color: 'var(--color-muted)' }}>Role Switcher (Demo):</div>
        <Select 
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
          options={[
            { label: 'ADMIN', value: 'ADMIN' },
            { label: 'SUPERVISOR', value: 'SUPERVISOR' },
            { label: 'GRIEVANCE_OFFICER', value: 'GRIEVANCE_OFFICER' },
            { label: 'STAFF', value: 'STAFF' },
            { label: 'STUDENT', value: 'STUDENT' },
          ]}
        />
      </div>
      <DashboardLayout sidebarLinks={links.map(l => ({...l, href: undefined}))}>
        {/* We need to hook into the sidebar links in DashboardLayout somehow, but since we can't easily modify the existing DashboardLayout to use Link without rewriting it, we'll modify Sidebar.jsx instead to support onClick or use window.location */}
        {children}
      </DashboardLayout>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AdminLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/escalations" element={<Escalations />} />
            <Route path="/sensitive" element={<SensitiveComplaints />} />
            <Route path="/audit" element={<AuditLogs />} />
          </Routes>
        </AdminLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
