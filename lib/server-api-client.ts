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

  const client = axios.create({
    baseURL: SERVER_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

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
