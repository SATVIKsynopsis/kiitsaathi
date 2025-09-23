export function buildApiUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const base = window.location.origin;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

export async function apiFetch(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> {
  const resolvedUrl = buildApiUrl(url);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(resolvedUrl, { ...options, headers });

  if (!response.ok) {
    const info = { url: resolvedUrl, status: response.status, statusText: response.statusText };
    if (response.status === 404) {
      console.error('API 404 Not Found', info);
    } else {
      console.warn('API request failed', info);
    }
  }

  return response;
}
