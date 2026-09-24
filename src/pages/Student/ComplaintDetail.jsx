import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/Base/Card';
import { Button } from '../../components/Base/Button';
import { StatusBadge } from '../../components/CampusFix/StatusBadge';
import { PriorityBadge } from '../../components/CampusFix/PriorityBadge';
import { SLATimer } from '../../components/CampusFix/SLATimer';
import { ComplaintTimeline } from '../../components/CampusFix/ComplaintTimeline';
import { studentApi } from '../../api/studentMockApi';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContainer, Toast } from '../../components/Base/Toast';

export function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isUpvoting, setIsUpvoting] = useState(false);

  useEffect(() => {
    studentApi.getComplaintDetail(id)
      .then(setComplaint)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpvote = async () => {
    setIsUpvoting(true);
    try {
      const updated = await studentApi.upvoteComplaint(id, user.id);
      setComplaint(updated);
      setToast({ message: 'Successfully supported complaint!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error supporting complaint', type: 'error' });
    } finally {
      setIsUpvoting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading complaint details...</div>;
  if (error || !complaint) return <div style={{ padding: '2rem', color: 'var(--color-danger)' }}>Complaint not found.</div>;

  const mockTimelineEvents = [
    { title: 'Complaint Received', timestamp: complaint.created_at, author: complaint.is_anonymous ? 'Anonymous' : 'Student' }
  ];
  if (complaint.status === 'ACKNOWLEDGED' || complaint.status === 'IN_PROGRESS' || complaint.status === 'RESOLVED') {
    mockTimelineEvents.push({ title: 'Acknowledged', timestamp: new Date(new Date(complaint.created_at).getTime() + 3600000).toISOString(), author: 'System' });
  }
  if (complaint.status === 'IN_PROGRESS' || complaint.status === 'RESOLVED') {
    mockTimelineEvents.push({ title: 'In Progress', timestamp: complaint.updated_at, author: complaint.assigned_to || 'Assigned Staff', description: 'Working on resolving the issue.' });
  }
  if (complaint.status === 'RESOLVED') {
    mockTimelineEvents.push({ title: 'Resolved', timestamp: complaint.resolved_at || new Date().toISOString(), author: complaint.assigned_to || 'Assigned Staff' });
  }

  const isMyComplaint = complaint.student_id === user.id;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader 
        title={complaint.title} 
        description={`ID: ${complaint.id} | Created: ${new Date(complaint.created_at).toLocaleDateString()}`}
        actions={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
            {!isMyComplaint && complaint.status !== 'RESOLVED' && (
              <Button variant="primary" onClick={handleUpvote} disabled={isUpvoting}>
                {isUpvoting ? 'Supporting...' : `Support (${complaint.support_count})`}
              </Button>
            )}
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <Card>
            <CardHeader title="Description" />
            <CardBody>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>
                {complaint.description}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Status Timeline" />
            <CardBody>
              <ComplaintTimeline events={mockTimelineEvents} />
            </CardBody>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <Card>
            <CardHeader title="Details" />
            <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div>
                <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Status</span>
                <StatusBadge status={complaint.status} />
              </div>
              
              <div>
                <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Priority</span>
                <PriorityBadge priority={complaint.priority} />
                {complaint.priority_score && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginLeft: '8px' }}>Score: {complaint.priority_score}</span>
                )}
              </div>

              {complaint.sla_deadline && complaint.status !== 'RESOLVED' && (
                <div>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>SLA Target</span>
                  <SLATimer deadline={complaint.sla_deadline} />
                </div>
              )}

              <div style={{ height: '1px', background: 'var(--color-border)', margin: 'var(--spacing-sm) 0' }}></div>

              <div>
                <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem', display: 'block' }}>Category</span>
                <div style={{ fontWeight: 500 }}>{complaint.category}</div>
              </div>

              <div>
                <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem', display: 'block' }}>Location</span>
                <div style={{ fontWeight: 500 }}>{complaint.location}</div>
              </div>

              <div>
                <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem', display: 'block' }}>Assigned Department</span>
                <div style={{ fontWeight: 500 }}>{complaint.department || 'Unassigned'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem', display: 'block' }}>Total Support</span>
                <div style={{ fontWeight: 500 }}>{complaint.support_count} students affected</div>
              </div>
              
              {complaint.is_sensitive && (
                <div style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-sm)', background: 'var(--color-danger)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', textAlign: 'center' }}>
                  🔒 Marked as Sensitive
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {toast && (
        <ToastContainer>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </ToastContainer>
      )}
    </div>
  );
}
