// ================================================================
// NLP Intent Engine — keyword-based intent detection
// ================================================================

import {
  MOCK_ROADS,
  MOCK_BUDGETS,
  MOCK_JURISDICTION,
  MOCK_COMPLAINTS,
} from '../data/mockData';

const ROAD_KEYS = Object.keys(MOCK_ROADS); // NH-65, SH-1, MDR-23

function extractRoadKey(text) {
  const upper = text.toUpperCase();
  for (const k of ROAD_KEYS) {
    if (upper.includes(k)) return k;
  }
  // Fallback: detect road type prefix
  if (upper.includes('NH')) return 'NH-65';
  if (upper.includes('SH')) return 'SH-1';
  if (upper.includes('MDR')) return 'MDR-23';
  return null; // truly unknown
}

// Returns the specific road ID pattern if found, but not in our DB
function extractUnknownRoadId(text) {
  const match = text.match(/\b([A-Z]{1,4}-?\d+)\b/gi);
  if (!match) return null;
  const specific = match.find(m => !ROAD_KEYS.some(k => m.toUpperCase() === k));
  return specific || null;
}

function extractComplaintId(text) {
  const match = text.match(/RW-\d{4}/i);
  return match ? match[0].toUpperCase() : null;
}

function extractRoadType(text) {
  const upper = text.toUpperCase();
  if (upper.includes('NH')) return 'NH';
  if (upper.includes('SH')) return 'SH';
  if (upper.includes('MDR')) return 'MDR';
  if (upper.includes('ODR')) return 'ODR';
  if (upper.includes('VR')) return 'VR';
  return 'SH'; // default for pothole reports
}

export function detectIntent(text) {
  const lower = text.toLowerCase();

  // INTENT 4 — Track Complaint (check first, highest specificity)
  if (
    lower.includes('#rw-') ||
    lower.includes('rw-') ||
    (lower.includes('complaint') && (lower.includes('status') || lower.includes('track') || lower.includes('happened')))
  ) {
    const id = extractComplaintId(text);
    const data = id ? MOCK_COMPLAINTS[id] : Object.values(MOCK_COMPLAINTS)[0];
    return { intent: 'track', data: data || Object.values(MOCK_COMPLAINTS)[0], rawId: id };
  }

  // INTENT 3 — Report Issue
  if (
    lower.includes('pothole') ||
    lower.includes('crack') ||
    lower.includes('waterlogging') ||
    lower.includes('broken') ||
    lower.includes('damage') ||
    (lower.includes('report') && !lower.includes('budget')) ||
    lower.includes('issue')
  ) {
    const roadType = extractRoadType(text);
    return { intent: 'report', data: MOCK_JURISDICTION[roadType] || MOCK_JURISDICTION['SH'], roadType };
  }

  // INTENT 2 — Budget Check
  if (
    lower.includes('spent') ||
    lower.includes('budget') ||
    lower.includes('cost') ||
    lower.includes('sanctioned') ||
    lower.includes('how much')
  ) {
    const key = extractRoadKey(text);
    return { intent: 'budget', data: MOCK_BUDGETS[key] || MOCK_BUDGETS['NH-65'], roadKey: key };
  }

  // INTENT 1 — Road Info
  if (
    lower.includes('what type') ||
    lower.includes('road info') ||
    lower.includes('nh-') ||
    lower.includes('sh-') ||
    lower.includes('mdr-') ||
    lower.includes('contractor') ||
    lower.includes('relay') ||
    lower.includes('road') ||
    lower.includes('highway')
  ) {
    const unknown = extractUnknownRoadId(text);
    const key = extractRoadKey(text);
    // If they mentioned a specific ID that isn't in our DB, return notFound
    if (unknown && !key) {
      return { intent: 'notFound', data: null, roadKey: unknown };
    }
    return { intent: 'roadInfo', data: MOCK_ROADS[key] || MOCK_ROADS['NH-65'], roadKey: key || 'NH-65' };
  }

  // Default fallback
  return { intent: 'default', data: null };
}
