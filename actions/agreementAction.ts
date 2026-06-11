"use server";

import { createServerApiClient } from "@/lib/server-api-client";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

type AgreementUploadFile = {
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  publicId?: string;
  uploadedAt?: string;
};

type AgreementUploadState = {
  success: string;
  error: string;
  uploadedFile: AgreementUploadFile | null;
};

const initialState: AgreementUploadState = {
  success: "",
  error: "",
  uploadedFile: null,
};

export async function uploadAgreementPdfAction(
  _previousState: AgreementUploadState,
  formData: FormData,
): Promise<AgreementUploadState> {
  try {
    const agreementId = String(formData.get("agreementId") || "").trim();
    const selectedFile = formData.get("file");

    if (!agreementId) {
      return {
        ...initialState,
        error: "Agreement ID is required",
      };
    }

    if (!(selectedFile instanceof File) || selectedFile.size === 0) {
      return {
        ...initialState,
        error: "Please select a PDF file",
      };
    }

    if (selectedFile.type !== "application/pdf") {
      return {
        ...initialState,
        error: "Only PDF files are allowed",
      };
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      return {
        ...initialState,
        error: "PDF must be 15 MB or smaller",
      };
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return {
        ...initialState,
        error:
          "Missing Cloudinary server configuration (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)",
      };
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `agreements/${agreementId}`;
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
        ...initialState,
        error:
          responseData?.error?.message ||
          responseData?.message ||
          "Failed to upload PDF to Cloudinary",
      };
    }

    return {
      success: "Uploaded to Cloudinary",
      error: "",
      uploadedFile: {
        fileUrl: responseData?.secure_url,
        fileName: responseData?.original_filename || selectedFile.name,
        mimeType:
          selectedFile.type || responseData?.format || "application/pdf",
        fileSize: responseData?.bytes || selectedFile.size,
        publicId: responseData?.public_id,
        uploadedAt: responseData?.created_at,
      },
    };
  } catch (error: any) {
    return {
      ...initialState,
      error: error?.message || "Failed to upload PDF to Cloudinary",
    };
  }
}

export const attachAgreementFile = async (
  agreementId: string,
  payload: {
    fileUrl: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
  },
) => {
  try {
    const apiClient = await createServerApiClient();
    const response = await apiClient.post(
      `/agreements/${agreementId}/files`,
      payload,
    );
    revalidatePath("/(private)/agreement");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to attach agreement file",
    );
  }
};

export type UpdateSecurityDepositState = {
  success: string;
  error: string;
};

export async function updateSecurityDepositAction(
  _previousState: UpdateSecurityDepositState,
  formData: FormData,
): Promise<UpdateSecurityDepositState> {
  try {
    const agreementId = String(formData.get("agreementId") || "").trim();
    const securityDepositVal = String(formData.get("security_deposit") || "").trim();

    if (!agreementId) {
      return { success: "", error: "Agreement ID is required" };
    }

    if (!securityDepositVal) {
      return { success: "", error: "Security deposit is required" };
    }

    const securityDeposit = Number(securityDepositVal);
    if (isNaN(securityDeposit)) {
      return { success: "", error: "Security deposit must be a number" };
    }

    const apiClient = await createServerApiClient();
    await apiClient.patch(`/agreements/${agreementId}/security-deposit`, {
      security_deposit: securityDeposit,
    });

    revalidatePath("/(private)/agreement");

    return {
      success: "Security deposit updated successfully",
      error: "",
    };
  } catch (error: any) {
    return {
      success: "",
      error: error.response?.data?.message || error.message || "Failed to update security deposit",
    };
  }
}

