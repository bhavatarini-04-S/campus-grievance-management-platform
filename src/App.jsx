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
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
    { label: 'Escalations', href: '/admin/escalations', icon: '⬆️' },
    { label: 'Sensitive', href: '/admin/sensitive', icon: '🔒' },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: '📝' },
  ].map(link => ({
    ...link,
    active: location.pathname === link.href,
  }));

  return <DashboardLayout sidebarLinks={links} />;
}

// Wrapper for DashboardLayout to intercept links correctly in react-router
function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();

  const links = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
    { label: 'Escalations', href: '/admin/escalations', icon: '⬆️' },
    { label: 'Sensitive', href: '/admin/sensitive', icon: '🔒' },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: '📝' },
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
      <DashboardLayout sidebarLinks={links}>
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
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/escalations" element={<Escalations />} />
            <Route path="/admin/sensitive" element={<SensitiveComplaints />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
          </Routes>
        </AdminLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
