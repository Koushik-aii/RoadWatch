import roadsData from './roads_mock.json';

// ===========================================================
// ROADWATCH — Mock Data for all 4 chatbot intents
// ===========================================================

export const ROAD_TYPE_COLORS = {
  NH: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400', hex: '#3b82f6', label: 'National Highway' },
  SH: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400', hex: '#f97316', label: 'State Highway' },
  MDR: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-400', hex: '#a855f7', label: 'Major District Road' },
  ODR: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-400', hex: '#22c55e', label: 'Other District Road' },
  VR: { bg: 'bg-teal-500', border: 'border-teal-500', text: 'text-teal-400', hex: '#14b8a6', label: 'Village Road' },
  Urban: { bg: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-400', hex: '#f43f5e', label: 'Urban Road' },
};

// Map roadsData JSON into the structure expected by INTENT 1 and INTENT 2
export const MOCK_ROADS = {};
export const MOCK_BUDGETS = {};

roadsData.forEach(road => {
  // Map for Intent 1
  MOCK_ROADS[road.id] = {
    name: `${road.name} (${road.segment})`,
    type: road.type,
    district: road.district,
    state: road.state,
    lastRelayDate: road.lastRelayDate,
    expectedLifespan: 'Expected renewal: ' + road.nextDueDate,
    contractor: road.contractor.name,
    licenseNo: road.contractor.licenseNo,
    maintenanceHistory: road.repairHistory,
    source: road.source,
    sourceUrl: road.sourceUrl,
    length: `${road.length_km} km`,
  };

  // Map for Intent 2
  MOCK_BUDGETS[road.id] = {
    roadName: road.id,
    phase: road.sourceDocs.split('—')[0].trim() || 'Budget Allocation',
    source: road.sourceDocs,
    sourceUrl: road.sourceUrl,
    sanctioned: road.sanctioned_cr,
    disbursed: road.disbursed_cr,
    utilisedPct: road.utilised_pct,
    accidentCount: road.accidentCount,
    accidentSource: road.accidentSource,
    accidentSourceUrl: 'https://irad.morth.gov.in',
    flag: road.flag,
  };
});

// INTENT 3 — Jurisdiction routing
export const MOCK_JURISDICTION = {
  'NH': {
    district: 'Krishna',
    authority_name: 'NHAI Project Implementation Unit, Krishna',
    designation: 'Project Director / Executive Engineer (NH)',
    email: 'pd.nhai.krishna@ap.gov.in',
    phone: '1800-11-6062',
    complaint_portal: 'https://pgportal.gov.in/',
    escalation: 'Regional Officer (RO), NHAI',
  },
  'SH': {
    district: 'Krishna',
    authority_name: 'R&B Division, Krishna',
    designation: 'Executive Engineer (R&B)',
    email: 'ee.rnb.krishna@ap.gov.in',
    phone: '+91-8600000001',
    complaint_portal: 'https://rnb.ap.gov.in/complaints',
    escalation: 'Superintending Engineer (R&B)',
  },
  'MDR': {
    district: 'Guntur',
    authority_name: 'R&B Division, Guntur',
    designation: 'Executive Engineer (R&B)',
    email: 'ee.rnb.guntur@ap.gov.in',
    phone: '+91-8610000001',
    complaint_portal: 'https://rnb.ap.gov.in/complaints',
    escalation: 'Superintending Engineer (R&B)',
  },
  'VR': {
    district: 'Guntur',
    authority_name: 'Panchayati Raj Engineering Dept, Guntur',
    designation: 'Executive Engineer (PR/PMGSY)',
    email: 'ee.pr.guntur@ap.gov.in',
    phone: '+91-9600000001',
    complaint_portal: 'https://epanchayat.ap.gov.in/',
    escalation: 'Superintending Engineer (PR)',
  },
  'Urban': {
    district: 'Krishna',
    authority_name: 'Vijayawada Municipal Corporation',
    designation: 'Executive Engineer (Municipal)',
    email: 'commissioner.krishna@ap.gov.in',
    phone: '+91-7600000001',
    complaint_portal: 'https://vmc.ap.gov.in/',
    escalation: 'Municipal Commissioner',
  }
};

// INTENT 4 — Complaint tracking
export const MOCK_COMPLAINTS = {
  'RW-2044': {
    id: 'RW-2044',
    issue: 'Large pothole (40cm x 20cm) on SH-1 near Krishna Bridge',
    road: 'SH-1',
    location: 'Near Krishna Bridge, Vijayawada',
    stage: 2, // 0=Filed, 1=Under Review, 2=Resolved
    authority: 'R&B Division, Krishna',
    authorityEmail: 'ee.rnb.krishna@ap.gov.in',
    filedDate: '2024-11-10',
    resolvedDate: '2024-11-28',
    daysElapsed: 18,
    expectedDays: 21,
    overdue: false,
    escalation: 'Superintending Engineer (R&B)',
  },
  'RW-1012': {
    id: 'RW-1012',
    issue: 'Road cave-in on MDR-23 near Guntur bypass',
    road: 'MDR-23',
    location: 'Guntur Bypass, Guntur District',
    stage: 1,
    authority: 'R&B Division, Guntur',
    authorityEmail: 'ee.rnb.guntur@ap.gov.in',
    filedDate: '2024-10-05',
    resolvedDate: null,
    daysElapsed: 54,
    expectedDays: 30,
    overdue: true,
    escalation: 'Superintending Engineer (R&B)',
  },
};

// Quick-reply chips per intent
export const QUICK_REPLIES = {
  roadInfo: ['Check its budget →', 'Report an issue here', 'Track a complaint'],
  budget: ['View road details →', 'Report overdue repair', 'Compare with NH-65'],
  report: ['Track my complaint', 'Report another issue', 'View road details →'],
  track: ['File a new complaint', 'Escalate this issue', 'View road details →'],
  default: ['Road info on NH-65', 'Budget for SH-4', 'Report a pothole', 'Urban road info'],
};
