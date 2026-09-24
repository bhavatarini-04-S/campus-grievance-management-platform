import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { PageHeader } from './components/Layout/PageHeader';
import { Button } from './components/Base/Button';
import { StatCard } from './components/Base/StatCard';
import { ComplaintCard } from './components/CampusFix/ComplaintCard';
import { ComplaintTimeline } from './components/CampusFix/ComplaintTimeline';
import { StatusBadge } from './components/CampusFix/StatusBadge';
import { PriorityBadge } from './components/CampusFix/PriorityBadge';
import { Toast, ToastContainer } from './components/Base/Toast';
import AIDemoPage from './pages/AIDemoPage';
import { AuthProvider } from './contexts/AuthContext';

import { StudentDashboard } from './pages/Student/Dashboard';
import { SubmitComplaint } from './pages/Student/SubmitComplaint';
import { MyComplaints } from './pages/Student/MyComplaints';
import { ComplaintDetail } from './pages/Student/ComplaintDetail';

const ADMIN_SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'AI Demo', href: '/admin/ai-demo', icon: '🤖' },
  { label: 'Complaints', href: '/admin/complaints', icon: '📝' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' }
];

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const updatedSidebarLinks = ADMIN_SIDEBAR_LINKS.map(link => ({
    ...link,
    active: location.pathname === link.href || (location.pathname.startsWith(link.href) && link.href !== '/admin'),
    onClick: (e) => {
      e.preventDefault();
      navigate(link.href);
    }
  }));
  
  return (
    <DashboardLayout sidebarLinks={updatedSidebarLinks} onNavigate={(href) => navigate(href)}>
      {children}
    </DashboardLayout>
  );
}

function LegacyAdminDashboard() {
  const [showToast, setShowToast] = useState(false);
  const DEMO_COMPLAINT = {
    id: 'CMP-2023-001',
    status: 'IN_PROGRESS',
    title: 'Wi-Fi completely down in North Campus Library',
    category: 'IT Infrastructure',
    location: 'North Campus Library - All Floors',
    impact: 'High',
    priority: 'HIGH',
    slaDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    support_count: 42
  };
  const DEMO_EVENTS = [
    { title: 'Complaint Filed', timestamp: '2023-10-24 09:00 AM', author: 'John D.' },
    { title: 'Acknowledged', timestamp: '2023-10-24 09:15 AM', author: 'IT Support Team' },
    { title: 'In Progress', timestamp: '2023-10-24 10:30 AM', author: 'Mike T. (Network Admin)' }
  ];

  return (
    <>
      <PageHeader 
        title="Dashboard Overview" 
        description="Welcome to CampusFix AI Foundation Demo"
        actions={
          <div className="flex gap-sm">
            <Button variant="outline" onClick={() => setShowToast(true)}>Export Report</Button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <StatCard title="Total Complaints" value="1,248" trend={5} icon="📋" />
        <StatCard title="Resolved" value="982" trend={12} icon="✅" />
        <StatCard title="SLA Breached" value="14" trend={-2} icon="⚠️" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-lg)' }}>
        <div>
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-md)' }}>Recent Complaints</h3>
          <ComplaintCard 
            complaint={DEMO_COMPLAINT} 
            onActionClick={() => setShowToast(true)}
          />
        </div>
        <div>
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-md)' }}>Timeline Demo</h3>
          <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <ComplaintTimeline events={DEMO_EVENTS} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        <h3 className="section-title" style={{ marginBottom: 'var(--spacing-md)' }}>Badge System</h3>
        <div className="flex gap-md" style={{ flexWrap: 'wrap', marginBottom: 'var(--spacing-md)' }}>
          <StatusBadge status="RECEIVED" />
          <StatusBadge status="ACKNOWLEDGED" />
          <StatusBadge status="IN_PROGRESS" />
          <StatusBadge status="RESOLVED" />
          <StatusBadge status="SLA_BREACHED" />
        </div>
        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <PriorityBadge priority="LOW" />
          <PriorityBadge priority="MEDIUM" />
          <PriorityBadge priority="HIGH" />
          <PriorityBadge priority="CRITICAL" />
        </div>
      </div>

      {showToast && (
        <ToastContainer>
          <Toast message="Action completed successfully!" type="success" onClose={() => setShowToast(false)} />
        </ToastContainer>
      )}
    </>
  );
}

function StudentLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { label: 'Dashboard', href: '/student', icon: '📊' },
    { label: 'My Complaints', href: '/student/complaints', icon: '📝' },
    { label: 'Submit Complaint', href: '/student/complaints/new', icon: '➕' }
  ].map(link => ({
    ...link,
    active: location.pathname === link.href || (location.pathname.startsWith('/student/complaints') && link.href === '/student/complaints' && location.pathname !== '/student/complaints/new'),
    onClick: (e) => {
      e.preventDefault();
      navigate(link.href);
    }
  }));

  links[2].active = location.pathname === '/student/complaints/new';

  return (
    <DashboardLayout sidebarLinks={links} onNavigate={(href) => navigate(href)}>
      {children}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/student" replace />} />
          
          <Route path="/admin/*" element={
            <AdminLayout>
              <Routes>
                <Route path="/" element={<LegacyAdminDashboard />} />
                <Route path="ai-demo" element={<AIDemoPage />} />
                <Route path="*" element={<LegacyAdminDashboard />} />
              </Routes>
            </AdminLayout>
          } />

          <Route path="/student/*" element={
            <StudentLayout>
              <Routes>
                <Route path="/" element={<StudentDashboard />} />
                <Route path="complaints" element={<MyComplaints />} />
                <Route path="complaints/new" element={<SubmitComplaint />} />
                <Route path="complaints/:id" element={<ComplaintDetail />} />
              </Routes>
            </StudentLayout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
