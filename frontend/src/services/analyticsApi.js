import { apiFetch } from './apiClient';

export const SEVERITY_COLORS = {
  Low: '#16a34a',
  Medium: '#d97706',
  High: '#ea580c',
  Critical: '#dc2626',
};

export function buildAnalyticsQuery(filters = {}) {
  const params = new URLSearchParams();
  if (filters.district && filters.district !== 'All') params.set('district', filters.district);
  if (filters.severity && filters.severity !== 'All') params.set('severity', filters.severity);
  if (filters.startDate) params.set('start_date', filters.startDate);
  if (filters.endDate) params.set('end_date', filters.endDate);
  if (filters.maxPoints) params.set('max_points', String(filters.maxPoints));
  return params.toString();
}

export async function getAnalyticsDashboard(filters = {}) {
  const query = buildAnalyticsQuery(filters);
  return apiFetch(`/api/analytics/dashboard${query ? `?${query}` : ''}`);
}

export async function getAnalyticsMap(filters = {}) {
  const query = buildAnalyticsQuery(filters);
  return apiFetch(`/api/analytics/map${query ? `?${query}` : ''}`);
}
