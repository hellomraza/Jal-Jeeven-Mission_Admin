import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

/**
 * Hook for secure logout with cookie-based authentication
 *
 * SECURITY:
 * - Calls backend to invalidate session/clear cookie
 * - Clears client-side cache (React Query)
 * - Redirects to login page
 * - No localStorage manipulation
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      // Call backend to clear HTTP-only cookie and invalidate session
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies in request
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Clear client-side cache (removes useCurrentUser data, etc.)
      queryClient.clear();

      // Always redirect to login, even if API call fails
      // (cookie might already be cleared)
      if (response.ok) {
        toast.success("Logged out successfully");
      }

      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if there's an error
      router.push("/login");
    }
  };

  return { logout };
};
