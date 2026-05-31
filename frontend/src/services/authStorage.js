const ACCESS_KEY = 'roadwatch_access_token';
const REFRESH_KEY = 'roadwatch_refresh_token';

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens) {
  if (tokens?.access_token) {
    sessionStorage.setItem(ACCESS_KEY, tokens.access_token);
  }
  if (tokens?.refresh_token) {
    sessionStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  }
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

export function hasTokens() {
  return Boolean(getAccessToken() && getRefreshToken());
}
