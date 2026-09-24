export function evaluateEscalation(complaint) {
  if (complaint.status === 'RESOLVED') {
    return complaint;
  }

  const now = Date.now();
  const deadline = new Date(complaint.sla_deadline).getTime();

  if (now > deadline) {
    const hoursPast = (now - deadline) / (1000 * 60 * 60);

    let level = 'LEVEL_1'; // Staff/Supervisor
    if (hoursPast > 24) level = 'LEVEL_3'; // Grievance Officer/Admin
    else if (hoursPast > 6) level = 'LEVEL_2'; // Dept Supervisor

    return {
      ...complaint,
      status: 'SLA_BREACHED',
      escalation_status: level,
      escalation_history: [
        ...(complaint.escalation_history || []),
        {
          timestamp: new Date().toISOString(),
          level,
          note: `Auto-escalated to ${level} due to SLA breach`
        }
      ]
    };
  }

  return complaint;
}
