const getEnv = (key) => process.env[key]?.trim();

export function getBackendApiBaseUrl() {
  return (
    getEnv('STARGATE_3_API_BASE_URL') ||
    getEnv('BACKEND_API_BASE_URL') ||
    'http://localhost:3001'
  );
}

export function buildBackendApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBackendApiBaseUrl()}${normalizedPath}`;
}