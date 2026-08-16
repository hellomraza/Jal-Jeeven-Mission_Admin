import apiClient from "@/lib/api-client";

export const getWorkOrderTpis = async (params?: {
  district_id?: string;
  agreement_id?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await apiClient.get("/work-order-tpi", { params });
    return response.data?.data || response.data || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch TPI work orders",
    );
  }
};

export const getWorkOrderTpiById = async (id: string) => {
  try {
    const response = await apiClient.get(`/work-order-tpi/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch TPI work order details",
    );
  }
};

export const createWorkOrderTpi = async (data: any) => {
  try {
    const response = await apiClient.post("/work-order-tpi", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create TPI work order",
    );
  }
};

export const assignTpiToWorkOrder = async (
  workOrderTpiId: string,
  tpiId: string,
) => {
  try {
    const response = await apiClient.post(
      `/work-order-tpi/${workOrderTpiId}/assign-tpi`,
      { tpi_id: tpiId },
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to assign TPI officer",
    );
  }
};

export const getTpiReviewPhotos = async (
  workOrderTpiId: string,
  componentId: string,
) => {
  try {
    const response = await apiClient.get(
      `/work-order-tpi/${workOrderTpiId}/components/${componentId}/review-photos`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch review photos",
    );
  }
};

export const approveTpiComponent = async (
  workOrderTpiId: string,
  componentId: string,
  remarks?: string,
) => {
  try {
    const response = await apiClient.patch(
      `/work-order-tpi/${workOrderTpiId}/components/${componentId}/approve`,
      { remarks },
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to approve component",
    );
  }
};
