/**
 * Shared API client with JWT auth and automatic token refresh.
 */
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './authStorage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

let refreshPromise = null;

export function getApiBaseUrl() {
  return API_BASE.replace(/\/$/, '');
}

export function apiUrl(path) {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

async function tryRefresh() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh = getRefreshToken();
      if (!refresh) throw new Error('No refresh token');
      const res = await fetch(apiUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) throw new Error('Refresh failed');
      const tokens = await res.json();
      setTokens(tokens);
      return tokens;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * @param {string} path
 * @param {RequestInit & { skipAuth?: boolean }} options
 */
export async function apiFetch(path, options = {}) {
  const { skipAuth, ...fetchOptions } = options;
  const url = apiUrl(path);
  const headers = { ...(fetchOptions.headers || {}) };

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response = await fetch(url, { ...fetchOptions, headers });

  if (response.status === 401 && !skipAuth) {
    try {
      await tryRefresh();
      const newToken = getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...fetchOptions, headers });
      }
    } catch {
      clearTokens();
      window.dispatchEvent(new CustomEvent('roadwatch:auth-expired'));
      throw new Error('Session expired. Please sign in again.');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = error.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg || JSON.stringify(d)).join('; ')
          : `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}
