const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    const cleaned = envUrl.replace(/\/$/, '');
    if (cleaned === '/api') {
      return '/api/v1';
    }
    return cleaned;
  }
  return import.meta.env.DEV ? 'http://localhost:8000/api/v1' : '/api/v1';
};

const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', status = 500, referenceId = undefined, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.referenceId = referenceId;
    this.details = details;
  }
}

export async function apiClient(endpoint, options = {}) {
  const { timeoutMs = 12000, headers = {}, ...customConfig } = options;

  const requestId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req_${Date.now()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Normalize endpoint: strip leading slashes and any redundant leading 'api/' or 'v1/'
  let path = endpoint.replace(/^\/+/, '');
  if (path.startsWith('api/')) {
    path = path.slice(4);
  }
  if (path.startsWith('v1/')) {
    path = path.slice(3);
  }

  const base = API_BASE_URL.replace(/\/+$/, '');
  const url = `${base}/${path}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Request-ID': requestId,
  };

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({
      success: response.ok,
      message: response.statusText,
    }));

    if (!response.ok) {
      const errorCode = data?.error?.code || `HTTP_${response.status}`;
      const errorMessage = data?.error?.message || 'A server communication error occurred. Please try again.';
      throw new ApiError(errorMessage, errorCode, response.status, data?.error?.reference_id || requestId, data?.error?.details);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your network connection.', 'TIMEOUT_ERROR', 408, requestId);
    }
    throw new ApiError(
      'Unable to connect to the atelier server. Please verify your connection.',
      'NETWORK_ERROR',
      0,
      requestId
    );
  }
}
