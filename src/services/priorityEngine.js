/**
 * CampusFix AI Priority Engine
 * Explainable, rule-based priority scoring system.
 * Evaluates urgency keywords, safety hazards, affected students,
 * impact level, location criticality, category, and duplicate clusters.
 */

export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Urgency keywords with category and weightings
export const URGENT_KEYWORDS = [
  { keyword: 'fire', weight: 45, reason: 'Fire or combustion hazard detected' },
  { keyword: 'gas leak', weight: 45, reason: 'Gas leak hazard detected' },
  { keyword: 'injury', weight: 40, reason: 'Physical injury risk detected' },
  { keyword: 'danger', weight: 35, reason: 'Immediate danger reported' },
  { keyword: 'electrical hazard', weight: 40, reason: 'Live electrical hazard reported' },
  { keyword: 'short circuit', weight: 35, reason: 'Short circuit / spark risk detected' },
  { keyword: 'security threat', weight: 40, reason: 'Security or physical threat detected' },
  { keyword: 'emergency', weight: 35, reason: 'Emergency conditions reported' },
  { keyword: 'assault', weight: 45, reason: 'Assault or critical personal safety issue' },
  { keyword: 'explosion', weight: 45, reason: 'Explosion risk detected' },
  { keyword: 'collapse', weight: 40, reason: 'Structural collapse hazard detected' },
  { keyword: 'flood', weight: 30, reason: 'Water flooding critical area' },
  { keyword: 'toxic', weight: 35, reason: 'Toxic substance / fume hazard' },
  { keyword: 'spark', weight: 25, reason: 'Electrical spark reported' },
  { keyword: 'medical', weight: 35, reason: 'Medical urgency identified' }
];

// Critical campus locations where disruption or hazard poses high risk
export const CRITICAL_LOCATIONS = [
  { match: /hostel.*kitchen|kitchen/i, weight: 15, reason: 'Shared commercial kitchen / food preparation area' },
  { match: /lab|laboratory|chemistry/i, weight: 12, reason: 'Campus research / chemical laboratory' },
  { match: /server.*room|datacenter/i, weight: 12, reason: 'Central IT / network infrastructure hub' },
  { match: /girls.*hostel|hostel.*block/i, weight: 10, reason: 'High-density residential student hostel' },
  { match: /library|auditorium|mess/i, weight: 8, reason: 'High-occupancy shared campus facility' }
];

// Category base weighting
export const CATEGORY_WEIGHTS = {
  'Safety & Security': 30,
  'Electrical': 20,
  'Hostel': 15,
  'Plumbing': 15,
  'Sanitation': 12,
  'IT Services': 10,
  'Academic': 8,
  'Administrative': 5,
  'General': 5
};

/**
 * Calculates priority score and explainable reasons for a complaint.
 * @param {Object} complaint
 * @returns {{ priority: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL', score: number, reasons: string[] }}
 */
export function calculatePriority(complaint = {}) {
  const reasons = [];
  let score = 10; // Baseline score for any submitted grievance

  const title = (complaint.title || '').toLowerCase();
  const description = (complaint.description || '').toLowerCase();
  const combinedText = `${title} ${description}`;
  const location = complaint.location || '';
  const category = complaint.category || 'General';
  const supportCount = Number(complaint.supportCount || 0);
  const clusterSize = Number(complaint.clusterSize || 1);
  const reportedImpact = (complaint.impact || '').toUpperCase();

  // 1. Keyword Hazard Detection
  let maxKeywordScore = 0;
  let detectedKeywordReason = null;

  for (const item of URGENT_KEYWORDS) {
    if (combinedText.includes(item.keyword.toLowerCase())) {
      if (item.weight > maxKeywordScore) {
        maxKeywordScore = item.weight;
        detectedKeywordReason = item.reason;
      }
    }
  }

  if (maxKeywordScore > 0) {
    score += maxKeywordScore;
    reasons.push(detectedKeywordReason);
  }

  // 2. High-Risk Category Weighting
  const catWeight = CATEGORY_WEIGHTS[category] || 5;
  score += catWeight;
  if (catWeight >= 20) {
    reasons.push(`Category '${category}' indicates elevated physical or infrastructure risk`);
  }

  // 3. Location Criticality
  for (const loc of CRITICAL_LOCATIONS) {
    if (loc.match.test(location)) {
      score += loc.weight;
      reasons.push(loc.reason);
      break;
    }
  }

  // 4. Affected Students / Support Count
  if (supportCount >= 50) {
    score += 25;
    reasons.push(`Mass campus impact: ${supportCount} students affected or upvoted`);
  } else if (supportCount >= 15) {
    score += 15;
    reasons.push(`Significant student impact: ${supportCount} students affected`);
  } else if (supportCount >= 5) {
    score += 8;
    reasons.push(`Group impact: ${supportCount} students supporting this issue`);
  }

  // 5. Duplicate Cluster Size (repeated complaints about same issue)
  if (clusterSize >= 5) {
    score += 15;
    reasons.push(`High recurrence: Cluster of ${clusterSize} duplicate reports merged`);
  } else if (clusterSize >= 3) {
    score += 8;
    reasons.push(`Multiple occurrences: Cluster of ${clusterSize} reports`);
  }

  // 6. Impact Level Flag
  if (reportedImpact.includes('CRITICAL')) {
    score += 15;
    reasons.push('Reported as severe operational or safety disruption');
  } else if (reportedImpact.includes('HIGH')) {
    score += 10;
    reasons.push('Reported high operational impact');
  }

  // 7. Safety risk flag (e.g. if explicitly flagged by user or scanner)
  if (complaint.isSafetyRisk) {
    score += 20;
    reasons.push('Safety risk flag confirmed');
  }

  // Normalize score between 5 and 100
  score = Math.min(100, Math.max(5, Math.round(score)));

  // Map to Priority Category
  let priority = PRIORITY_LEVELS.LOW;
  if (score >= 80) {
    priority = PRIORITY_LEVELS.CRITICAL;
  } else if (score >= 55) {
    priority = PRIORITY_LEVELS.HIGH;
  } else if (score >= 30) {
    priority = PRIORITY_LEVELS.MEDIUM;
  } else {
    priority = PRIORITY_LEVELS.LOW;
  }

  // Fallback reason if none captured
  if (reasons.length === 0) {
    reasons.push('Standard campus service request with normal processing priority');
  }

  return {
    priority,
    score,
    reasons
  };
}
