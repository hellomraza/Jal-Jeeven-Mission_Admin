import { logoutUserAction } from "@/actions/authAction";

export const handleLogout = async () => {
  try {
    localStorage.removeItem("admin_token");
    await logoutUserAction();
  } catch (err) {
    console.error("Logout failed", err);
  }
};
