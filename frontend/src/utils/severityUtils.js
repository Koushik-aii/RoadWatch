/**
 * Centralized severity color system for RoadWatch.
 * Single source of truth for severity visualization across the entire platform.
 *
 * Severity Levels: Low → Green, Medium → Yellow/Amber, High → Orange, Critical → Red
 */

// ── Hex color values ──────────────────────────────────────────
export const SEVERITY_HEX = {
  Low: '#22c55e',
  Medium: '#eab308',
  High: '#f97316',
  Critical: '#ef4444',
  Safe: '#22c55e',
};

// ── Tailwind class maps ───────────────────────────────────────
export const SEVERITY_TEXT = {
  Low: 'text-emerald-400',
  Medium: 'text-yellow-400',
  High: 'text-orange-400',
  Critical: 'text-red-400',
  Safe: 'text-emerald-400',
};

export const SEVERITY_BG = {
  Low: 'bg-emerald-500/15',
  Medium: 'bg-yellow-500/15',
  High: 'bg-orange-500/15',
  Critical: 'bg-red-500/15',
  Safe: 'bg-emerald-500/15',
};

export const SEVERITY_BORDER = {
  Low: 'border-emerald-500/30',
  Medium: 'border-yellow-500/30',
  High: 'border-orange-500/30',
  Critical: 'border-red-500/30',
  Safe: 'border-emerald-500/30',
};

export const SEVERITY_GLOW = {
  Low: 'rgba(34,197,94,0.4)',
  Medium: 'rgba(234,179,8,0.4)',
  High: 'rgba(249,115,22,0.4)',
  Critical: 'rgba(239,68,68,0.4)',
  Safe: 'rgba(34,197,94,0.4)',
};

export const SEVERITY_GRADIENT = {
  Low: 'from-emerald-500 to-emerald-400',
  Medium: 'from-yellow-500 to-amber-400',
  High: 'from-orange-500 to-orange-400',
  Critical: 'from-red-600 to-red-400',
  Safe: 'from-emerald-500 to-emerald-400',
};

export const SEVERITY_ICON = {
  Low: '✅',
  Medium: '⚠️',
  High: '🔶',
  Critical: '🔴',
  Safe: '✅',
};

// ── Utility functions ─────────────────────────────────────────

/** Get severity level from a numeric score (0–100) */
export function getSeverityFromScore(score) {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 35) return 'Medium';
  return 'Low';
}

/** Get severity level from AI confidence (0–1) */
export function getSeverityFromConfidence(confidence) {
  return getSeverityFromScore(confidence * 100);
}

/** Get all style classes for a severity level */
export function getSeverityClasses(severity = 'Low') {
  return {
    text: SEVERITY_TEXT[severity] || SEVERITY_TEXT.Low,
    bg: SEVERITY_BG[severity] || SEVERITY_BG.Low,
    border: SEVERITY_BORDER[severity] || SEVERITY_BORDER.Low,
    hex: SEVERITY_HEX[severity] || SEVERITY_HEX.Low,
    glow: SEVERITY_GLOW[severity] || SEVERITY_GLOW.Low,
    gradient: SEVERITY_GRADIENT[severity] || SEVERITY_GRADIENT.Low,
    icon: SEVERITY_ICON[severity] || SEVERITY_ICON.Low,
  };
}

/** Map status string to numeric stage */
export const STATUS_TO_STAGE = {
  'Filed': 0,
  'Submitted': 0,
  'Pending': 0,
  'AI Verified': 1,
  'Assigned': 2,
  'Under Review': 3,
  'Routed': 3,
  'Resolved': 4,
};

/** Complaint lifecycle stages */
export const COMPLAINT_STAGES = [
  { key: 'submitted', label: 'Submitted', icon: '📝' },
  { key: 'ai_verified', label: 'AI Verified', icon: '🤖' },
  { key: 'assigned', label: 'Assigned', icon: '📋' },
  { key: 'under_review', label: 'Under Review', icon: '🔍' },
  { key: 'resolved', label: 'Resolved', icon: '✅' },
];
