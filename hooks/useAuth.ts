import { loginUser } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

/**
 * SECURITY: Updated for cookie-based authentication
 *
 * Changes:
 * - NO longer stores token in localStorage (XSS safe)
 * - NO longer stores user data in localStorage
 * - Backend sets HTTP-only cookie automatically
 * - Cookie handled transparently by axios withCredentials
 *
 * Flow:
 * 1. User submits credentials
 * 2. Backend validates and sets HTTP-only cookie
 * 3. Cookie automatically sent with all subsequent requests
 * 4. No token exposure to JavaScript
 */
export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // ✅ DO NOT store token - backend handles HTTP-only cookie
      // ✅ Backend sets access_token cookie automatically
      // User info can be fetched on demand via API if needed

      toast.success("Login successful!");
      router.replace("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Login failed. Please try again.");
    },
  });
};
