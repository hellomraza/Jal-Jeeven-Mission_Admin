import "server-only";

import axios, { AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";

const SERVER_API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://jjm-backend.vercel.app";

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
    async (error) => {
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
        return Promise.reject(new Error("Unauthorized: User not found"));
      }
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
