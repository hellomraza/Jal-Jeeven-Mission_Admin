"use server";

import { createServerApiClient } from "@/lib/server-api-client";
import { validatedAction } from "@/utils/action-helper";
import { updateWorkOrderSchema } from "@/utils/validation";
import { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

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

export const updateWorkOrderAction = validatedAction(
  updateWorkOrderSchema,
  async (data) => {
    try {
      const serverApiClient = await createServerApiClient();
      const { id, ...payload } = data;
      const response = await serverApiClient.patch(`/work-items/${id}`, {
        ...payload,
        workcodeid: payload.workcodeid || undefined,
        excel: payload.excel || undefined,
        district_id: payload.district_id || undefined,
        block_id: payload.block_id || undefined,
        panchayat_id: payload.panchayat_id || undefined,
        nofhtc: payload.nofhtc || undefined,
        amount_approved:
          payload.amount_approved !== undefined
            ? payload.amount_approved
            : undefined,
        sr: payload.sr !== undefined ? payload.sr : undefined,
        agreement_id: payload.agreement_id || null,
        title: payload.title || undefined,
        latitude: payload.latitude !== undefined ? payload.latitude : undefined,
        longitude:
          payload.longitude !== undefined ? payload.longitude : undefined,
        progress_percentage:
          payload.progress_percentage !== undefined
            ? payload.progress_percentage
            : undefined,
        status: payload.status || undefined,
      });
      if (response.data) {
        return { success: "Work item updated successfully", error: "" };
      }
      return { success: "", error: "Failed to update work item" };
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          success: "",
          error:
            error.response?.data?.message ||
            "Failed to update work item. Please try again.",
        };
      }
      return {
        success: "",
        error: "Failed to update work item",
      };
    } finally {
      revalidatePath(`/work-order`);
    }
  },
);
