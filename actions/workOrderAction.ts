import { createServerApiClient } from "@/lib/server-api-client";

export const getWorkItems = async (page = 1, limit = 20) => {
  try {
    const serverApiClient = await createServerApiClient();
    const response = await serverApiClient.get<PaginatedResponse<WorkItem>>(
      `/work-items/my-work-items?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch work items",
    );
  }
};
