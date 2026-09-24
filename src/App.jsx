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
  const [previewState, setPreviewState] = useState('none'); // 'none' | 'loading' | 'empty' | 'error'

  const { 
    complaints, 
    isLoading, 
    loading, 
    error, 
    refreshData, 
    checkSLABreaches 
  } = useComplaints();

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

  const handleRefresh = async () => {
    if (refreshData) {
      await refreshData();
    }
    if (checkSLABreaches) {
      checkSLABreaches();
    }
    setToastMessage('CampusFix data and SLA deadlines re-synchronized successfully.');
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

  // Global loading state: guaranteed to terminate via finally block in ComplaintProvider
  if (isLoading || loading) {
    return (
      <DashboardLayout 
        sidebarLinks={sidebarLinksWithActive}
        navbarActions={<StaffNavbarControls />}
      >
        <div style={{ padding: 'var(--spacing-xl)', display: 'flex', justifyContent: 'center' }}>
          <LoadingState message="Initializing CampusFix platform and loading complaints data..." size="large" />
        </div>
      </DashboardLayout>
    );
  }

  // Global error state with retry
  if (error) {
    return (
      <DashboardLayout 
        sidebarLinks={sidebarLinksWithActive}
        navbarActions={<StaffNavbarControls />}
      >
        <div style={{ padding: 'var(--spacing-xl)' }}>
          <ErrorState 
            title="Failed to Load Dashboard Data" 
            message={error} 
            onRetry={handleRefresh} 
          />
        </div>
      </DashboardLayout>
    );
  }

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
            <Button variant="outline" onClick={handleRefresh}>
              🔄 Refresh Data
            </Button>
            <Button variant="primary" onClick={handleExportCSV}>
              📥 Export CSV
            </Button>
          </div>
        }
      />

      {activeTab === 'dashboard' && <StaffDashboard />}

      {/* Operations Reference */}
      {activeTab === 'sla' && <SLAMatrixView />}

      {/* Design System Reference */}
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

          {/* Interactive State Feedback Components Preview */}
          <Card>
            <CardHeader>
              <h3 className="card-title">Interactive Lifecycle State Components</h3>
            </CardHeader>
            <CardBody>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: 'var(--spacing-md)' }}>
                Test each foundational UI state component on demand:
              </p>
              <div className="flex gap-sm" style={{ marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                <Button 
                  variant={previewState === 'loading' ? 'primary' : 'outline'} 
                  onClick={() => setPreviewState(previewState === 'loading' ? 'none' : 'loading')}
                >
                  Preview LoadingState
                </Button>
                <Button 
                  variant={previewState === 'empty' ? 'primary' : 'outline'} 
                  onClick={() => setPreviewState(previewState === 'empty' ? 'none' : 'empty')}
                >
                  Preview EmptyState
                </Button>
                <Button 
                  variant={previewState === 'error' ? 'primary' : 'outline'} 
                  onClick={() => setPreviewState(previewState === 'error' ? 'none' : 'error')}
                >
                  Preview ErrorState
                </Button>
              </div>

              <div style={{ backgroundColor: 'var(--color-background)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                {previewState === 'loading' && <LoadingState message="Sample loading state preview..." />}
                {previewState === 'empty' && <EmptyState title="Sample Empty State" description="No records found in this view." />}
                {previewState === 'error' && <ErrorState title="Sample Error State" message="An error occurred during request." onRetry={() => setPreviewState('none')} />}
                {previewState === 'none' && <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', textAlign: 'center' }}>Click any button above to test that component.</p>}
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
