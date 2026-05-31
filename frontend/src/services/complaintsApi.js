/**
 * Complaints API — full CRUD integration with RoadWatch backend.
 */
import { apiFetch, apiUrl } from './apiClient';

/**
 * Map backend complaint response to frontend card/list shape.
 * @param {object} c - ComplaintResponse or nested complaint object
 */
export function mapComplaintToFrontend(c) {
  if (!c) return null;
  const id = c.complaint_id || c.id;
  const authority = c.routed_authority || {};
  return {
    id,
    uuid: c.uuid,
    title: c.title,
    description: c.description,
    issue: c.issue || c.description || c.title,
    road: c.road_type || c.road || '',
    roadType: c.road_type,
    location: c.location || `${c.latitude}, ${c.longitude}`,
    latitude: c.latitude,
    longitude: c.longitude,
    stage: c.stage ?? statusToStage(c.status),
    status: c.status,
    severity: c.severity,
    filedDate: c.filedDate || (c.created_at ? c.created_at.slice(0, 10) : ''),
    created_at: c.created_at,
    authority: c.assigned_department || authority.authority_name || '',
    authority_name: c.assigned_department || authority.authority_name || '',
    authorityEmail: c.authority_email || authority.email || '',
    authority_email: c.authority_email || authority.email || '',
    escalation: c.escalation || authority.escalation || '',
    district: c.district,
    state: c.state,
    overdue: c.overdue ?? false,
    daysElapsed: c.daysElapsed ?? 0,
    expectedDays: c.expectedDays ?? 21,
    resolvedDate: c.stage === 2 ? c.filedDate : null,
    image_url: c.image_url,
    photo: c.image_url,
    assigned_department: c.assigned_department,
  };
}

function statusToStage(status) {
  if (!status) return 0;
  const s = status.toLowerCase();
  if (s === 'resolved') return 2;
  if (s === 'under review' || s === 'routed') return 1;
  return 0;
}

/**
 * Parse GPS string like "16.5062° N, 80.6480° E" to { lat, lng }.
 */
export function parseGpsString(gpsValue) {
  if (!gpsValue || typeof gpsValue !== 'string') return null;
  const match = gpsValue.match(
    /([\d.]+)\s*°?\s*([NS]).*?([\d.]+)\s*°?\s*([EW])/i
  );
  if (!match) return null;
  let lat = parseFloat(match[1]);
  let lng = parseFloat(match[3]);
  if (match[2].toUpperCase() === 'S') lat = -lat;
  if (match[4].toUpperCase() === 'W') lng = -lng;
  return { lat, lng };
}

/**
 * Create complaint (JSON).
 */
export async function createComplaint(payload) {
  const res = await apiFetch('/api/complaints/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const complaint = res.complaint ? mapComplaintToFrontend(res.complaint) : null;
  return {
    complaint_id: res.complaint_id,
    status: res.status,
    routed_authority: res.routed_authority,
    message: res.message,
    complaint: complaint || mapComplaintToFrontend({
      complaint_id: res.complaint_id,
      status: res.status,
      ...payload,
      issue: payload.description || payload.title || payload.issue_type,
      stage: 1,
      routed_authority: res.routed_authority,
      assigned_department: res.routed_authority?.authority_name,
      authority_email: res.routed_authority?.email,
      filedDate: new Date().toISOString().slice(0, 10),
    }),
  };
}

/**
 * Create complaint with image (multipart).
 */
export async function createComplaintWithImage(formData) {
  const url = apiUrl('/api/complaints/upload');
  const response = await fetch(url, { method: 'POST', body: formData });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Upload failed (${response.status})`);
  }
  const res = await response.json();
  return {
    ...res,
    complaint: res.complaint ? mapComplaintToFrontend(res.complaint) : null,
  };
}

/**
 * List complaints with pagination and filters.
 */
export async function listComplaints({
  page = 1,
  page_size = 50,
  status,
  severity,
  district,
  state,
  road_type,
  assigned_department,
  search,
} = {}) {
  const params = new URLSearchParams({ page: String(page), page_size: String(page_size) });
  if (status) params.set('status', status);
  if (severity) params.set('severity', severity);
  if (district) params.set('district', district);
  if (state) params.set('state', state);
  if (road_type) params.set('road_type', road_type);
  if (assigned_department) params.set('assigned_department', assigned_department);
  if (search) params.set('search', search);

  const res = await apiFetch(`/api/complaints/?${params}`);
  return {
    ...res,
    items: (res.items || []).map(mapComplaintToFrontend),
  };
}

/**
 * Get single complaint by RW-XXXX or UUID.
 */
export async function getComplaint(complaintId) {
  const res = await apiFetch(`/api/complaints/${encodeURIComponent(complaintId)}`);
  const raw = res.complaint || res;
  return mapComplaintToFrontend({
    complaint_id: res.complaint_id,
    status: res.status,
    issue_type: res.issue_type,
    submitted_at: res.submitted_at,
    routed_authority: res.routed_authority,
    ...raw,
    issue: raw.issue || res.issue_type,
    filedDate: raw.filedDate || (res.submitted_at ? res.submitted_at.slice(0, 10) : ''),
    authority: raw.assigned_department || res.routed_authority?.authority_name,
    authorityEmail: raw.authority_email || res.routed_authority?.email,
    escalation: raw.escalation || res.routed_authority?.escalation,
  });
}

/**
 * Update complaint.
 */
export async function updateComplaint(complaintId, updates) {
  const res = await apiFetch(`/api/complaints/${encodeURIComponent(complaintId)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return mapComplaintToFrontend(res);
}

/**
 * Delete complaint.
 */
export async function deleteComplaint(complaintId) {
  return apiFetch(`/api/complaints/${encodeURIComponent(complaintId)}`, {
    method: 'DELETE',
  });
}

/**
 * Build create payload from report form + jurisdiction data.
 */
export function buildCreatePayload({ formState, data, roadType, coords }) {
  const gps = coords || parseGpsString(formState?.gpsValue);
  const lat = gps?.lat ?? 16.5062;
  const lng = gps?.lng ?? 80.6480;
  const defect = formState?.defectType || 'Pothole';
  const title = `${defect} on ${data?.authority_name || roadType || 'road'}`;

  return {
    title,
    description: defect,
    lat,
    lng,
    issue_type: defect,
    district: data?.district || data?._resolvedDistrict || 'Krishna',
    state: data?.state || data?._resolvedState || 'Andhra Pradesh',
    country: data?.country || 'India',
    road_type: roadType || 'SH',
    road_id: data?.road_id || undefined,
  };
}
