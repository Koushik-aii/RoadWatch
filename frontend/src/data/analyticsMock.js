/**
 * Realistic mock data for the Analytics Dashboard
 */

export const dashboardMetrics = {
  totalRoads: 1420,
  totalComplaints: 3845,
  resolutionRate: 78.4, // percentage
  budgetUtilized: 62.5, // percentage
  highRiskRoads: 124,
};

export const resolutionTrend = [
  { month: 'Jan', filed: 420, resolved: 380 },
  { month: 'Feb', filed: 380, resolved: 350 },
  { month: 'Mar', filed: 450, resolved: 390 },
  { month: 'Apr', filed: 510, resolved: 420 },
  { month: 'May', filed: 600, resolved: 480 },
  { month: 'Jun', filed: 720, resolved: 580 },
  { month: 'Jul', filed: 840, resolved: 700 }, // Monsoon season spike
];

export const complaintsByDistrict = [
  { district: 'Hyderabad', count: 1250 },
  { district: 'Visakhapatnam', count: 840 },
  { district: 'Vijayawada', count: 620 },
  { district: 'Guntur', count: 480 },
  { district: 'Warangal', count: 350 },
  { district: 'Other', count: 305 },
];

export const complaintsByRoadType = [
  { type: 'National Highway (NH)', count: 450, color: '#3b82f6' }, // blue-500
  { type: 'State Highway (SH)', count: 850, color: '#10b981' }, // emerald-500
  { type: 'Major District Road (MDR)', count: 1200, color: '#f59e0b' }, // amber-500
  { type: 'Other District Road (ODR)', count: 800, color: '#8b5cf6' }, // violet-500
  { type: 'Village Road (VR)', count: 545, color: '#ef4444' }, // red-500
];

export const budgetVsMaintenance = [
  { district: 'Hyderabad', allocated: 500, spent: 420 }, // in crores
  { district: 'Visakhapatnam', allocated: 350, spent: 310 },
  { district: 'Vijayawada', allocated: 280, spent: 220 },
  { district: 'Guntur', allocated: 200, spent: 140 },
  { district: 'Warangal', allocated: 150, spent: 130 },
];
