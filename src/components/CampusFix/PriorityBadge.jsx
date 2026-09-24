import React from 'react';
import { Badge } from '../Base/Badge';

const PRIORITY_MAP = {
  LOW: { label: 'Low', variant: 'muted', icon: '🟢' },
  MEDIUM: { label: 'Medium', variant: 'warning', icon: '🟡' },
  HIGH: { label: 'High', variant: 'warning', icon: '🟠' },
  CRITICAL: { label: 'Critical', variant: 'danger', icon: '🔴' }
};

export function PriorityBadge({ priority, score, showScore = false, className = '' }) {
  const config = PRIORITY_MAP[priority?.toUpperCase()] || { label: priority, variant: 'muted', icon: '⚪' };
  
  return (
    <Badge 
      variant={config.variant} 
      className={className}
      title={score ? `Priority Score: ${score}/100` : undefined}
    >
      <span style={{ marginRight: '4px', fontSize: '0.75rem' }}>{config.icon}</span>
      {config.label}
      {showScore && score !== undefined && (
        <span style={{ marginLeft: '4px', opacity: 0.85, fontWeight: '700' }}>({score})</span>
      )}
    </Badge>
  );
}
