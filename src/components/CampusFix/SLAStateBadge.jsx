import React from 'react';
import { Badge } from '../Base/Badge';
import { SLA_STATES } from '../../services/slaConfig';

export function SLAStateBadge({ state, className = '' }) {
  let variant = 'info';
  let icon = '⏱';

  switch (state) {
    case SLA_STATES.RESOLVED:
      variant = 'success';
      icon = '✓';
      break;
    case SLA_STATES.SLA_BREACHED:
      variant = 'danger';
      icon = '🚨';
      break;
    case SLA_STATES.AT_RISK:
      variant = 'warning';
      icon = '⚠️';
      break;
    case SLA_STATES.ON_TRACK:
    default:
      variant = 'info';
      icon = '⏱';
      break;
  }

  return (
    <Badge variant={variant} className={className}>
      <span style={{ marginRight: '4px' }}>{icon}</span>
      {state || 'On Track'}
    </Badge>
  );
}
