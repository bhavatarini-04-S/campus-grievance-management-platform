import { useContext } from 'react';
import { ComplaintContext } from './complaintContextDef';

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
}
