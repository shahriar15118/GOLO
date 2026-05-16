interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

const API_BASE = '/api/v1';

const getAuthToken = () => localStorage.getItem('golo_token');

async function request(endpoint: string, options: RequestOptions = {}) {
  const { params, ...init } = options;
  
  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => searchParams.append(key, String(val)));
    url += `?${searchParams.toString()}`;
  }

  const token = getAuthToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });
  const data = await response.json();

  if (response.status === 401) {
    localStorage.removeItem('golo_token');
    localStorage.removeItem('golo_user');
    window.location.href = '/auth/login';
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  get: (url: string, params?: Record<string, string | number>) => request(url, { method: 'GET', params }),
  post: (url: string, body: any) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body: any) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (url: string, body: any) => request(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url: string) => request(url, { method: 'DELETE' }),
};
