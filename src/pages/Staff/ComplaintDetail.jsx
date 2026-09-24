import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Card } from '../../components/Base/Card';
import { Button } from '../../components/Base/Button';
import { StatusBadge } from '../../components/CampusFix/StatusBadge';
import { PriorityBadge } from '../../components/CampusFix/PriorityBadge';
import { SLATimer } from '../../components/CampusFix/SLATimer';
import { ComplaintTimeline } from '../../components/CampusFix/ComplaintTimeline';
import { Input, Textarea } from '../../components/Base/Forms';
import { getStaffComplaintDetail, updateComplaintStatus, assignComplaint, resolveComplaint } from '../../api/staffMockApi';
import { useAuth } from '../../contexts/AuthContext';

export function StaffComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    try {
      setLoading(true);
      const data = await getStaffComplaintDetail(id);
      if (!data) throw new Error('Complaint not found');
      setComplaint(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      if (newStatus === 'RESOLVED') {
        if (!note) return alert('Please provide a resolution note.');
        await resolveComplaint(id, note);
      } else {
        await updateComplaintStatus(id, newStatus);
      }
      setNote('');
      await loadComplaint();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignToMe = async () => {
    try {
      await assignComplaint(id, user.id);
      await loadComplaint();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{padding: 'var(--spacing-xl)'}}>Loading details...</div>;
  if (error) return <div style={{padding: 'var(--spacing-xl)', color: 'var(--color-danger)'}}>Error: {error}</div>;

  const isAssignedToMe = complaint.assigned_to === user.id;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Button variant="outline" onClick={() => navigate('/staff')} style={{ marginBottom: 'var(--spacing-md)' }}>
        &larr; Back to Dashboard
      </Button>

      <PageHeader
        title={complaint.title}
        description={`ID: ${complaint.id} | Created: ${new Date(complaint.created_at).toLocaleString()}`}
      />

      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
        {complaint.escalation_status && (
          <span style={{ background: 'var(--color-danger)', color: 'white', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600 }}>
            ESCALATED: {complaint.escalation_status}
          </span>
        )}
      </div>

      <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div>
            <strong>Category:</strong> <div>{complaint.category}</div>
          </div>
          <div>
            <strong>Location:</strong> <div>{complaint.location}</div>
          </div>
          <div>
            <strong>Reporter:</strong> <div>{complaint.is_anonymous ? 'Anonymous' : complaint.student_id}</div>
          </div>
          <div>
            <strong>Assigned To:</strong> <div>{complaint.assigned_to || 'Unassigned'}</div>
          </div>
        </div>
        <hr style={{ margin: 'var(--spacing-md) 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
        <div>
          <strong>Description:</strong>
          <p style={{ marginTop: 'var(--spacing-xs)' }}>{complaint.description}</p>
        </div>
      </Card>

      <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Priority & SLA Engine</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div>
            <strong>Priority Reasons ({complaint.priority_score}/100):</strong>
            <ul style={{ paddingLeft: 'var(--spacing-lg)', marginTop: 'var(--spacing-xs)', fontSize: '0.875rem' }}>
              {complaint.priority_reasons?.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>SLA Deadline:</strong>
            <div style={{ marginTop: 'var(--spacing-xs)' }}>
              <SLATimer deadline={complaint.sla_deadline} createdAt={complaint.created_at} />
            </div>
          </div>
        </div>
      </Card>

      {/* Staff Action Panel */}
      {complaint.status !== 'RESOLVED' && (
        <Card style={{ marginBottom: 'var(--spacing-lg)', borderLeft: '4px solid var(--color-primary)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Staff Actions</h3>

          <div className="flex gap-md" style={{ marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
            {!isAssignedToMe && (
              <Button variant="primary" onClick={handleAssignToMe}>Assign to Me</Button>
            )}

            {isAssignedToMe && (
              <>
                {complaint.status === 'RECEIVED' && (
                  <Button variant="primary" onClick={() => handleStatusChange('ACKNOWLEDGED')}>Acknowledge</Button>
                )}
                {(complaint.status === 'ACKNOWLEDGED' || complaint.status === 'SLA_BREACHED') && (
                  <Button variant="primary" onClick={() => handleStatusChange('IN_PROGRESS')}>Start Work</Button>
                )}
              </>
            )}
          </div>

          {isAssignedToMe && (complaint.status === 'IN_PROGRESS' || complaint.status === 'ACKNOWLEDGED' || complaint.status === 'SLA_BREACHED') && (
            <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
              <Textarea
                label="Resolution Note / Internal Note"
                placeholder="Enter details before resolving..."
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ marginBottom: 'var(--spacing-md)' }}
              />
              <Button variant="primary" style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }} onClick={() => handleStatusChange('RESOLVED')}>
                Mark as Resolved
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Timeline (mocked static events for now, but in reality we'd pull these from the API) */}
      <h3 className="section-title" style={{ marginBottom: 'var(--spacing-md)' }}>Activity Timeline</h3>
      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <ComplaintTimeline
          events={[
            { title: 'Complaint Received', timestamp: complaint.created_at, author: 'System' },
            ...(complaint.assigned_to ? [{ title: 'Assigned', timestamp: complaint.created_at, author: 'System', description: `Assigned to ${complaint.assigned_to}` }] : []),
            ...(complaint.status === 'RESOLVED' ? [{ title: 'Resolved', timestamp: complaint.resolved_at || new Date().toISOString(), author: complaint.assigned_to }] : [])
          ]}
        />
      </div>
    </div>
  );
}
