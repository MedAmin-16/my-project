
export async function getCsrfToken() {
  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include' // Important for cookies
    });
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}

export async function apiRequest(method: string, path: string, data?: any) {
  try {
    // Skip CSRF for login and register endpoints
    const needsCsrf = !path.endsWith('/login') && !path.endsWith('/register');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Include CSRF token for POST/PUT/DELETE requests except login, register and logout
    if ((needsCsrf || ['POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) && 
        !path.endsWith('/logout') && 
        !path.endsWith('/login') && 
        !path.endsWith('/register')) {
      const csrfToken = await getCsrfToken();
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    const response = await fetch(path, {
      method,
      headers,
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
