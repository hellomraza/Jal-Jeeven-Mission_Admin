"use server";
import { createServerApiClient } from "@/lib/server-api-client";
import { ActionState, validatedAction } from "@/utils/action-helper";
import {
  assignEmployeesSchema,
  createContractorSchema,
  createEmployeeSchema,
  createUserSchema,
  updateContractorSchema,
  updateEmployeeSchema,
} from "@/utils/validation";
import { AxiosError } from "axios";
import { revalidatePath } from "next/cache";

export const assignEmployees = async (
  previousState: ActionState,
  formData: FormData,
) => {
  try {
    const workItemId = formData.get("workItemId") as string;
    const employeeIds = formData.getAll("employeeIds") as string[];

    const payload = {
      workItemId,
      employeeIds,
    };

    const result = assignEmployeesSchema.safeParse(payload);
    if (!result.success) {
      return { error: result.error.errors[0].message, success: "" };
    }
    const apiClient = await createServerApiClient();
    await apiClient.post(`/work-items/${workItemId}/assign-employee`, {
      employee_ids: result.data.employeeIds,
    });

    return { success: "Employees assigned successfully", error: "" };
  } catch (err) {
    if (err instanceof AxiosError) {
      return {
        success: "",
        error:
          err.response?.data?.message ||
          "Failed to assign employees. Please try again.",
      };
    }

    return {
      success: "",
      error: "Failed to assign employees. Please try again.",
    };
  } finally {
    revalidatePath(`/work-order/update/[id]/employees`, "page");
  }
};

export const createEmployee = validatedAction(
  createEmployeeSchema,
  async (data: {
    name: string;
    email: string;
    mobile: string;
    address: string;
    password: string;
  }) => {
    try {
      const apiClient = await createServerApiClient();
      const response = await apiClient.post("/users/employee", data);
      if (response.data) {
        return { success: "Employee created successfully", error: "" };
      }
      return { success: "", error: "Failed to create employee" };
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          success: "",
          error:
            error.response?.data?.message ||
            "Failed to create employee. Please try again.",
        };
      }
      return {
        success: "",
        error: "Failed to create employee",
      };
    } finally {
      revalidatePath("/employees");
      revalidatePath("/work-order/update/[id]/employees");
    }
  },
);

export const createContractor = validatedAction(
  createContractorSchema,
  async (data: {
    name: string;
    email: string;
    password: string;
    mobile: string;
    pan_number: string;
    district_name: string;
    address: string;
  }) => {
    try {
      const apiClient = await createServerApiClient();
      const response = await apiClient.post("/users/contractor", data);
      if (response.data) {
        return { success: "Contractor created successfully", error: "" };
      }
      return { success: "", error: "Failed to create contractor" };
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          success: "",
          error:
            error.response?.data?.message ||
            "Failed to create contractor. Please try again.",
        };
      }
      return {
        success: "",
        error: "Failed to create contractor",
      };
    } finally {
      revalidatePath("/contractors");
    }
  },
);

export const updateEmployee = validatedAction(
  updateEmployeeSchema,
  async (data: {
    id: string;
    name: string;
    email: string;
    password?: string;
    mobile: string;
    address: string;
  }) => {
    try {
      const apiClient = await createServerApiClient();
      const { id, ...updateData } = data;
      const response = await apiClient.patch(
        `/users/employee/${id}`,
        updateData,
      );
      if (response.data) {
        return { success: "Employee updated successfully", error: "" };
      }
      return { success: "", error: "Failed to update employee" };
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          success: "",
          error:
            error.response?.data?.message ||
            "Failed to update employee. Please try again.",
        };
      }
      return {
        success: "",
        error: "Failed to update employee",
      };
    } finally {
      revalidatePath("/employees");
      revalidatePath("/work-order/update/[id]/employees");
    }
  },
);

export const updateContractor = validatedAction(
  updateContractorSchema,
  async (data: {
    id: string;
    name: string;
    email: string;
    password?: string;
    mobile: string;
    pan_number: string;
    district_name: string;
    address: string;
  }) => {
    try {
      const apiClient = await createServerApiClient();
      const { id, ...updateData } = data;
      const response = await apiClient.patch(
        `/users/contractor/${id}`,
        updateData,
      );
      if (response.data) {
        return { success: "Contractor updated successfully", error: "" };
      }
      return { success: "", error: "Failed to update contractor" };
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          success: "",
          error:
            error.response?.data?.message ||
            "Failed to update contractor. Please try again.",
        };
      }
      return {
        success: "",
        error: "Failed to update contractor",
      };
    } finally {
      revalidatePath("/contractors");
    }
  },
);

export const createDistrictOfficer = validatedAction(
  createUserSchema,
  async (data: { name: string; email: string; password: string }) => {
    try {
      const apiClient = await createServerApiClient();
      const response = await apiClient.post("/users/do", data);
      if (response.data) {
        return { success: "District Officer created successfully", error: "" };
      }
      return { success: "", error: "Failed to create District Officer" };
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          success: "",
          error:
            error.response?.data?.message ||
            "Failed to create District Officer. Please try again.",
        };
      }
      return {
        success: "",
        error: "Failed to create District Officer",
      };
    } finally {
      revalidatePath("/district-officers");
    }
  },
);
