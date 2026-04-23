import { apiRequest } from './client';

export function loginWithPassword(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    auth: false,
    body: {
      email,
      password
    }
  });
}

export function loginWithGoogle(idToken) {
  return apiRequest('/auth/google', {
    method: 'POST',
    auth: false,
    body: {
      idToken
    }
  });
}

export function getCurrentUser() {
  return apiRequest('/auth/me');
}
