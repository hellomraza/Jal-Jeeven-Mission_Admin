import apiClient from "@/lib/api-client";

export const getUserInfo = async () => {
  try {
    const response = await apiClient.get("/users/my-profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
};

export const getContractors = async (page = 1, limit = 1000, search?: string) => {
  try {
    const response = await apiClient.get(`/users/contractors`, {
      params: { page, limit, search },
    });
    return response.data?.data || response.data || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch contractors",
    );
  }
};

export const getEmployees = async (page = 1, limit = 500) => {
  try {
    const response = await apiClient.get(`/users/employees`);
    return response.data || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch employees",
    );
  }
};

export const getDistrictOfficers = async () => {
  try {
    const response = await apiClient.get(`/users/dos`);
    return response.data || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch district officers",
    );
  }
};

export type ImportedContractor = {
  contractorid: number | null;
  contractorname: string | null;
  contractor_code: string | null;
  contractorpass: string | null;
  pannumber: string | null;
  contractorclass: string | null;
  contractoremail: string | null;
  contractorcno: string | null;
  contractoraddress: string | null;
  systemdate: Date | null;
};

type ImportedContractorResponse = {
  filename: string;
  sheetCount: number;
  contractorTable?: ImportedContractor[];
};

export type ContractorBulkImportResult = {
  inserted: any[];
  errors: { index: number; reason: string; item: ImportedContractor }[];
};

export const uploadContractorFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ImportedContractorResponse>(
      "/import/upload?type=contractor",
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
      error.response?.data?.message || "Failed to upload contractor file",
    );
  }
};

export const bulkImportContractors = async (
  contractors: ImportedContractor[],
) => {
  try {
    const response = await apiClient.post("/import/contractors/bulk", {
      contractors,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to import contractors",
    );
  }
};

export const toggleExecutiveEngineer = async (
  id: string,
  is_executive_engineer?: boolean,
) => {
  try {
    const response = await apiClient.patch(
      `/users/${id}/toggle-executive-engineer`,
      { is_executive_engineer },
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to toggle Executive Engineer status",
    );
  }
};

export const getTPIs = async (districtId?: string) => {
  try {
    const response = await apiClient.get(`/users/tpi`, {
      params: districtId ? { district_id: districtId } : undefined,
    });
    return response.data || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch TPI officers",
    );
  }
};

export const createTPI = async (data: any) => {
  try {
    const response = await apiClient.post(`/users/tpi`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create TPI officer",
    );
  }
};

export const updateTPI = async (id: string, data: any) => {
  try {
    const response = await apiClient.patch(`/users/tpi/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update TPI officer",
    );
  }
};

