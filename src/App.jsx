import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DashboardLayout } from './components/Layout/DashboardLayout'
import { ToastContainer } from './components/Base/Toast'

// Staff Pages
import { StaffDashboard } from './pages/Staff/Dashboard'
import { StaffComplaintDetail } from './pages/Staff/ComplaintDetail'

const STAFF_SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '/staff', icon: '📊' },
  { label: 'Complaints', href: '/staff/complaints', icon: '📝' },
  { label: 'SLA / At Risk', href: '/staff/sla', icon: '⚠️' },
  { label: 'Escalations', href: '/staff/escalations', icon: '🚨' }
];

function StaffLayout() {
  const { user } = useAuth();

  // Lightweight mock role guard
  if (!user || !['STAFF', 'SUPERVISOR', 'ADMIN', 'GRIEVANCE_OFFICER'].includes(user.role)) {
    return <div style={{padding: '2rem'}}>Access Denied. Staff role required.</div>;
  }

  return (
    <DashboardLayout sidebarLinks={STAFF_SIDEBAR_LINKS}>
      <Outlet />
      <ToastContainer />
    </DashboardLayout>
  );
}

// Fallback layout for future Student/Admin routes that aren't implemented in this branch yet
function FallbackLayout({ title, links }) {
  return (
    <DashboardLayout sidebarLinks={links || []}>
      <div style={{padding: '2rem'}}>
        <h2>{title} Placeholder</h2>
        <p>This route is reserved for a future merge.</p>
      </div>
    </DashboardLayout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/staff" replace />} />

      {/* Staff & SLA Routes */}
      <Route path="/staff" element={<StaffLayout />}>
        <Route index element={<StaffDashboard />} />
        <Route path="complaints" element={<StaffDashboard />} />
        <Route path="complaints/:id" element={<StaffComplaintDetail />} />
        <Route path="sla" element={<div style={{padding: '2rem'}}><h2>SLA Dashboard</h2><p>Coming soon</p></div>} />
        <Route path="escalations" element={<div style={{padding: '2rem'}}><h2>Escalations</h2><p>Coming soon</p></div>} />
      </Route>

      {/* Reserved Routes for Future Merges (Student, Admin, AI) */}
      <Route path="/student/*" element={<FallbackLayout title="Student Experience" />} />
      <Route path="/admin/*" element={<FallbackLayout title="Admin Analytics" />} />
      <Route path="/admin/ai-demo" element={<FallbackLayout title="AI Duplicate Detection Demo" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
