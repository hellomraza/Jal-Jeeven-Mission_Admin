"use server";

import { createServerApiClient } from "@/lib/server-api-client";
import { ActionState } from "@/utils/action-helper";
import { AxiosError } from "axios";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export type PaymentVoucherUploadState = {
  success: string;
  error: string;
  uploadedFile: {
    fileUrl: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  } | null;
};

export const uploadPaymentVoucherPdfAction = async (
  _previousState: PaymentVoucherUploadState,
  formData: FormData,
): Promise<PaymentVoucherUploadState> => {
  try {
    const selectedFile = formData.get("file");

    if (!(selectedFile instanceof File) || selectedFile.size === 0) {
      return {
        success: "",
        error: "Please select a voucher PDF file",
        uploadedFile: null,
      };
    }

    if (selectedFile.type !== "application/pdf") {
      return {
        success: "",
        error: "Only PDF files are allowed for voucher upload",
        uploadedFile: null,
      };
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      return {
        success: "",
        error: "PDF file size must be 15 MB or smaller",
        uploadedFile: null,
      };
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return {
        success: "",
        error:
          "Missing Cloudinary server configuration (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)",
        uploadedFile: null,
      };
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `payment-vouchers`;
    const signatureBase = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(signatureBase + apiSecret)
      .digest("hex");

    const uploadForm = new FormData();
    uploadForm.append("file", selectedFile, selectedFile.name);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", String(timestamp));
    uploadForm.append("signature", signature);
    uploadForm.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      {
        method: "POST",
        body: uploadForm,
      },
    );

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: "",
        error:
          responseData?.error?.message ||
          responseData?.message ||
          "Failed to upload voucher PDF to Cloudinary",
        uploadedFile: null,
      };
    }

    return {
      success: "Voucher PDF uploaded successfully",
      error: "",
      uploadedFile: {
        fileUrl: responseData?.secure_url,
        fileName: responseData?.original_filename || selectedFile.name,
        mimeType: selectedFile.type || "application/pdf",
        fileSize: responseData?.bytes || selectedFile.size,
      },
    };
  } catch (error: any) {
    return {
      success: "",
      error: error?.message || "Failed to upload voucher PDF",
      uploadedFile: null,
    };
  }
};

export const createPaymentAction = async (
  previousState: ActionState,
  formData: FormData,
) => {
  try {
    const contractor_name = (formData.get("contractor_name") as string) || "";
    const contractor_code = (formData.get("contractor_code") as string) || "";
    const work_order_code = (formData.get("work_order_code") as string) || "";
    const bank_name = (formData.get("bank_name") as string) || "";
    const bank_account_number =
      (formData.get("bank_account_number") as string) || "";
    const ifsc_code = (formData.get("ifsc_code") as string) || "";
    const branch = (formData.get("branch") as string) || "";
    const amount = Number(formData.get("amount"));
    const voucher_number = (formData.get("voucher_number") as string) || "";
    const cheque_number = (formData.get("cheque_number") as string) || "";
    const voucher_file_url = (formData.get("voucher_file_url") as string) || "";
    const file_name = (formData.get("file_name") as string) || "";
    const file_size = Number(formData.get("file_size")) || undefined;

    if (
      !contractor_name ||
      !contractor_code ||
      !work_order_code ||
      !bank_name ||
      !bank_account_number ||
      !ifsc_code ||
      !branch ||
      !voucher_number ||
      isNaN(amount) ||
      amount <= 0
    ) {
      return {
        error: "All required fields including voucher number and a valid amount must be filled.",
        success: "",
      };
    }

    const payload = {
      contractor_name,
      contractor_code,
      work_order_code,
      bank_name,
      bank_account_number,
      ifsc_code,
      branch,
      amount,
      voucher_number,
      cheque_number: cheque_number || undefined,
      voucher_file_url: voucher_file_url || undefined,
      file_name: file_name || undefined,
      file_size: file_size || undefined,
    };

    const apiClient = await createServerApiClient();
    const response = await apiClient.post("/payments", payload);

    revalidatePath("/completed-workflows");
    return { data: response.data, success: "Payment record created successfully.", error: "" };
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        error:
          error.response?.data?.message ||
          "Failed to create payment record. Please try again.",
        success: "",
      };
    }
    return { error: "An unexpected error occurred.", success: "" };
  }
};

export const updatePaymentAction = async (
  previousState: ActionState,
  formData: FormData,
) => {
  try {
    const id = formData.get("id") as string;
    const contractor_name = (formData.get("contractor_name") as string) || "";
    const contractor_code = (formData.get("contractor_code") as string) || "";
    const work_order_code = (formData.get("work_order_code") as string) || "";
    const bank_name = (formData.get("bank_name") as string) || "";
    const bank_account_number =
      (formData.get("bank_account_number") as string) || "";
    const ifsc_code = (formData.get("ifsc_code") as string) || "";
    const branch = (formData.get("branch") as string) || "";
    const amount = Number(formData.get("amount"));
    const voucher_number = (formData.get("voucher_number") as string) || "";
    const cheque_number = (formData.get("cheque_number") as string) || "";
    const voucher_file_url = (formData.get("voucher_file_url") as string) || "";
    const file_name = (formData.get("file_name") as string) || "";
    const file_size = Number(formData.get("file_size")) || undefined;

    if (!id) {
      return { error: "Payment ID is required.", success: "" };
    }

    const payload: any = {};
    if (contractor_name) payload.contractor_name = contractor_name;
    if (contractor_code) payload.contractor_code = contractor_code;
    if (work_order_code) payload.work_order_code = work_order_code;
    if (bank_name) payload.bank_name = bank_name;
    if (bank_account_number) payload.bank_account_number = bank_account_number;
    if (ifsc_code) payload.ifsc_code = ifsc_code;
    if (branch) payload.branch = branch;
    if (!isNaN(amount) && amount > 0) payload.amount = amount;
    if (voucher_number) payload.voucher_number = voucher_number;
    if (voucher_file_url) payload.voucher_file_url = voucher_file_url;
    if (file_name) payload.file_name = file_name;
    if (file_size) payload.file_size = file_size;
    payload.cheque_number = cheque_number || null;

    const apiClient = await createServerApiClient();
    const response = await apiClient.patch(`/payments/${id}`, payload);

    revalidatePath("/completed-workflows");
    return { data: response.data, success: "Payment record updated successfully.", error: "" };
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        error:
          error.response?.data?.message ||
          "Failed to update payment record. Please try again.",
        success: "",
      };
    }
    return { error: "An unexpected error occurred.", success: "" };
  }
};

export const sendToDOAction = async (id: string) => {
  try {
    const apiClient = await createServerApiClient();
    const response = await apiClient.post(`/payments/${id}/send-to-do`, {
      details_verified: true,
      amount_verified: true,
    });
    revalidatePath("/completed-workflows");
    return { success: true, data: response.data, error: null };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to send to DO",
    };
  }
};

export const doCheckPaymentAction = async (id: string) => {
  try {
    const apiClient = await createServerApiClient();
    const response = await apiClient.post(`/payments/${id}/do-check`, {
      details_verified: true,
      amount_verified: true,
    });
    revalidatePath("/completed-workflows");
    return { success: true, data: response.data, error: null };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to verify details",
    };
  }
};

export const sendToEEAction = async (id: string) => {
  try {
    const apiClient = await createServerApiClient();
    const response = await apiClient.post(`/payments/${id}/send-to-ee`, {});
    revalidatePath("/completed-workflows");
    return { success: true, data: response.data, error: null };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to send to Executive Engineer",
    };
  }
};

export const eeCheckPaymentAction = async (id: string) => {
  try {
    const apiClient = await createServerApiClient();
    const response = await apiClient.post(`/payments/${id}/ee-check`, {
      details_verified: true,
      amount_verified: true,
    });
    revalidatePath("/completed-workflows");
    return { success: true, data: response.data, error: null };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to verify details",
    };
  }
};

export const deletePaymentAction = async (id: string) => {
  try {
    const apiClient = await createServerApiClient();
    const response = await apiClient.delete(`/payments/${id}`);
    revalidatePath("/completed-workflows");
    return { success: true, data: response.data, error: null };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to delete payment record",
    };
  }
};
