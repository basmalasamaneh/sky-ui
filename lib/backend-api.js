const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL || 'http://localhost:3001';

export function buildBackendApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${BACKEND_API_BASE_URL}${normalizedPath}`;
}