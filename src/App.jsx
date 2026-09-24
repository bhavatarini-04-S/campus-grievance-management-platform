import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { AuthProvider } from './contexts/AuthContext';

import { StudentDashboard } from './pages/Student/Dashboard';
import { SubmitComplaint } from './pages/Student/SubmitComplaint';
import { MyComplaints } from './pages/Student/MyComplaints';
import { ComplaintDetail } from './pages/Student/ComplaintDetail';

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

  // Ensure 'Submit Complaint' is highlighted exactly
  links[2].active = location.pathname === '/student/complaints/new';

  return (
    <DashboardLayout sidebarLinks={links}>
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
