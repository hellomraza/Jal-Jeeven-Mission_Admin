import apiClient from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch current user data from the API
 *
 * SECURITY:
 * - Fetches user info server-side when possible
 * - No user data stored in localStorage (prevents XSS exposure)
 * - Uses query caching to minimize API calls
 * - Automatically includes HTTP-only cookie in request
 *
 * This replaces localStorage usage for user_name and user_role
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/auth/me");
        return response.data;
      } catch (error: any) {
        // If user is not authenticated, return null
        if (error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    // Cache for 5 minutes
    staleTime: 1000 * 60 * 5,
    // Don't refetch unnecessarily
    refetchOnWindowFocus: false,
  });
};

/**
 * Server-side helper to fetch current user
 * Usage in server components:
 *
 * import { fetchCurrentUser } from "@/hooks/useCurrentUser";
 *
 * export default async function Page() {
 *   const user = await fetchCurrentUser();
 *   return <div>{user?.name}</div>;
 * }
 */
export const fetchCurrentUser = async () => {
  try {
    const { createServerApiClient } = await import("@/lib/api-client");
    const api = createServerApiClient();
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};
