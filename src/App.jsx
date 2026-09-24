import React, { useState } from 'react'
import { DashboardLayout } from './components/Layout/DashboardLayout'
import { PageHeader } from './components/Layout/PageHeader'
import { Button } from './components/Base/Button'
import { StatCard } from './components/Base/StatCard'
import { ComplaintCard } from './components/CampusFix/ComplaintCard'
import { ComplaintTimeline } from './components/CampusFix/ComplaintTimeline'
import { StatusBadge } from './components/CampusFix/StatusBadge'
import { PriorityBadge } from './components/CampusFix/PriorityBadge'
import { Toast, ToastContainer } from './components/Base/Toast'
import AIDemoPage from './pages/AIDemoPage'

const SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '#', icon: '📊', active: true },
  { label: 'AI Demo', href: '#ai-demo', icon: '🤖' },
  { label: 'Complaints', href: '#', icon: '📝' },
  { label: 'Settings', href: '#', icon: '⚙️' }
];

const DEMO_COMPLAINT = {
  id: 'CMP-2023-001',
  title: 'Wi-Fi not working in Library 2nd Floor',
  category: 'IT Services',
  location: 'Central Library',
  impact: 'High (Multiple students affected)',
  priority: 'HIGH',
  status: 'IN_PROGRESS',
  slaDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() // 3 hours from now
};

const DEMO_EVENTS = [
  { title: 'Complaint Received', timestamp: new Date(Date.now() - 5000000).toISOString(), author: 'Student A' },
  { title: 'Acknowledged', timestamp: new Date(Date.now() - 4000000).toISOString(), author: 'Staff B' },
  { title: 'In Progress', timestamp: new Date(Date.now() - 2000000).toISOString(), author: 'IT Team', description: 'Technician dispatched to the location.' }
];

function App() {
  const [showToast, setShowToast] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigation = (href) => {
    if (href === '#ai-demo') {
      setCurrentPage('ai-demo');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const updatedSidebarLinks = SIDEBAR_LINKS.map(link => ({
    ...link,
    active: (link.href === '#ai-demo' && currentPage === 'ai-demo') || 
           (link.href === '#' && currentPage === 'dashboard')
  }));

  if (currentPage === 'ai-demo') {
    return <AIDemoPage onNavigate={handleNavigation} />;
  }

  return (
    <DashboardLayout sidebarLinks={updatedSidebarLinks} onNavigate={handleNavigation}>
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
    </DashboardLayout>
  );
}

export default App