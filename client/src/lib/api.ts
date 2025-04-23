
let csrfToken: string | null = null;

async function getCsrfToken() {
  if (!csrfToken) {
    const response = await fetch('/api/csrf-token');
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    const data = await response.json();
    csrfToken = data.csrfToken;
  }
  return csrfToken;
}

export async function apiRequest(method: string, path: string, data?: any) {
  const token = await getCsrfToken();
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': token || '',
    },
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  });
  return response;
}

export async function login(username: string, password: string) {
  return apiRequest('POST', '/api/login', { username, password });
}

export async function register(data: any) {
  return apiRequest('POST', '/api/register', data);
}
