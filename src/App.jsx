import React, { useState } from 'react';
import { ComplaintProvider } from './context/ComplaintContext';
import { useComplaints } from './context/useComplaints';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { PageHeader } from './components/Layout/PageHeader';
import { Button } from './components/Base/Button';
import { Toast, ToastContainer } from './components/Base/Toast';
import { StaffDashboard } from './components/Staff/StaffDashboard';
import { SLAMatrixView } from './components/Staff/SLAMatrixView';
import { StaffNavbarControls } from './components/Staff/StaffNavbarControls';
import { StatusBadge } from './components/CampusFix/StatusBadge';
import { PriorityBadge } from './components/CampusFix/PriorityBadge';
import { Card, CardHeader, CardBody } from './components/Base/Card';
import { LoadingState } from './components/Base/LoadingState';
import { EmptyState } from './components/Base/EmptyState';
import { ErrorState } from './components/Base/ErrorState';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Staff Dashboard', icon: '📊' },
  { id: 'sla', label: 'SLA & Priorities', icon: '⏱' },
  { id: 'design', label: 'Design System', icon: '🎨' }
];

function MainContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState(null);
  const { complaints, checkSLABreaches } = useComplaints();

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Location', 'Priority', 'Status', 'SLA Deadline', 'Escalation'];
    const rows = complaints.map(c => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      `"${c.location}"`,
      c.priority,
      c.status,
      c.slaDeadline,
      c.escalationState
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campusfix_complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Complaint queue exported successfully as CSV.');
  };

  const handleCheckSLA = () => {
    checkSLABreaches();
    setToastMessage('SLA daemon scan completed: checked all active tickets against deadline clock.');
  };

  const sidebarLinksWithActive = SIDEBAR_ITEMS.map(item => ({
    ...item,
    active: activeTab === item.id,
    href: '#',
    onClick: (e) => {
      e.preventDefault();
      setActiveTab(item.id);
    }
  }));

  return (
    <DashboardLayout 
      sidebarLinks={sidebarLinksWithActive}
      navbarActions={<StaffNavbarControls />}
    >
      <PageHeader 
        title={
          activeTab === 'dashboard' 
            ? 'Staff Operations & Complaint Queue' 
            : activeTab === 'sla'
            ? 'SLA Matrix & Priority Policy'
            : 'CampusFix Design System'
        }
        description={
          activeTab === 'dashboard'
            ? 'Manage received grievances, priority dispatch, real-time SLA deadlines, and resolution workflows.'
            : activeTab === 'sla'
            ? 'Configurable resolution targets, keyword scoring rules, and supervisor escalation ladder.'
            : 'Shared foundational UI components, typography tokens, and status badges.'
        }
        actions={
          <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={handleCheckSLA}>
              ⏱ Refresh SLA
            </Button>
            <Button variant="primary" onClick={handleExportCSV}>
              📥 Export Report
            </Button>
          </div>
        }
      />

      {activeTab === 'dashboard' && <StaffDashboard />}
      {activeTab === 'sla' && <SLAMatrixView />}
      {activeTab === 'design' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          {/* Badge System Showcase */}
          <Card>
            <CardHeader>
              <h3 className="card-title">Status & Priority Badges</h3>
            </CardHeader>
            <CardBody>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--color-muted)' }}>Status Badges</h4>
                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                  <StatusBadge status="RECEIVED" />
                  <StatusBadge status="ACKNOWLEDGED" />
                  <StatusBadge status="IN_PROGRESS" />
                  <StatusBadge status="RESOLVED" />
                  <StatusBadge status="SLA_BREACHED" />
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--color-muted)' }}>Priority Badges</h4>
                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                  <PriorityBadge priority="LOW" score={20} showScore={true} />
                  <PriorityBadge priority="MEDIUM" score={45} showScore={true} />
                  <PriorityBadge priority="HIGH" score={72} showScore={true} />
                  <PriorityBadge priority="CRITICAL" score={95} showScore={true} />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* System State Components */}
          <Card>
            <CardHeader>
              <h3 className="card-title">State Feedback Components</h3>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
                <LoadingState message="Loading campus complaints..." size="small" />
                <EmptyState title="Queue Empty" description="All assigned tasks are resolved." />
                <ErrorState title="System Alert" message="Sample error boundary state." />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {toastMessage && (
        <ToastContainer>
          <Toast 
            message={toastMessage} 
            type="success" 
            onClose={() => setToastMessage(null)} 
          />
        </ToastContainer>
      )}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ComplaintProvider>
      <MainContent />
    </ComplaintProvider>
  );
}
