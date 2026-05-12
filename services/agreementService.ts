import apiClient from "@/lib/api-client";

export type AgreementImport = {
  agrid: number | null;
  agreementno: string | null;
  agreementyear: string | null;
  division_code: number | null;
  contractor_code: string | null;
  workcode: string | null;
  workorderno: string | null;
  workorderdate: Date | null;
  systemdate: Date | null;
  unitag: string | null;
  excel: string | null;
  sr: string | null;
};

export type AgreementBulkImportResult = {
  inserted: AgreementImport[];
  errors: { index: number; reason: string; item: AgreementImport }[];
};

export const getAgreements = async (page = 1, limit = 20) => {
  try {
    const response = await apiClient.get(
      `/agreements?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch agreements",
    );
  }
};

export const uploadAgreementFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      "/import/upload?type=agreement",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to upload agreement file",
    );
  }
};

export const bulkImportAgreements = async (
  agreements: AgreementImport[],
): Promise<AgreementBulkImportResult> => {
  try {
    const response = await apiClient.post("/import/agreements/bulk", {
      agreements,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to import agreements",
    );
  }
};

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
    const response = await apiClient.post(
      `/agreements/${agreementId}/attach-file`,
      payload,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to attach agreement file",
    );
  }
};
