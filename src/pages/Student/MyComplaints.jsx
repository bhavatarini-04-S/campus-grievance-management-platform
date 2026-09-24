import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/Layout/PageHeader';
import { ComplaintCard } from '../../components/CampusFix/ComplaintCard';
import { Input, Select } from '../../components/Base/Forms';
import { studentApi } from '../../api/studentMockApi';
import { useAuth } from '../../contexts/AuthContext';

export function MyComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    studentApi.getMyComplaints(user.id)
      .then(setComplaints)
      .finally(() => setLoading(false));
  }, [user.id]);

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesCategory = categoryFilter ? c.category === categoryFilter : true;
    const matchesPriority = priorityFilter ? c.priority === priorityFilter : true;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div>
      <PageHeader 
        title="My Complaints" 
        description="Track the status of all your submitted complaints."
      />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 'var(--spacing-md)', 
        marginBottom: 'var(--spacing-xl)',
        background: 'var(--color-surface)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)'
      }}>
        <Input 
          placeholder="Search by title or location..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <Select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          options={[
            { label: 'All Statuses', value: '' },
            { label: 'Received', value: 'RECEIVED' },
            { label: 'Acknowledged', value: 'ACKNOWLEDGED' },
            { label: 'In Progress', value: 'IN_PROGRESS' },
            { label: 'Resolved', value: 'RESOLVED' }
          ]}
        />
        <Select 
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          options={[
            { label: 'All Categories', value: '' },
            { label: 'Internet/Wi-Fi', value: 'Internet/Wi-Fi' },
            { label: 'Water', value: 'Water' },
            { label: 'Electricity', value: 'Electricity' }
          ]}
        />
        <Select 
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          options={[
            { label: 'All Priorities', value: '' },
            { label: 'Low', value: 'LOW' },
            { label: 'Medium', value: 'MEDIUM' },
            { label: 'High', value: 'HIGH' },
            { label: 'Critical', value: 'CRITICAL' }
          ]}
        />
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      ) : filteredComplaints.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', color: 'var(--color-muted)' }}>
          No complaints found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {filteredComplaints.map(complaint => (
            <Link key={complaint.id} to={`/student/complaints/${complaint.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ComplaintCard complaint={complaint} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
