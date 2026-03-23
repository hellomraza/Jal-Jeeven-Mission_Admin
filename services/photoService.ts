import apiClient from "@/lib/api-client";

export const getPhotoById = async (id: string) => {
  try {
    const response = await apiClient.get(`/photos/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch photo details",
    );
  }
};
