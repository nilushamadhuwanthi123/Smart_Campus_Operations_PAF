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

export function getResources(filters = {}) {
  return apiRequest(`/resources${buildQueryParams(filters)}`);
}

export function getResourceById(id) {
  return apiRequest(`/resources/${id}`);
}

export function createResource(resourceData) {
  return apiRequest('/resources', {
    method: 'POST',
    body: resourceData
  });
}

export function updateResource(id, resourceData) {
  return apiRequest(`/resources/${id}`, {
    method: 'PUT',
    body: resourceData
  });
}

export function deleteResource(id) {
  return apiRequest(`/resources/${id}`, {
    method: 'DELETE'
  });
}

export function getResourceUsageAnalytics() {
  return apiRequest('/resources/analytics');
}
