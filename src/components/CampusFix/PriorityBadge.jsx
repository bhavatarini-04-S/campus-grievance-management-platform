import React from 'react';
import { Badge } from '../Base/Badge';

const PRIORITY_MAP = {
  LOW: { label: 'Low', variant: 'muted' },
  MEDIUM: { label: 'Medium', variant: 'warning' },
  HIGH: { label: 'High', variant: 'warning' },
  CRITICAL: { label: 'Critical', variant: 'danger' }
};

export function PriorityBadge({ priority, className = '' }) {
  const config = PRIORITY_MAP[priority] || { label: priority, variant: 'muted' };
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
