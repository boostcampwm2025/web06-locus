import { API_BASE_URL } from '../constants';

export function buildApiUrl(endpoint: string, absolute = false): string {
  if (endpoint.startsWith('http')) return endpoint;

  const baseUrl = API_BASE_URL.startsWith('http')
    ? API_BASE_URL
    : `${typeof window !== 'undefined' ? window.location.origin : ''}${API_BASE_URL}`;

  const fullUrl = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  return absolute
    ? fullUrl
    : fullUrl.replace(
        typeof window !== 'undefined' ? window.location.origin : '',
        '',
      );
}
