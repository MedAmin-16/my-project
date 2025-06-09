
export async function apiRequest(method: string, path: string, data?: any) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest' // CSRF protection
    };
    
    // Add admin token for admin endpoints
    if (path.startsWith('/api/admin/')) {
      const tokenData = localStorage.getItem('adminToken');
      if (tokenData) {
        try {
          const parsedTokenData = JSON.parse(tokenData);
          const { token, expiresAt } = parsedTokenData;
          
          // Check token expiration
          if (token && expiresAt && Date.now() < expiresAt) {
            // Validate token format
            if (/^[a-f0-9]{64}$/i.test(token)) {
              headers['Authorization'] = `Bearer ${token}`;
            } else {
              localStorage.removeItem('adminToken');
              throw new Error('Invalid token format');
            }
          } else {
            localStorage.removeItem('adminToken');
            throw new Error('Token expired');
          }
        } catch (parseError) {
          // Handle legacy token format
          if (typeof tokenData === 'string' && /^[a-f0-9]{64}$/i.test(tokenData)) {
            headers['Authorization'] = `Bearer ${tokenData}`;
          } else {
            localStorage.removeItem('adminToken');
            throw new Error('Invalid token');
          }
        }
      }
    }
    
    // Sanitize data
    let sanitizedData = data;
    if (data && typeof data === 'object') {
      sanitizedData = Object.keys(data).reduce((acc, key) => {
        if (typeof data[key] === 'string') {
          acc[key] = data[key].trim().replace(/\0/g, ''); // Remove null bytes
        } else {
          acc[key] = data[key];
        }
        return acc;
      }, {} as any);
    }
    
    const response = await fetch(path, {
      method,
      headers,
      credentials: 'include',
      body: sanitizedData ? JSON.stringify(sanitizedData) : undefined,
    });

    if (!response.ok) {
      // Handle auth errors specifically
      if (response.status === 401 && path.startsWith('/api/admin/')) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin';
        return;
      }
      
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || 'Request failed');
    }

    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Secure logout function for admin
export async function adminLogout() {
  try {
    await apiRequest('POST', '/api/admin/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('adminToken');
    // Clear all session storage
    sessionStorage.clear();
    // Redirect to admin login
    window.location.href = '/admin';
  }
}

export async function login(username: string, password: string) {
  return apiRequest('POST', '/api/login', { username, password });
}

export async function register(data: any) {
  return apiRequest('POST', '/api/register', data);
}
