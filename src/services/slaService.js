export const SLA_HOURS = {
  CRITICAL: 2,
  HIGH: 6,
  MEDIUM: 24,
  LOW: 48
};

export function calculateSlaDeadline(priority, createdAt) {
  const hours = SLA_HOURS[priority] || SLA_HOURS.LOW;
  const date = new Date(createdAt);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export function getRemainingTime(deadline) {
  const now = new Date();
  const target = new Date(deadline);
  return target.getTime() - now.getTime();
}

export function isSlaBreached(deadline) {
  return getRemainingTime(deadline) < 0;
}

export function getSlaState(deadline) {
  const remaining = getRemainingTime(deadline);
  if (remaining < 0) return 'BREACHED';

  // AT_RISK if less than 2 hours remaining
  if (remaining < 2 * 60 * 60 * 1000) return 'AT_RISK';

  return 'ON_TRACK';
}

export function getSlaPercentage(createdAt, deadline) {
  const start = new Date(createdAt).getTime();
  const end = new Date(deadline).getTime();
  const now = Date.now();

  const totalDuration = end - start;
  const elapsed = now - start;

  let percentage = (elapsed / totalDuration) * 100;
  return Math.min(Math.max(percentage, 0), 100); // 0 to 100
}
