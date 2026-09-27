import { getAuthHeader } from './auth';

const buildUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!path.startsWith('http') && baseUrl) {
    const apiPath = normalizedPath.startsWith('/api') ? normalizedPath : `/api${normalizedPath}`;
    return `${baseUrl.replace(/\/$/, '')}${apiPath}`;
  }

  return path.startsWith('http') ? path : `/api${normalizedPath}`;
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
