import React from 'react';
import { Badge } from '../Base/Badge';

const STATUS_MAP = {
  RECEIVED: { label: 'Received', variant: 'info' },
  ACKNOWLEDGED: { label: 'Acknowledged', variant: 'primary' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  RESOLVED: { label: 'Resolved', variant: 'success' },
  SLA_BREACHED: { label: 'SLA Breached', variant: 'danger' }
};

export function StatusBadge({ status, className = '' }) {
  const config = STATUS_MAP[status] || { label: status, variant: 'muted' };
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
