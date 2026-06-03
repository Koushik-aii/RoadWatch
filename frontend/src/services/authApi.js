/**
 * Authentication API client.
 */
import { apiFetch } from './apiClient';
import {
  clearTokens,
  getRefreshToken,
  setTokens,
} from './authStorage';

export async function register(email, password, fullName) {
  const data = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
    }),
    skipAuth: true,
  });
  setTokens(data.tokens);
  return data;
}

export async function login(email, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
  setTokens(data.tokens);
  return data;
}

export async function logout() {
  const refresh = getRefreshToken();
  if (refresh) {
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refresh }),
        skipAuth: true,
      });
    } catch {
      /* ignore */
    }
  }
  clearTokens();
}

export async function fetchMe() {
  return apiFetch('/api/auth/me');
}

export async function refreshTokens() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token');
  const tokens = await apiFetch('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refresh }),
    skipAuth: true,
  });
  setTokens(tokens);
  return tokens;
}

export async function adminListUsers() {
  return apiFetch('/api/admin/users');
}

export async function adminAnalytics() {
  return apiFetch('/api/admin/analytics');
}

export async function adminUpdateUser(userId, updates) {
  return apiFetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function officerGetZones() {
  return apiFetch('/api/officer/zones');
}

export async function officerSetZones(zones) {
  return apiFetch('/api/officer/zones', {
    method: 'PUT',
    body: JSON.stringify({ zones }),
  });
}

<<<<<<< Updated upstream
export async function officerUpdateComplaintStatus(complaintId, status, assignedDepartment) {
=======
export async function officerGetMetrics() {
  return apiFetch('/api/officer/metrics');
}

export async function officerUpdateComplaintStatus(complaintId, status, assignedDepartment, resolutionNotes) {
>>>>>>> Stashed changes
  return apiFetch(`/api/officer/complaints/${complaintId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
      assigned_department: assignedDepartment || undefined,
<<<<<<< Updated upstream
    }),
  });
}
=======
      resolution_notes: resolutionNotes || undefined,
    }),
  });
}

export async function adminListAllComplaints(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/complaints/?${query}`, { method: 'GET' });
}

// ---------------------------------------------------------------------------
// Admin - Officer Zones
// ---------------------------------------------------------------------------

export async function adminListOfficerZones() {
  return apiFetch('/api/admin/officer-zones', { method: 'GET' });
}

export async function adminCreateOfficerZone(data) {
  return apiFetch('/api/admin/officer-zones', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteOfficerZone(zoneId) {
  return apiFetch(`/api/admin/officer-zones/${zoneId}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------------------------
// Admin - Jurisdictions
// ---------------------------------------------------------------------------

export async function adminListJurisdictions() {
  return apiFetch('/api/admin/jurisdictions', { method: 'GET' });
}

export async function adminCreateJurisdiction(data) {
  return apiFetch('/api/admin/jurisdictions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminUpdateJurisdiction(jid, data) {
  return apiFetch(`/api/admin/jurisdictions/${jid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteJurisdiction(jid) {
  return apiFetch(`/api/admin/jurisdictions/${jid}`, {
    method: 'DELETE',
  });
}
>>>>>>> Stashed changes
