export const API_BASE_URL = 'http://localhost:8081/api';

export async function apiCall(method, url, data = null) {
  try {
    const config = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) config.body = JSON.stringify(data);
    
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error [${method} ${url}]:`, error);
    throw error;
  }
}

export function getApiErrorMessage(error, fallbackMessage) {
  console.error('API Error Details:', error);
  const responseData = error?.response?.data;

  if (typeof responseData === 'string' && responseData.trim() !== '') {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  return error?.message || fallbackMessage;
}
