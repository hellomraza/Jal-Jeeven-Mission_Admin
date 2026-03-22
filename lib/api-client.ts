import axios, { type AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Create an Axios instance with cookie-based authentication
 *
 * SECURITY:
 * - withCredentials: true ensures HTTP-only cookies are sent with every request
 * - NO token storage - rely entirely on backend HTTP-only cookies
 * - NO Authorization headers - cookies handle authentication
 *
 * Cookie-based flow:
 * 1. User logs in via POST /auth/login
 * 2. Backend sets HTTP-only cookie (access_token)
 * 3. Browser automatically includes cookie in all requests (withCredentials: true)
 * 4. No token ever stored in JavaScript
 * 5. XSS attacks cannot access the token
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, // CRITICAL: Send cookies with every request
  });

  // Response interceptor for handling auth errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized responses (expired session, invalid cookie, etc.)
      if (error.response?.status === 401 && typeof window !== "undefined") {
        // Redirect to login on next navigation
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          window.location.href = "/login?session=expired";
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
};

// Client-side singleton instance
let clientInstance: AxiosInstance | null = null;

const getClientInstance = (): AxiosInstance => {
  if (!clientInstance) {
    clientInstance = createApiClient();
  }
  return clientInstance;
};

/**
 * For client-side usage: uses a singleton instance
 * This Proxy allows the default export to be used naturally while
 * lazy-initializing the instance only when needed in the browser
 */
const apiClient = new Proxy({} as AxiosInstance, {
  get: (target, prop: string) => {
    const instance = getClientInstance();
    return (instance as any)[prop];
  },
});

/**
 * For server-side usage: creates a new instance per request
 *
 * Usage in server components:
 *
 * import { createServerApiClient } from '@/lib/api-client';
 *
 * export default async function Page() {
 *   const api = createServerApiClient();
 *   const response = await api.get('/endpoint');
 *   return <div>{response.data}</div>;
 * }
 */
export const createServerApiClient = (): AxiosInstance => {
  return createApiClient();
};

export default apiClient as unknown as AxiosInstance;
