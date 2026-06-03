/**
 * Demo/mock data for all dashboard features.
 * Enables full-featured demo even when the backend is offline.
 */

// ── Demo AI Detection Result ─────────────────────────────────
export const DEMO_DETECTION = {
  detection_id: 'demo-det-001',
  image_url: '/uploads/demo_road.jpg',
  result_image_url: '/uploads/demo_road_result.jpg',
  detection_count: 3,
  overall_risk_score: 0.78,
  overall_severity: 'High',
  message: 'AI detected 3 potholes on the road surface. The largest pothole covers 4.2% of the visible road area and poses a significant risk to vehicles. Immediate attention recommended.',
  detections: [
    {
      damage_type: 'Pothole',
      confidence: 0.94,
      severity: 'Critical',
      risk_score: 0.92,
      repair_priority: 'Urgent',
      repair_timeframe: '48 Hours',
      area_percentage: 4.2,
      explanation: 'Large cavity (approx 50cm × 35cm) detected on the main lane. Depth estimated >10cm. High probability of vehicle damage and accident risk.',
      bbox: { x: 120, y: 200, w: 180, h: 140 },
    },
    {
      damage_type: 'Pothole',
      confidence: 0.87,
      severity: 'High',
      risk_score: 0.74,
      repair_priority: 'High',
      repair_timeframe: '3 Days',
      area_percentage: 2.1,
      explanation: 'Medium-sized pothole near the road shoulder. Surface degradation visible around the edges, indicating progressive deterioration.',
      bbox: { x: 350, y: 280, w: 120, h: 90 },
    },
    {
      damage_type: 'Pothole',
      confidence: 0.72,
      severity: 'Medium',
      risk_score: 0.45,
      repair_priority: 'Routine',
      repair_timeframe: '7 Days',
      area_percentage: 0.8,
      explanation: 'Small surface depression detected. Early-stage deterioration that should be addressed to prevent worsening.',
      bbox: { x: 80, y: 350, w: 60, h: 50 },
    },
  ],
};

// ── Most Dangerous Roads ─────────────────────────────────────
export const DEMO_DANGEROUS_ROADS = [
  { name: 'NH-65 Vijayawada Bypass', complaints: 47, avg_severity: 'Critical', risk_score: 94, trend: 'up' },
  { name: 'SH-1 Krishna Bridge Section', complaints: 38, avg_severity: 'High', risk_score: 87, trend: 'up' },
  { name: 'MDR-23 Guntur Bypass', complaints: 31, avg_severity: 'High', risk_score: 79, trend: 'stable' },
  { name: 'NH-44 Kurnool Stretch', complaints: 28, avg_severity: 'Critical', risk_score: 76, trend: 'up' },
  { name: 'Urban Ring Road Vizag', complaints: 24, avg_severity: 'Medium', risk_score: 68, trend: 'down' },
  { name: 'SH-40 Rajahmundry', complaints: 19, avg_severity: 'Medium', risk_score: 61, trend: 'stable' },
  { name: 'NH-16 Visakhapatnam', complaints: 17, avg_severity: 'High', risk_score: 58, trend: 'down' },
  { name: 'ODR-12 Chittoor', complaints: 12, avg_severity: 'Low', risk_score: 42, trend: 'stable' },
];

// ── Dashboard Statistics ─────────────────────────────────────
export const DEMO_STATS = {
  potholes_detected: 15247,
  complaints_resolved: 8436,
  high_risk_roads: 342,
  ai_accuracy: 98.7,
  citizen_reports: 12890,
  avg_resolution_days: 4.2,
};

// ── Demo Complaint for Timeline ──────────────────────────────
export const DEMO_COMPLAINT_TIMELINE = {
  id: 'RW-2044',
  citizen: 'Aarav Sharma',
  severity: 'High',
  status: 'Under Review',
  zone: 'Krishna, AP',
  ai_confidence: 0.91,
  created: '2026-05-20',
  issue: 'Large pothole cluster detected on SH-1 near Krishna Bridge. AI analysis shows 3 defects with critical risk scoring.',
  road_type: 'SH',
  stage: 3,
  timestamps: {
    submitted: '2026-05-20 09:14',
    ai_verified: '2026-05-20 09:16',
    assigned: '2026-05-21',
    under_review: '2026-05-23',
  },
};
