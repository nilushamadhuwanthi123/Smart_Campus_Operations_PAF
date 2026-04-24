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

export function createBooking(bookingData) {
  return apiRequest('/bookings', {
    method: 'POST',
    body: bookingData
  });
}

export function getBookings(filters = {}) {
  return apiRequest(`/bookings${buildQueryParams(filters)}`);
}

export function getBookingById(id) {
  return apiRequest(`/bookings/${id}`);
}

export function reviewBooking(id, reviewData) {
  return apiRequest(`/bookings/${id}/review`, {
    method: 'PATCH',
    body: reviewData
  });
}

export function cancelBooking(id, reason) {
  return apiRequest(`/bookings/${id}/cancel`, {
    method: 'PATCH',
    body: {
      reason
    }
  });
}

export function getBookingQrCode(id) {
  return apiRequest(`/bookings/${id}/qr`);
}

export function verifyBookingCheckIn(qrPayload) {
  return apiRequest('/bookings/check-in/verify', {
    method: 'POST',
    body: {
      qrPayload
    }
  });
}
