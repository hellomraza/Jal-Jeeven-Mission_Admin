"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function switchAppModeAction(mode: string) {
  const cookieStore = await cookies();
  cookieStore.set("admin_app_mode", mode, {
    path: "/",
    maxAge: 31536000,
  });

  // Revalidate entire application layout and all subpaths
  revalidatePath("/", "layout");
  revalidatePath("/agreement", "page");
  revalidatePath("/work-order", "page");
  revalidatePath("/dashboard", "page");
  return { success: true };
}
