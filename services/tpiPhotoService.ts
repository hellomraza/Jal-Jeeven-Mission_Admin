import apiClient from "@/lib/api-client";

export interface TpiReferencePhoto {
  id: string;
  image_url: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string | null;
  component_id: string;
  work_item_id: string;
  created_at: string;
  uploaded_by_user_id: string;
  employee?: {
    id: string;
    name: string;
    email: string;
    code?: string;
  };
}

export interface TpiReferenceStatusResponse {
  id: string;
  photo_id: string;
  work_item_id: string;
  component_id: string;
  status: "UPLOADED" | "SELECTED";
  selected_by?: string | null;
  selected_at?: string | null;
  selectedByUser?: {
    id: string;
    name: string;
    code?: string;
  } | null;
  photo?: TpiReferencePhoto;
}

export const getTpiReferencePhotos = async (componentId: string) => {
  try {
    const response = await apiClient.get<TpiReferencePhoto[]>(
      `/components/${componentId}/tpi-reference-photos`,
    );
    return response.data || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch TPI reference photos",
    );
  }
};

export const getTpiReferencePhotoStatus = async (componentId: string) => {
  try {
    const response = await apiClient.get<TpiReferenceStatusResponse>(
      `/tpi-photo-status/component/${componentId}`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch TPI reference photo status",
    );
  }
};

export const selectTpiReferencePhoto = async (photoId: string) => {
  try {
    const response = await apiClient.post<TpiReferenceStatusResponse>(
      `/tpi-photo-status/select/${photoId}`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to select reference photo",
    );
  }
};

export const deselectTpiReferencePhoto = async (photoId: string) => {
  try {
    const response = await apiClient.post<TpiReferenceStatusResponse>(
      `/tpi-photo-status/deselect/${photoId}`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to deselect reference photo",
    );
  }
};
