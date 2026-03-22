import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Store token and user info
      localStorage.setItem("admin_token", data.access_token);
      localStorage.setItem("user_name", data.user?.name || "User");
      localStorage.setItem("user_role", data.user?.role || "User");

      toast.success("Login successful!");
      router.replace("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Login failed. Please try again.");
    },
  });
};
