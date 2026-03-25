"use server";
import { createServerApiClient } from "@/lib/server-api-client";
import { validatedAction } from "@/utils/action-helper";
import { updateComponentSchema } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export const updateComponent = validatedAction(
  updateComponentSchema,
  async ({ componentId, quantity, workItemId }) => {
    try {
      const apiClient = await createServerApiClient();
      await apiClient.patch(`/components/${componentId}`, {
        quantity: quantity,
      });
      return { success: "Component updated successfully", error: "" };
    } catch (error) {
      return { success: "", error: "Failed to update component" };
    } finally {
      revalidatePath(`/work-order/update/${workItemId}`);
    }
  },
);

export const approveComponent = async (componentId: string) => {
  try {
    const apiClient = await createServerApiClient();
    await apiClient.patch(`/components/${componentId}/approve`);
    return { success: "Component approved successfully", error: "" };
  } catch (error) {
    return { success: "", error: "Failed to approve component" };
  } finally {
    revalidatePath(`/work-order/update/[id]`, "page");
  }
};

export const rejectComponent = async (componentId: string) => {
  try {
    const apiClient = await createServerApiClient();
    await apiClient.patch(`/components/${componentId}/reject`);
    return { success: "Component rejected successfully", error: "" };
  } catch (error) {
    return { success: "", error: "Failed to reject component" };
  } finally {
    revalidatePath(`/work-order/update/[id]`, "page");
  }
};
