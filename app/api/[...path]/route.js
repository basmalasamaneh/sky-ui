import { buildBackendApiUrl } from '@/lib/backend-api';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'host',
  'content-length',
]);

function buildForwardHeaders(incomingHeaders) {
  const headers = new Headers();

  incomingHeaders.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lowerKey)) return;
    headers.set(key, value);
  });

  return headers;
}

async function proxyRequest(req, path) {
  const query = req.nextUrl.search || '';
  const backendUrl = buildBackendApiUrl(`/api/${path.join('/')}${query}`);
  const method = req.method;

  const requestInit = {
    method,
    headers: buildForwardHeaders(req.headers),
    cache: 'no-store',
  };

  if (method !== 'GET' && method !== 'HEAD') {
    requestInit.body = await req.arrayBuffer();
  }

  const backendResponse = await fetch(backendUrl, requestInit);
  const responseBody = await backendResponse.arrayBuffer();

  return new Response(responseBody, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: backendResponse.headers,
  });
}

function handleProxyError(error) {
  console.error('API Proxy Error:', error);
  return Response.json(
    {
      status: 'error',
      message: 'تعذر الاتصال بالخادم حالياً. حاول مرة أخرى لاحقاً.',
    },
    { status: 503 }
  );
}

export async function GET(req, { params }) {
  try {
    const { path } = await params;
    return await proxyRequest(req, path || []);
  } catch (error) {
    return handleProxyError(error);
  }
}

export async function POST(req, { params }) {
  try {
    const { path } = await params;
    return await proxyRequest(req, path || []);
  } catch (error) {
    return handleProxyError(error);
  }
}

export async function PUT(req, { params }) {
  try {
    const { path } = await params;
    return await proxyRequest(req, path || []);
  } catch (error) {
    return handleProxyError(error);
  }
}

export async function PATCH(req, { params }) {
  try {
    const { path } = await params;
    return await proxyRequest(req, path || []);
  } catch (error) {
    return handleProxyError(error);
  }
}

export async function DELETE(req, { params }) {
  try {
    const { path } = await params;
    return await proxyRequest(req, path || []);
  } catch (error) {
    return handleProxyError(error);
  }
}
