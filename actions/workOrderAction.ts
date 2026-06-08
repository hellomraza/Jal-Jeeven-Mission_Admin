import { createServerApiClient } from "@/lib/server-api-client";

export const getWorkItems = async (page = 1, limit = 20, search?: string) => {
  try {
    const serverApiClient = await createServerApiClient();
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) {
      queryParams.set("search", search);
    }
    const response = await serverApiClient.get<PaginatedResponse<WorkItem>>(
      `/work-items/my-work-items?${queryParams.toString()}`,
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
