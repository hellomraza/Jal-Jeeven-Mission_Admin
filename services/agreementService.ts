import apiClient from "@/lib/api-client";

export const getAgreements = async (page = 1, limit = 20) => {
  try {
    const response = await apiClient.get(`/agreements?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch agreements");
  }
};

