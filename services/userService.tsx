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

export const getContractors = async (page = 1, limit = 500) => {
  try {
    const response = await apiClient.get<Contractor[]>(`/users/contractors`);
    return response.data || [];
  } catch (error: any) {
    console.log(error.response);
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
