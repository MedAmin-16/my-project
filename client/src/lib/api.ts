
export async function apiRequest(method: string, path: string, data?: any) {
  const token = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN'))?.split('=')[1];
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token || '',
    },
    credentials: 'same-origin',
    body: data ? JSON.stringify(data) : undefined,
  });
  return response;
}

export async function login(username: string, password: string) {
  return apiRequest('POST', '/api/login', { username, password });
}
