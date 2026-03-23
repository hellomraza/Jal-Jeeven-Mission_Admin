import apiClient from "@/lib/api-client";

export const getUserInfo = async () => {
  try {
    const response = await apiClient.get("/users/my-profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
};

export const getContractors = async (page = 1, limit = 500) => {
  try {
    const response = await apiClient.get(`/users?page=${page}&limit=${limit}`);
    const users = response.data?.data || [];
    return users.filter((user: any) => user.role === "CO");
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch contractors",
    );
  }
};
