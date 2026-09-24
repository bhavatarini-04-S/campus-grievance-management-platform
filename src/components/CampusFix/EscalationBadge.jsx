import React from 'react';
import { Badge } from '../Base/Badge';

const ESCALATION_MAP = {
  NONE: { label: 'Standard', variant: 'muted', icon: '—' },
  AT_RISK: { label: 'At Risk', variant: 'warning', icon: '⚠️' },
  ESCALATED: { label: 'Escalated to Supervisor', variant: 'danger', icon: '🚨' },
  RESOLVED_AFTER_ESCALATION: { label: 'Resolved (Post-Escalation)', variant: 'success', icon: '✓' }
};

export function EscalationBadge({ state = 'NONE', className = '' }) {
  const config = ESCALATION_MAP[state] || { label: state, variant: 'muted', icon: '•' };

  return (
    <Badge variant={config.variant} className={className}>
      <span style={{ marginRight: '4px' }}>{config.icon}</span>
      {config.label}
    </Badge>
  );
}
