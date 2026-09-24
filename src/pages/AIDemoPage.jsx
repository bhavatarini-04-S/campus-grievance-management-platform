import React, { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { PageHeader } from '../components/Layout/PageHeader';
import { Button } from '../components/Base/Button';
import { StatCard } from '../components/Base/StatCard';
import { Card, CardHeader, CardBody } from '../components/Base/Card';
import { Badge } from '../components/Base/Badge';
import { Toast, ToastContainer } from '../components/Base/Toast';
import { Modal } from '../components/Base/Modal';
import { Input, Textarea, Select } from '../components/Base/Forms';
import { DuplicateWarning } from '../components/CampusFix/DuplicateWarning';
import { DuplicateMatchCard } from '../components/CampusFix/DuplicateMatchCard';
import { ComplaintCluster } from '../components/CampusFix/ComplaintCluster';
import { SupportButton } from '../components/CampusFix/SupportButton';
import { ImpactBadge } from '../components/CampusFix/ImpactBadge';
import { TrendingComplaintCard } from '../components/CampusFix/TrendingComplaintCard';
import aiDetectionService from '../services/aiDetectionService';

const SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '#', icon: '📊' },
  { label: 'AI Demo', href: '#', icon: '🤖', active: true },
  { label: 'Complaints', href: '#', icon: '📝' },
  { label: 'Settings', href: '#', icon: '⚙️' }
];

// Demo data for AI features
const DEMO_COMPLAINTS = [
  {
    id: 'CMP-2023-001',
    title: 'Wi-Fi not working in Library 2nd Floor',
    description: 'The Wi-Fi connection is completely down on the 2nd floor of the Central Library. Students are unable to access online resources.',
    category: 'IT Services',
    location: 'Central Library',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    support_count: 8,
    isSensitive: false
  },
  {
    id: 'CMP-2023-002',
    title: 'Internet unavailable in Library',
    description: 'No internet connectivity in the Central Library building. Both Wi-Fi and wired connections are affected.',
    category: 'IT Services',
    location: 'Central Library',
    priority: 'HIGH',
    status: 'RECEIVED',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    support_count: 3,
    isSensitive: false
  },
  {
    id: 'CMP-2023-003',
    title: 'Broken fan in Room 201',
    description: 'The ceiling fan in Room 201, Block A is broken and making noise. Need repair.',
    category: 'Infrastructure',
    location: 'Block A Room 201',
    priority: 'MEDIUM',
    status: 'RECEIVED',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    support_count: 1,
    isSensitive: false
  },
  {
    id: 'CMP-2023-004',
    title: 'WiFi down in Block C',
    description: 'WiFi is not working in Block C near the hostel area.',
    category: 'IT Services',
    location: 'Block C',
    priority: 'HIGH',
    status: 'ACKNOWLEDGED',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    support_count: 5,
    isSensitive: false
  },
  {
    id: 'CMP-2023-005',
    title: 'No internet in C block',
    description: 'Internet connectivity is lost in C block hostel area.',
    category: 'IT Services',
    location: 'Block C Hostel',
    priority: 'HIGH',
    status: 'RECEIVED',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    support_count: 2,
    isSensitive: false
  }
];

function AIDemoPage({ onNavigate }) {
  const [duplicateCheck, setDuplicateCheck] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showCluster, _setShowCluster] = useState(true);
  const [currentUserId] = useState('student-123');
  const [toast, setToast] = useState(null);
  const [showNewComplaintModal, setShowNewComplaintModal] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: 'IT Services',
    location: '',
    priority: 'MEDIUM'
  });
  
  // Initialize AI service with demo data directly in component body
  const [complaints, setComplaints] = useState(() => {
    aiDetectionService.initialize(DEMO_COMPLAINTS);
    aiDetectionService.createCluster('CMP-2023-001', ['CMP-2023-002']);
    return DEMO_COMPLAINTS;
  });
  
  const [trendingComplaints, setTrendingComplaints] = useState(() => {
    return aiDetectionService.getTrendingComplaints({ limit: 5 });
  });

  const handleCheckDuplicate = () => {
    const testComplaint = {
      title: 'Internet not working in Central Library',
      description: 'Students are reporting no internet access in the library building.',
      category: 'IT Services',
      location: 'Central Library',
      createdAt: new Date().toISOString()
    };

    const result = aiDetectionService.checkDuplicate(testComplaint);
    setDuplicateCheck(result);
  };

  const handleNewComplaintChange = (field, value) => {
    setNewComplaint(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckDuplicateForNew = () => {
    const complaintToCheck = {
      ...newComplaint,
      createdAt: new Date().toISOString()
    };

    const result = aiDetectionService.checkDuplicate(complaintToCheck);
    setDuplicateCheck(result);
    
    if (!result.is_duplicate) {
      // If no duplicate, submit the complaint
      const addedComplaint = aiDetectionService.addComplaint(complaintToCheck);
      const updatedComplaints = [...complaints, addedComplaint];
      setComplaints(updatedComplaints);
      aiDetectionService.initialize(updatedComplaints);
      
      const updatedTrending = aiDetectionService.getTrendingComplaints({ limit: 5 });
      setTrendingComplaints(updatedTrending);
      
      setToast({ message: 'Complaint submitted successfully!', type: 'success' });
      setShowNewComplaintModal(false);
      setNewComplaint({
        title: '',
        description: '',
        category: 'IT Services',
        location: '',
        priority: 'MEDIUM'
      });
    }
  };

  const handleSubmitAnyway = () => {
    const addedComplaint = aiDetectionService.addComplaint({
      ...newComplaint,
      createdAt: new Date().toISOString()
    });
    
    const updatedComplaints = [...complaints, addedComplaint];
    setComplaints(updatedComplaints);
    aiDetectionService.initialize(updatedComplaints);
    
    const updatedTrending = aiDetectionService.getTrendingComplaints({ limit: 5 });
    setTrendingComplaints(updatedTrending);
    
    setToast({ message: 'Complaint submitted successfully!', type: 'success' });
    setDuplicateCheck(null);
    setShowNewComplaintModal(false);
    setNewComplaint({
      title: '',
      description: '',
      category: 'IT Services',
      location: '',
      priority: 'MEDIUM'
    });
  };

  const handleContinueSubmit = () => {
    handleSubmitAnyway();
  };

  const handleViewExisting = () => {
    if (duplicateCheck?.matches?.[0]) {
      setSelectedMatch(duplicateCheck.matches[0].complaint_id);
    }
  };

  const handleMerge = (complaintId) => {
    // Add the new complaint as a duplicate of the existing one
    const addedComplaint = aiDetectionService.addComplaint({
      ...newComplaint,
      createdAt: new Date().toISOString(),
      duplicate_of: complaintId,
      is_primary: false
    });
    
    // Add to cluster if exists
    const existingComplaint = aiDetectionService.getComplaint(complaintId);
    if (existingComplaint.cluster_id) {
      addedComplaint.cluster_id = existingComplaint.cluster_id;
    }
    
    const updatedComplaints = [...complaints, addedComplaint];
    setComplaints(updatedComplaints);
    aiDetectionService.initialize(updatedComplaints);
    
    const updatedTrending = aiDetectionService.getTrendingComplaints({ limit: 5 });
    setTrendingComplaints(updatedTrending);
    
    setToast({ message: `Complaint merged with existing report`, type: 'success' });
    setDuplicateCheck(null);
    setShowNewComplaintModal(false);
    setNewComplaint({
      title: '',
      description: '',
      category: 'IT Services',
      location: '',
      priority: 'MEDIUM'
    });
  };

  const handleSupport = (complaint) => {
    const result = aiDetectionService.addUpvote(complaint.id, currentUserId);
    if (result.success) {
      const updatedComplaints = complaints.map(c => 
        c.id === complaint.id 
          ? { ...c, support_count: result.support_count, user_has_upvoted: true }
          : c
      );
      setComplaints(updatedComplaints);
      aiDetectionService.initialize(updatedComplaints);
      
      // Update trending complaints as well
      const updatedTrending = aiDetectionService.getTrendingComplaints({ limit: 5 });
      setTrendingComplaints(updatedTrending);
      
      setToast({ message: 'Thanks for supporting this issue!', type: 'success' });
    } else {
      setToast({ message: 'You have already supported this issue', type: 'warning' });
    }
  };

  const handleRemoveSupport = (complaintId, userId) => {
    const result = aiDetectionService.removeUpvote(complaintId, userId);
    if (result.success) {
      const updatedComplaints = complaints.map(c => 
        c.id === complaintId 
          ? { ...c, support_count: result.support_count, user_has_upvoted: false }
          : c
      );
      setComplaints(updatedComplaints);
      aiDetectionService.initialize(updatedComplaints);
      
      // Update trending complaints as well
      const updatedTrending = aiDetectionService.getTrendingComplaints({ limit: 5 });
      setTrendingComplaints(updatedTrending);
      
      setToast({ message: 'Support removed', type: 'info' });
    }
  };

  const getComplaintById = (id) => {
    return complaints.find(c => c.id === id) || aiDetectionService.getComplaint(id);
  };

  const handleNavigation = (href) => {
    if (onNavigate) {
      onNavigate(href);
    }
  };

  const updatedSidebarLinks = SIDEBAR_LINKS.map(link => ({
    ...link,
    active: link.href === '#ai-demo'
  }));

  return (
    <DashboardLayout 
      sidebarLinks={updatedSidebarLinks} 
      onNavigate={handleNavigation}
    >
      <PageHeader 
        title="AI Duplicate Detection Demo" 
        description="Experience the power of AI-driven complaint management"
        actions={
          <div className="flex gap-sm">
            <Button variant="outline" onClick={() => handleNavigation('#')}>
              ← Back to Dashboard
            </Button>
            <Button variant="secondary" onClick={() => setShowNewComplaintModal(true)}>
              + New Complaint
            </Button>
            <Button variant="primary" onClick={handleCheckDuplicate}>
              Test Duplicate Detection
            </Button>
          </div>
        }
      />

      {/* Duplicate Warning Demo */}
      {duplicateCheck && (
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <DuplicateWarning 
            duplicateCheck={duplicateCheck}
            onContinue={handleContinueSubmit}
            onViewExisting={handleViewExisting}
            onMerge={showNewComplaintModal ? handleMerge : undefined}
          />
          
          {duplicateCheck.matches.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <h3 className="section-title" style={{ marginBottom: 'var(--spacing-md)' }}>
                Potential Matches
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
                {duplicateCheck.matches.map((match) => {
                  const complaint = getComplaintById(match.complaint_id);
                  return complaint ? (
                    <DuplicateMatchCard
                      key={match.complaint_id}
                      match={match}
                      complaint={complaint}
                      onSelect={setSelectedMatch}
                    />
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <StatCard title="Total Complaints" value={complaints.length} trend={5} icon="📋" />
        <StatCard title="Duplicates Detected" value="2" trend={0} icon="🔍" />
        <StatCard title="Active Clusters" value="1" trend={1} icon="🎯" />
        <StatCard title="Total Supporters" value="19" trend={8} icon="👍" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-lg)' }}>
        {/* Complaint Cluster Demo */}
        <div>
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-md)' }}>
            Complaint Clustering
          </h3>
          {showCluster && (() => {
            const cluster = aiDetectionService.getCluster(Object.keys(aiDetectionService.clusters)[0]);
            if (cluster) {
              const clusterComplaints = aiDetectionService.getClusterComplaints(cluster.id);
              return (
                <ComplaintCluster
                  cluster={cluster}
                  complaints={clusterComplaints}
                  onComplaintClick={(complaint) => setSelectedMatch(complaint.id)}
                />
              );
            }
            return null;
          })()}
        </div>

        {/* Impact & Support Demo */}
        <div>
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-md)' }}>
            Impact Analysis & Support
          </h3>
          <Card>
            <CardHeader title="Impact Analysis Demo" />
            <CardBody>
              {complaints.slice(0, 3).map(complaint => {
                const impact = aiDetectionService.getImpactInfo(complaint);
                return (
                  <div key={complaint.id} style={{ 
                    padding: 'var(--spacing-md)', 
                    borderBottom: '1px solid var(--color-border)',
                    marginBottom: 'var(--spacing-sm)' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
                      <div>
                        <h4 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '0.875rem' }}>
                          {complaint.title}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                          {complaint.location}
                        </span>
                      </div>
                      <ImpactBadge impact={impact} showExplanation />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <SupportButton
                        complaint={complaint}
                        userId={currentUserId}
                        onUpvote={handleSupport}
                        onRemoveUpvote={handleRemoveSupport}
                      />
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Trending Complaints */}
      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        <h3 className="section-title" style={{ marginBottom: 'var(--spacing-md)' }}>
          Trending Complaints
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {trendingComplaints.map((complaint, index) => {
            const impact = aiDetectionService.getImpactInfo(complaint);
            const enrichedComplaint = { ...complaint, impact };
            return (
              <TrendingComplaintCard
                key={complaint.id}
                complaint={enrichedComplaint}
                rank={index + 1}
                onViewDetails={(c) => setSelectedMatch(c.id)}
                onSupport={handleSupport}
              />
            );
          })}
        </div>
      </div>

      {/* Selected Complaint Detail */}
      {selectedMatch && (
        <div style={{ marginTop: 'var(--spacing-xl)' }}>
          <Card>
            <CardHeader title="Complaint Details" />
            <CardBody>
              {(() => {
                const complaint = getComplaintById(selectedMatch);
                if (!complaint) return <p>Complaint not found</p>;
                
                const impact = aiDetectionService.getImpactInfo(complaint);
                const duplicates = aiDetectionService.getDuplicates(selectedMatch);
                
                return (
                  <div>
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>{complaint.title}</h3>
                    <p style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-md)' }}>
                      {complaint.description}
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                      <div>
                        <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Category:</span>
                        <div><Badge variant="info">{complaint.category}</Badge></div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Location:</span>
                        <div>{complaint.location}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Status:</span>
                        <div><Badge variant="warning">{complaint.status}</Badge></div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Priority:</span>
                        <div><Badge variant={complaint.priority === 'HIGH' ? 'warning' : 'muted'}>{complaint.priority}</Badge></div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                      <ImpactBadge impact={impact} showScore showExplanation />
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                      <SupportButton
                        complaint={complaint}
                        userId={currentUserId}
                        onUpvote={handleSupport}
                        onRemoveUpvote={handleRemoveSupport}
                      />
                    </div>

                    {duplicates.length > 0 && (
                      <div>
                        <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Linked Duplicates ({duplicates.length})</h4>
                        {duplicates.map(dup => (
                          <div key={dup.id} style={{ padding: 'var(--spacing-sm)', background: 'var(--color-background)', marginBottom: 'var(--spacing-xs)', borderRadius: 'var(--radius-sm)' }}>
                            {dup.title} - {dup.location}
                          </div>
                        ))}
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedMatch(null)}
                      style={{ marginTop: 'var(--spacing-md)' }}
                    >
                      Close Details
                    </Button>
                  </div>
                );
              })()}
            </CardBody>
          </Card>
        </div>
      )}

      {toast && (
        <ToastContainer>
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        </ToastContainer>
      )}

      {/* New Complaint Modal */}
      {showNewComplaintModal && (
        <Modal
          title="Submit New Complaint"
          onClose={() => setShowNewComplaintModal(false)}
          isOpen={showNewComplaintModal}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                Title *
              </label>
              <Input
                value={newComplaint.title}
                onChange={(e) => handleNewComplaintChange('title', e.target.value)}
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                Description *
              </label>
              <Textarea
                value={newComplaint.description}
                onChange={(e) => handleNewComplaintChange('description', e.target.value)}
                placeholder="Detailed description of the issue"
                rows={4}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                Category *
              </label>
              <Select
                value={newComplaint.category}
                onChange={(e) => handleNewComplaintChange('category', e.target.value)}
              >
                <option value="IT Services">IT Services</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Security">Security</option>
                <option value="Food Services">Food Services</option>
                <option value="Academic">Academic</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                Location *
              </label>
              <Input
                value={newComplaint.location}
                onChange={(e) => handleNewComplaintChange('location', e.target.value)}
                placeholder="Building, room, or area"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                Priority
              </label>
              <Select
                value={newComplaint.priority}
                onChange={(e) => handleNewComplaintChange('priority', e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
              <Button
                variant="outline"
                onClick={() => setShowNewComplaintModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCheckDuplicateForNew}
                disabled={!newComplaint.title || !newComplaint.description || !newComplaint.location}
                style={{ flex: 1 }}
              >
                Submit Complaint
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}

export default AIDemoPage;