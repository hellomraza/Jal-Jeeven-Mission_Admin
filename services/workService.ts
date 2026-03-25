import apiClient from "@/lib/api-client";

export const getWorkItems = async (page = 1, limit = 20) => {
  try {
    const response = await apiClient.get<PaginatedResponse<WorkItem>>(
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

export const getWorkItem = async (id: string) => {
  try {
    const response = await apiClient.get(`/work-items/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch work item details",
    );
  }
};

export const getWorkItemComponents = async (workItemId: string) => {
  try {
    const response = await apiClient.get(`/components/work-item/${workItemId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch work item components",
    );
  }
};

export const getComponentDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`/components/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch component details",
    );
  }
};

export const updateWorkItemComponent = async (id: string, payload: any) => {
  try {
    const response = await apiClient.patch(`/components/${id}`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update component",
    );
  }
};

export const getComponentPhotos = async (componentId: string) => {
  try {
    const response = await apiClient.get(
      `/photos/component/${componentId}/review`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch component photos",
    );
  }
};

export const createWorkItem = async (payload: any) => {
  try {
    const response = await apiClient.post(`/work-items`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create work item",
    );
  }
};

export const getUsers = async (page = 1, limit = 100) => {
  try {
    const response = await apiClient.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

export const selectComponentPhoto = async (
  componentId: string,
  photoId: string,
) => {
  try {
    const response = await apiClient.post(
      `/components/${componentId}/select-photo`,
      { photoId },
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to select photo");
  }
};

export const getDOInfoByWorkItemId = async (workItemId: string) => {
  try {
    const response = await apiClient.get(`/work-items/${workItemId}/do-info`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch DO info for work item",
    );
  }
};

export const getWorkItemEmployees = async (workItemId: string) => {
  try {
    const response = await apiClient.get(`/work-items/${workItemId}/employees`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch work item employees",
    );
  }
};
