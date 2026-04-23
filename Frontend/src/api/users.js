import { apiRequest } from './client';

export function getUsers() {
  return apiRequest('/users');
}

export function createUser(userData) {
  return apiRequest('/users', {
    method: 'POST',
    body: userData
  });
}

export function updateMyProfile(profile) {
  return apiRequest('/users/me', {
    method: 'PATCH',
    body: profile
  });
}
