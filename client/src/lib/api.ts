
let csrfToken: string | null = null;

async function getCsrfToken() {
  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

export async function apiRequest(method: string, path: string, data?: any) {
  try {
    const token = await getCsrfToken();
    const response = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': token || '',
        'X-CSRF-Token': token || '',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

export async function login(username: string, password: string) {
  return apiRequest('POST', '/api/login', { username, password });
}

export async function register(data: any) {
  return apiRequest('POST', '/api/register', data);
}
