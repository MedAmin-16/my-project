import { QueryClient } from "@tanstack/react-query";

/**
 * Utility function to check if a response is ok. Throws if not.
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMsg = `${res.status} ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.message) {
        errorMsg = errorJson.message;
      }
    } catch (e) {
      // Ignore parse error, use the default error message
    }
    throw new Error(errorMsg);
  }
}

/**
 * Utility function to make API requests.
 */
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  body?: any,
  customHeaders?: HeadersInit
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(customHeaders || {}),
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return res;
}

/**
 * Options to control behavior when a 401 response is received.
 */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Creates a query function with custom behavior for 401 responses.
 */
export const getQueryFn = <T>({
  on401 = "throw",
}: {
  on401: UnauthorizedBehavior;
}) => {
  return async function queryFn({ queryKey }: { queryKey: string[] }): Promise<T> {
    const [url] = queryKey;
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (res.status === 401) {
      if (on401 === "returnNull") {
        return undefined as unknown as T;
      }
      throw new Error("Unauthorized");
    }

    await throwIfResNotOk(res);
    return res.json();
  };
};

/**
 * Configure and export the QueryClient instance.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      queryFn: getQueryFn({ on401: "throw" }),
    },
  },
});