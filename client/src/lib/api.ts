
export async function apiRequest(method: string, path: string, data?: any) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
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
