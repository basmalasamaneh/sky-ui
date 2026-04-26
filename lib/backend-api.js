const getEnv = (key) => process.env[key]?.trim();

export function getBackendApiBaseUrl() {
  return (
    getEnv('STARGATE_3_API_BASE_URL') ||
    getEnv('BACKEND_API_BASE_URL') ||
    'http://localhost:3001'
  );
}

export function buildBackendApiUrl(path) {
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Automatically inject /v1 for all /api calls if not already present
  if (normalizedPath.startsWith('/api/') && !normalizedPath.startsWith('/api/v1/')) {
    normalizedPath = normalizedPath.replace('/api/', '/api/v1/');
  }

  return `${getBackendApiBaseUrl()}${normalizedPath}`;
}