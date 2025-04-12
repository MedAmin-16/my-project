export async function apiRequest(method: string, path: string, data?: any) {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return response;
}

export async function login(username: string, password: string) {
  const token = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN'))?.split('=')[1];
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": token || '',
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
}