import apiClient from "@/lib/api-client";

export type LocationType =
  | "districts"
  | "blocks"
  | "panchayats"
  | "villages"
  | "subdivisions"
  | "circles"
  | "zones";

export const getLocationsByType = async (
  type: LocationType,
  page = 1,
  limit = 1000,
) => {
  try {
    const response = await apiClient.get(
      `/locations/${type}?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || `Failed to fetch ${type}`);
  }
};
