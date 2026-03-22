"use server";

import { createServerApiClient } from "@/lib/server-api-client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const loginUserAction = async (credentials: {
  email: string;
  password: string;
}) => {
  const apiClient = await createServerApiClient();
  const response = await apiClient.post("/auth/login", credentials);

  const cookieStore = await cookies();

  cookieStore.set("admin_token", response.data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response.data;
};

export const logoutUserAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/login");
};
