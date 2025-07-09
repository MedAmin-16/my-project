import { QueryClient } from "@tanstack/react-query";

/**
 * Utility function to check if a response is ok. Throws if not.
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Request failed with status ${res.status}`);
  }
  return res;
}

/**
 * Utility function to make API requests.
 */
export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  customHeaders?: HeadersInit
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
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
  return await throwIfResNotOk(res);
}

/**
 * Options to control behavior when a 401 response is received.
 */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Creates a query function with custom behavior for 401 responses.
 */
export const getQueryFn =
  <T>({
    on401 = "throw",
  }: {
    on401?: UnauthorizedBehavior;
  }) =>
  async ({ queryKey }: { queryKey: string[] }) => {
    try {
      const res = await fetch(queryKey[0], {
        credentials: "include",
      });

      if (res.status === 401 && on401 === "returnNull") {
        return null as unknown as T;
      }

      await throwIfResNotOk(res);
      return (await res.json()) as T;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("401") &&
        on401 === "returnNull"
      ) {
        return null as unknown as T;
      }
      throw error;
    }
  };

/**
 * Configure and export the QueryClient instance.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});