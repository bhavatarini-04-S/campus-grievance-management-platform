import React, { useState } from 'react';
import { Modal } from '../Base/Modal';
import { Button } from '../Base/Button';
import { Textarea, Input } from '../Base/Forms';
import styles from './ResolutionModal.module.css';

export function ResolutionModal({ isOpen, onClose, complaint, onSubmit, currentUser }) {
  const [note, setNote] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [error, setError] = useState('');

  if (!complaint) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim() || note.trim().length < 5) {
      setError('A comprehensive resolution note (at least 5 characters) is required to resolve this complaint.');
      return;
    }

    setError('');
    onSubmit(complaint.id, {
      note: note.trim(),
      attachment: attachmentName ? { name: attachmentName, url: '#' } : null
    });
    setNote('');
    setAttachmentName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Resolve Complaint: ${complaint.id}`}
      footer={
        <div className={styles.footerActions}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Confirm & Mark Resolved
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.complaintSummary}>
          <div className={styles.summaryRow}>
            <span className={styles.label}>Subject:</span>
            <span className={styles.val}>{complaint.title}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.label}>Location:</span>
            <span className={styles.val}>{complaint.location}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.label}>Resolving Handler:</span>
            <span className={styles.valHighlight}>{currentUser?.name || 'Staff Member'} ({currentUser?.title || currentUser?.role})</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.label}>Resolved At:</span>
            <span className={styles.val}>{new Date().toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <Textarea
            label="Resolution Note *"
            placeholder="Describe the corrective actions taken, parts replaced, or inspection conducted on-site..."
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (error) setError('');
            }}
            error={error}
            rows={5}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <Input
            label="Optional Attachment (Proof of Work / Photo / Report)"
            placeholder="e.g. work_order_completion_signoff.pdf or photo_repaired_conduit.jpg"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
          />
          <span className={styles.helperText}>
            Attach verifiable completion documentation for audit records.
          </span>
        </div>
      </form>
    </Modal>
  );
}
