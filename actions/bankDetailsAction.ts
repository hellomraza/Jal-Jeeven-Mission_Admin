"use server";

import crypto from "crypto";

export type VoucherUploadFile = {
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  publicId?: string;
  uploadedAt?: string;
};

export type VoucherUploadState = {
  success: string;
  error: string;
  uploadedFile: VoucherUploadFile | null;
};

const initialState: VoucherUploadState = {
  success: "",
  error: "",
  uploadedFile: null,
};

export async function uploadBankVoucherPdfAction(
  _previousState: VoucherUploadState,
  formData: FormData,
): Promise<VoucherUploadState> {
  try {
    const workItemId = String(formData.get("workItemId") || "").trim();
    const selectedFile = formData.get("file");

    if (!workItemId) {
      return {
        ...initialState,
        error: "Work Item ID is required",
      };
    }

    if (!(selectedFile instanceof File) || selectedFile.size === 0) {
      return {
        ...initialState,
        error: "Please select a voucher PDF file",
      };
    }

    if (selectedFile.type !== "application/pdf") {
      return {
        ...initialState,
        error: "Only PDF files are allowed for voucher upload",
      };
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      return {
        ...initialState,
        error: "PDF file size must be 15 MB or smaller",
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
    const folder = `bank-vouchers/${workItemId}`;
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
          "Failed to upload voucher PDF to Cloudinary",
      };
    }

    return {
      success: "PDF uploaded to Cloudinary successfully",
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
      error: error?.message || "Failed to upload voucher PDF to Cloudinary",
    };
  }
}
