import { apiRequest } from './client';

export function createIssueReport(issueData) {
  return apiRequest('/issues', {
    method: 'POST',
    body: issueData
  });
}

export function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest('/uploads', {
    method: 'POST',
    body: formData
  });
}

export function getIssueReports() {
  return apiRequest('/issues');
}

export function getIssueReportById(id) {
  return apiRequest(`/issues/${id}`);
}

export function updateIssueReportStatus(id, status) {
  return apiRequest(`/issues/${id}/status`, {
    method: 'PATCH',
    body: { status }
  });
}

export function updateIssueReportAdminNote(id, adminNote) {
  return apiRequest(`/issues/${id}/note`, {
    method: 'PATCH',
    body: { adminNote }
  });
}

export function assignIssueReportTechnician(id, technicianId) {
  return apiRequest(`/issues/${id}/assign`, {
    method: 'PATCH',
    body: { technicianId }
  });
}

export function addIssueReportComment(id, comment) {
  return apiRequest(`/issues/${id}/comments`, {
    method: 'POST',
    body: { comment }
  });
}
