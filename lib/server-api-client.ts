import "server-only";

import axios, { AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";

const SERVER_API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:3000";

type ServerApiClientOptions = {
  token?: string;
  headers?: Record<string, string>;
};

export const createServerApiClient = async (
  options: ServerApiClientOptions = {},
) => {
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get("admin_token")?.value;
  const token = options.token || tokenFromCookie;
  console.log("Creating server API client with token:", token);

  const client = axios.create({
    baseURL: SERVER_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn("Unauthorized request - token may be invalid or expired");
      }

      // if error message is "User #some-uuid not found" and status is 404, it means the token is valid but the user does not exist
      if (
        error.response?.status === 404 &&
        typeof error.response?.data?.message === "string" &&
        error.response?.data?.message.includes("User #") &&
        error.response?.data?.message.includes("not found")
      ) {
        // Throw a specific error that Server Actions/Route Handlers can catch to clear the token and redirect
        const userDeletedError = new Error(
          "User account has been deleted or no longer exists",
        );
        (userDeletedError as any).code = "USER_DELETED";
        (userDeletedError as any).status = 404;
        return Promise.reject(userDeletedError);
      }
      console.log(error.response);
      return Promise.reject(error);
    },
  );

  return client;
};

export const serverApiRequest = async <T = unknown>(
  config: AxiosRequestConfig,
  options?: ServerApiClientOptions,
) => {
  const client = await createServerApiClient(options);
  const response = await client.request<T>(config);
  return response.data;
};
