/**
 * Mock data for the authority complaint management table.
 * Used when the backend API is unavailable (hackathon demo mode).
 */

export const MOCK_AUTHORITY_COMPLAINTS = [
  { id: 'RW-3001', citizen: 'Aarav Sharma', severity: 'Critical', status: 'Filed', zone: 'Krishna, AP', ai_confidence: 0.96, created: '2026-05-28', image: null, issue: 'Large pothole cluster on NH-65 near Krishna Bridge', road_type: 'NH', stage: 0 },
  { id: 'RW-3002', citizen: 'Priya Reddy', severity: 'High', status: 'Assigned', zone: 'Guntur, AP', ai_confidence: 0.89, created: '2026-05-27', image: null, issue: 'Road cave-in on MDR-23 near Guntur bypass', road_type: 'MDR', stage: 2 },
  { id: 'RW-3003', citizen: 'Karthik Nair', severity: 'Medium', status: 'Under Review', zone: 'Visakhapatnam, AP', ai_confidence: 0.74, created: '2026-05-26', image: null, issue: 'Multiple potholes on SH-1 industrial area', road_type: 'SH', stage: 3 },
  { id: 'RW-3004', citizen: 'Meera Patel', severity: 'Low', status: 'Resolved', zone: 'Nellore, AP', ai_confidence: 0.62, created: '2026-05-25', image: null, issue: 'Minor surface damage on VR connecting Podalakur', road_type: 'VR', stage: 4 },
  { id: 'RW-3005', citizen: 'Ravi Kumar', severity: 'Critical', status: 'Under Review', zone: 'Kurnool, AP', ai_confidence: 0.94, created: '2026-05-24', image: null, issue: 'Sinkhole on NH-44 near Kurnool bus station', road_type: 'NH', stage: 3 },
  { id: 'RW-3006', citizen: 'Ananya Iyer', severity: 'High', status: 'Filed', zone: 'East Godavari, AP', ai_confidence: 0.87, created: '2026-05-23', image: null, issue: 'Waterlogged pothole on SH-40 Rajahmundry', road_type: 'SH', stage: 0 },
  { id: 'RW-3007', citizen: 'Vikram Singh', severity: 'Medium', status: 'Assigned', zone: 'Chittoor, AP', ai_confidence: 0.71, created: '2026-05-22', image: null, issue: 'Road shoulder erosion on ODR-12', road_type: 'ODR', stage: 2 },
  { id: 'RW-3008', citizen: 'Sneha Rao', severity: 'High', status: 'Under Review', zone: 'Krishna, AP', ai_confidence: 0.91, created: '2026-05-21', image: null, issue: 'Deep pothole on Urban Ring Road Vijayawada', road_type: 'Urban', stage: 3 },
  { id: 'RW-3009', citizen: 'Arjun Varma', severity: 'Low', status: 'Resolved', zone: 'Guntur, AP', ai_confidence: 0.55, created: '2026-05-20', image: null, issue: 'Minor crack on VR near Tenali junction', road_type: 'VR', stage: 4 },
  { id: 'RW-3010', citizen: 'Divya Menon', severity: 'Critical', status: 'Assigned', zone: 'Visakhapatnam, AP', ai_confidence: 0.97, created: '2026-05-19', image: null, issue: 'Major pothole causing accidents on NH-16 Vizag', road_type: 'NH', stage: 2 },
  { id: 'RW-3011', citizen: 'Rahul Pillai', severity: 'Medium', status: 'Filed', zone: 'Nellore, AP', ai_confidence: 0.68, created: '2026-05-18', image: null, issue: 'Surface degradation on SH-69 near Nellore', road_type: 'SH', stage: 0 },
  { id: 'RW-3012', citizen: 'Pooja Devi', severity: 'High', status: 'Resolved', zone: 'Kurnool, AP', ai_confidence: 0.85, created: '2026-05-17', image: null, issue: 'Repaired pothole on MDR-5 Adoni road', road_type: 'MDR', stage: 4 },
  { id: 'RW-3013', citizen: 'Suresh Babu', severity: 'Low', status: 'Filed', zone: 'East Godavari, AP', ai_confidence: 0.48, created: '2026-05-16', image: null, issue: 'Small surface crack on ODR connecting Kakinada', road_type: 'ODR', stage: 0 },
  { id: 'RW-3014', citizen: 'Lakshmi Naidu', severity: 'Critical', status: 'Under Review', zone: 'Chittoor, AP', ai_confidence: 0.93, created: '2026-05-15', image: null, issue: 'Dangerous pothole on NH-40 Tirupati route', road_type: 'NH', stage: 3 },
  { id: 'RW-3015', citizen: 'Aditya Prasad', severity: 'Medium', status: 'Assigned', zone: 'Krishna, AP', ai_confidence: 0.76, created: '2026-05-14', image: null, issue: 'Multiple defects on Urban Bandar Road', road_type: 'Urban', stage: 2 },
  { id: 'RW-3016', citizen: 'Swathi Reddy', severity: 'High', status: 'Filed', zone: 'Guntur, AP', ai_confidence: 0.88, created: '2026-05-13', image: null, issue: 'Deep cavity on SH-2 near Mangalagiri', road_type: 'SH', stage: 0 },
  { id: 'RW-3017', citizen: 'Ganesh Rao', severity: 'Low', status: 'Resolved', zone: 'Visakhapatnam, AP', ai_confidence: 0.52, created: '2026-05-12', image: null, issue: 'Surface patching needed on VR Pendurthi', road_type: 'VR', stage: 4 },
  { id: 'RW-3018', citizen: 'Kavitha Srinivas', severity: 'Medium', status: 'Under Review', zone: 'Nellore, AP', ai_confidence: 0.73, created: '2026-05-11', image: null, issue: 'Road damage from heavy rains on MDR-18', road_type: 'MDR', stage: 3 },
  { id: 'RW-3019', citizen: 'Naveen Chandra', severity: 'Critical', status: 'Assigned', zone: 'Kurnool, AP', ai_confidence: 0.95, created: '2026-05-10', image: null, issue: 'Collapsed road section on NH-44 bypass', road_type: 'NH', stage: 2 },
  { id: 'RW-3020', citizen: 'Deepika Joshi', severity: 'High', status: 'Filed', zone: 'East Godavari, AP', ai_confidence: 0.82, created: '2026-05-09', image: null, issue: 'Large pothole on SH-40 bridge approach', road_type: 'SH', stage: 0 },
];

export const AUTHORITY_STATUSES = ['Filed', 'Assigned', 'Under Review', 'Resolved'];

export const AUTHORITY_SEVERITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];

export const AUTHORITY_ZONES = [
  'All', 'Krishna, AP', 'Guntur, AP', 'Visakhapatnam, AP', 'Nellore, AP',
  'Kurnool, AP', 'East Godavari, AP', 'Chittoor, AP'
];
