import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/Layout/PageHeader';
import { Card, CardBody } from '../../components/Base/Card';
import { Button } from '../../components/Base/Button';
import { Input, Textarea, Select } from '../../components/Base/Forms';
import { studentApi } from '../../api/studentMockApi';
import { useAuth } from '../../contexts/AuthContext';
import { ComplaintCard } from '../../components/CampusFix/ComplaintCard';
import { ToastContainer, Toast } from '../../components/Base/Toast';
import { Modal } from '../../components/Base/Modal';

const CATEGORIES = [
  { label: 'Select Category', value: '' },
  { label: 'Internet/Wi-Fi', value: 'Internet/Wi-Fi' },
  { label: 'Electricity', value: 'Electricity' },
  { label: 'Water', value: 'Water' },
  { label: 'Hostel', value: 'Hostel' },
  { label: 'Classroom', value: 'Classroom' },
  { label: 'Laboratory', value: 'Laboratory' },
  { label: 'Transport', value: 'Transport' },
  { label: 'Cleanliness', value: 'Cleanliness' },
  { label: 'Food/Canteen', value: 'Food/Canteen' },
  { label: 'Security', value: 'Security' },
  { label: 'Academic', value: 'Academic' },
  { label: 'Other', value: 'Other' },
];

export function SubmitComplaint() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    is_anonymous: false,
    is_sensitive: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const duplicateCheck = await studentApi.checkDuplicate(formData.title, formData.location);
      if (duplicateCheck.isPossibleDuplicate) {
        setDuplicateWarning(duplicateCheck);
      } else {
        await proceedWithSubmission();
      }
    } catch (err) {
      setToast({ message: 'Error checking duplicate', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const proceedWithSubmission = async () => {
    setIsSubmitting(true);
    try {
      const newComplaint = await studentApi.submitComplaint(formData, user.id);
      setToast({ message: 'Complaint submitted successfully!', type: 'success' });
      setTimeout(() => {
        navigate(`/student/complaints/${newComplaint.id}`);
      }, 1500);
    } catch (err) {
      setToast({ message: 'Error submitting complaint', type: 'error' });
      setIsSubmitting(false);
    }
  };

  const handleUpvoteExisting = async () => {
    try {
      await studentApi.upvoteComplaint(duplicateWarning.existingComplaint.id, user.id);
      setToast({ message: 'Successfully supported existing complaint!', type: 'success' });
      setTimeout(() => {
        navigate(`/student/complaints/${duplicateWarning.existingComplaint.id}`);
      }, 1500);
    } catch (err) {
      setToast({ message: 'Failed to support complaint', type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader 
        title="Submit a Complaint" 
        description="Help us improve the campus by reporting an issue."
      />

      <Card>
        <CardBody>
          <form onSubmit={handleInitialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <Input 
              label="Title" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="E.g., Wi-Fi not working in Block C"
            />
            
            <Select 
              label="Category" 
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORIES}
              error={errors.category}
            />

            <Input 
              label="Location" 
              name="location"
              value={formData.location}
              onChange={handleChange}
              error={errors.location}
              placeholder="E.g., Block C, 2nd Floor"
            />

            <Textarea 
              label="Description" 
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Please provide detailed information..."
            />

            <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', marginBottom: 'var(--spacing-sm)' }}>
                <input 
                  type="checkbox" 
                  name="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={handleChange}
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                <span style={{ fontWeight: 500 }}>Submit Anonymously</span>
              </label>
              {formData.is_anonymous && (
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-muted)', marginLeft: '1.7rem', marginTop: 0 }}>
                  Your identity will be protected from normal complaint viewers. Your name and details will not appear on public dashboards.
                </p>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', marginTop: 'var(--spacing-md)' }}>
                <input 
                  type="checkbox" 
                  name="is_sensitive"
                  checked={formData.is_sensitive}
                  onChange={handleChange}
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                <span style={{ fontWeight: 500 }}>Mark as Sensitive Complaint</span>
              </label>
              {formData.is_sensitive && (
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--color-muted)', marginLeft: '1.7rem', marginTop: 'var(--spacing-xs)', marginBottom: 0 }}>
                  Sensitive complaints will be routed directly to authorized authorities and will NOT appear in public or trending areas.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
              <Button type="button" variant="outline" onClick={() => navigate('/student')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Submit Complaint'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {duplicateWarning && (
        <Modal 
          isOpen={true} 
          onClose={() => setDuplicateWarning(null)} 
          title="Similar Complaint Found!"
        >
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ color: 'var(--color-muted)', marginBottom: 'var(--spacing-md)' }}>
              We found an existing complaint that looks similar to yours ({duplicateWarning.similarity}% match). Supporting it will escalate the issue faster.
            </p>
            
            <div style={{ background: 'var(--color-background)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
              <h4 style={{ margin: '0 0 var(--spacing-xs) 0' }}>{duplicateWarning.existingComplaint.title}</h4>
              <p style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-muted)', fontSize: '0.9rem' }}>
                📍 {duplicateWarning.existingComplaint.location}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--color-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
                👥 {duplicateWarning.existingComplaint.support_count} students already reported this
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <Button variant="primary" onClick={handleUpvoteExisting}>
                Support Existing Complaint
              </Button>
              <Button variant="outline" onClick={proceedWithSubmission} disabled={isSubmitting}>
                Continue Submitting Mine
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <ToastContainer>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </ToastContainer>
      )}
    </div>
  );
}
