import apiClient from "@/lib/api-client";

export enum PhotoStatusState {
  UPLOADED = "UPLOADED",
  SELECTED = "SELECTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export type PhotoStatusPhoto = {
  id: string;
  image_url: string;
  latitude: string | number | null;
  longitude: string | number | null;
  timestamp: string | null;
  employee_id: string | null;
  employee?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

export type PhotoStatusRecord = {
  id: string;
  photo_id: string;
  work_item_id: string;
  component_id: string;
  status: PhotoStatusState;
  selected_by: string | null;
  selectedByUser?: {
    id: string;
    name: string | null;
    email: string | null;
    code?: string | null;
  } | null;
  selected_at: string | null;
  approved_by: string | null;
  approvedByUser?: {
    id: string;
    name: string | null;
    email: string | null;
    code?: string | null;
  } | null;
  approved_at: string | null;
  rejected_by?: string | null;
  rejectedByUser?: {
    id: string;
    name: string | null;
    email: string | null;
    code?: string | null;
  } | null;
  rejected_at?: string | null;
  photo: PhotoStatusPhoto;
  workItem: WorkItem;
  workItemComponent: WorkItemComponent;
};

export const selectPhotoStatus = async (photoId: string) => {
  try {
    const response = await apiClient.post(`/photo-status/select/${photoId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to select photo");
  }
};

export const deselectPhotoStatus = async (photoId: string) => {
  try {
    const response = await apiClient.post(`/photo-status/deselect/${photoId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to deselect photo",
    );
  }
};

export const approvePhotoStatus = async (photoId: string) => {
  try {
    const response = await apiClient.post(`/photo-status/approve/${photoId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to approve photo");
  }
};

export const rejectPhotoStatus = async (photoId: string) => {
  try {
    const response = await apiClient.post(`/photo-status/reject/${photoId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to reject photo");
  }
};

export const getComponentPhotoStatuses = async (
  componentId: string,
  page = 1,
  limit = 20,
) => {
  try {
    const response = await apiClient.get(
      `/photo-status/component/${componentId}?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch component photo statuses",
    );
  }
};
