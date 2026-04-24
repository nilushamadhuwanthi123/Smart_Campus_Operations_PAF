import { apiRequest } from './client';

function buildQueryParams(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function getNotifications(filters = {}) {
  return apiRequest(`/notifications${buildQueryParams(filters)}`);
}

export function markNotificationAsRead(id) {
  return apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH'
  });
}

export function markAllNotificationsAsRead() {
  return apiRequest('/notifications/read-all', {
    method: 'PATCH'
  });
}

export function deleteNotification(id) {
  return apiRequest(`/notifications/${id}`, {
    method: 'DELETE'
  });
}
