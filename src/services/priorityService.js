export function calculatePriority(complaint) {
  let score = 0;
  const reasons = [];

  const text = `${complaint.title || ''} ${complaint.description || ''}`.toLowerCase();

  const criticalKeywords = ['fire', 'gas leak', 'injury', 'medical emergency', 'danger', 'security threat'];
  const highKeywords = ['electrical hazard', 'major outage', 'water leakage', 'flooding'];
  const mediumKeywords = ['broken', 'repair', 'issue', 'not working', 'down'];

  for (const kw of criticalKeywords) {
    if (text.includes(kw)) {
      score += 40;
      reasons.push(`Critical emergency keyword detected: ${kw}`);
    }
  }

  for (const kw of highKeywords) {
    if (text.includes(kw)) {
      score += 25;
      reasons.push(`High risk keyword detected: ${kw}`);
    }
  }

  for (const kw of mediumKeywords) {
    if (text.includes(kw)) {
      score += 10;
      reasons.push(`Maintenance keyword detected: ${kw}`);
    }
  }

  const supportCount = complaint.support_count || 0;
  if (supportCount > 10) {
    score += 20;
    reasons.push(`Multiple affected users (${supportCount} students)`);
  } else if (supportCount > 0) {
    score += 5;
    reasons.push(`Community impact (${supportCount} students)`);
  }

  let priority = 'LOW';
  if (score >= 40) priority = 'CRITICAL';
  else if (score >= 25) priority = 'HIGH';
  else if (score >= 10) priority = 'MEDIUM';

  if (reasons.length === 0) {
    reasons.push('Standard priority based on submission');
  }

  // Ensure max score is 100
  score = Math.min(score, 100);

  return {
    priority,
    priority_score: score,
    priority_reasons: reasons
  };
}
