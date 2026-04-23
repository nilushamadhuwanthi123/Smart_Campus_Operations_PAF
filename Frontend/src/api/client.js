export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const AUTH_TOKEN_STORAGE_KEY = 'smartCampusAuthToken';

export function getStoredAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setStoredAuthToken(token) {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {}, auth = true } = options;
  const requestHeaders = new Headers(headers);

  if (auth) {
    const token = getStoredAuthToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  let payload = body;
  if (body && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: payload
  });

  const contentType = response.headers.get('content-type') || '';
  const hasJson = contentType.includes('application/json');
  const responsePayload = hasJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(responsePayload?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.payload = responsePayload;
    throw error;
  }

  return responsePayload;
}
