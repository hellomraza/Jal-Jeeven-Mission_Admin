"use server";

import { createServerApiClient } from "@/lib/server-api-client";
import { loginSchema } from "@/utils/validation";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type LoginResponse = {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export const loginUserAction = async (formData: FormData) => {
  try {
    const identifier = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";

    const apiClient = await createServerApiClient();

    let response;

    // If identifier contains '@' treat it as email and use existing dashboard login
    if (identifier.includes("@")) {
      const data = { email: identifier, password };
      const credentials = loginSchema.safeParse(data);
      if (!credentials.success) {
        return {
          error: "Invalid input. Please check your email and password.",
        };
      }
      response = await apiClient.post<LoginResponse>(
        "/auth/dashboard/login",
        credentials.data,
      );
    } else {
      // Treat identifier as user code and call code login endpoint
      const codeLoginSchema = {
        code: String(identifier),
        password: String(password),
      };
      if (!codeLoginSchema.code) {
        return { error: "Invalid input. Please enter a valid user code." };
      }
      response = await apiClient.post<LoginResponse>(
        "/auth/login/code",
        codeLoginSchema,
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("admin_token", response.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    cookieStore.set("admin_role", response.data.user?.role || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return { data: response.data, error: "" };
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        error:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
    return { error: "An unexpected error occurred. Please try again." };
  }
};

export const logoutUserAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/login");
};
