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
      error.response?.data?.message || "Failed to fetch Divisional Account Officers",
    );
  }
};

export const getTpis = async (
  page = 1,
  limit = 1000,
  search?: string,
  districtId?: string,
  isActive?: boolean,
) => {
  try {
    const response = await apiClient.get(`/users/tpis`, {
      params: {
        page,
        limit,
        search: search || undefined,
        districtId: districtId || undefined,
        isActive: isActive !== undefined ? String(isActive) : undefined,
      },
    });
    return response.data?.data || response.data || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch TPI agencies",
    );
  }
};

export const getTpiStaffList = async (page = 1, limit = 500, search?: string) => {
  try {
    const response = await apiClient.get(`/users/tpi-staff`, {
      params: { page, limit, search },
    });
    return response.data?.data || response.data || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch TPI staff",
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
