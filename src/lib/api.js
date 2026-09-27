import { getAuthHeader } from './auth';

const buildUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  if (!path.startsWith('http') && baseUrl) {
    return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path.startsWith('http') ? path : `/api${path}`;
};

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...getAuthHeader(),
  };

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Request failed.');
  }

  if (response.status === 204) return null;
  return response.json();
}
