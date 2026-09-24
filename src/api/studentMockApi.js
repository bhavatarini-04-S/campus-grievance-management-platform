export const MOCK_COMPLAINTS = [
  {
    id: 'CMP-2023-001',
    student_id: 'STU-001',
    title: 'Wi-Fi not working in Library 2nd Floor',
    description: 'The Wi-Fi network Campus_Secure is not connecting for the past 2 days in the central library 2nd floor.',
    category: 'Internet/Wi-Fi',
    location: 'Central Library',
    department: 'IT Services',
    priority: 'HIGH',
    priority_score: 85,
    status: 'IN_PROGRESS',
    is_anonymous: false,
    is_sensitive: false,
    duplicate_of: null,
    cluster_id: 'CL-01',
    support_count: 12,
    impact_score: 90,
    assigned_to: 'IT Support',
    sla_deadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'CMP-2023-002',
    student_id: 'STU-001',
    title: 'Water cooler leaking in Block A',
    description: 'Continuous water leakage from the cooler near room 105 in Block A.',
    category: 'Water',
    location: 'Block A, 1st Floor',
    department: 'Maintenance',
    priority: 'MEDIUM',
    priority_score: 50,
    status: 'RECEIVED',
    is_anonymous: false,
    is_sensitive: false,
    duplicate_of: null,
    cluster_id: null,
    support_count: 3,
    impact_score: 30,
    assigned_to: null,
    sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'CMP-2023-003',
    student_id: 'STU-999',
    title: 'Internet not working near Hostel C',
    description: 'Hostel C internet is down for everyone.',
    category: 'Internet/Wi-Fi',
    location: 'Hostel C',
    department: 'IT Services',
    priority: 'HIGH',
    status: 'ACKNOWLEDGED',
    is_anonymous: false,
    is_sensitive: false,
    support_count: 5,
    impact_score: 70,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];

let complaintsData = [...MOCK_COMPLAINTS];

export const studentApi = {
  getStudentDashboardData: async (studentId) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const myComplaints = complaintsData.filter(c => c.student_id === studentId);
    
    return {
      total: myComplaints.length,
      open: myComplaints.filter(c => c.status === 'RECEIVED' || c.status === 'ACKNOWLEDGED').length,
      inProgress: myComplaints.filter(c => c.status === 'IN_PROGRESS').length,
      resolved: myComplaints.filter(c => c.status === 'RESOLVED').length,
      recent: myComplaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3),
      trending: complaintsData.filter(c => c.status !== 'RESOLVED' && !c.is_sensitive).sort((a, b) => b.support_count - a.support_count).slice(0, 3)
    };
  },

  getMyComplaints: async (studentId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return complaintsData.filter(c => c.student_id === studentId);
  },

  getComplaintDetail: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const complaint = complaintsData.find(c => c.id === id);
    if (!complaint) throw new Error('Not found');
    return complaint;
  },

  checkDuplicate: async (title, location) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Very simple mock logic for duplicates
    if (title.toLowerCase().includes('wifi') || title.toLowerCase().includes('internet')) {
      const existing = complaintsData.find(c => c.category === 'Internet/Wi-Fi');
      if (existing) {
        return {
          isPossibleDuplicate: true,
          similarity: 91,
          existingComplaint: {
            id: existing.id,
            title: existing.title,
            location: existing.location,
            support_count: existing.support_count,
            status: existing.status
          }
        };
      }
    }
    return { isPossibleDuplicate: false };
  },

  submitComplaint: async (data, studentId) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newComplaint = {
      id: `CMP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      student_id: studentId,
      ...data,
      priority: 'MEDIUM',
      status: 'RECEIVED',
      support_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    };
    complaintsData.unshift(newComplaint);
    return newComplaint;
  },

  upvoteComplaint: async (id, studentId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = complaintsData.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Not found');
    
    // Create new object reference for state updates
    const updated = { ...complaintsData[index], support_count: complaintsData[index].support_count + 1 };
    complaintsData[index] = updated;
    return updated;
  }
};
