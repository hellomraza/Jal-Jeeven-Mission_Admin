import { createServerApiClient } from "@/lib/server-api-client";

export interface DashboardStatsDto {
  workItems: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  users: {
    employees: number;
    contractors: number;
    districtOfficers: number;
    headOffice: number;
    total: number;
  };
  totalAgreements: number;
  generatedAt: string;
}

export interface WorkItemWithProgressDto {
  id: string;
  work_code: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  progress_percentage: number;
  description: string;
}

export interface DistrictDashboardDto {
  districtName: string;
  workItems: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  workItemsList: WorkItemWithProgressDto[];
  generatedAt: string;
}

export interface ComponentStatusCountDto {
  pending: number;
  submitted: number;
  inProgress: number;
  approved: number;
  rejected: number;
}

export interface ContractorWorkItemDto {
  id: string;
  work_code: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  componentStats: ComponentStatusCountDto;
  assignedEmployees: number;
}

export interface ContractorDashboardDto {
  totalWorkItems: number;
  workItems: ContractorWorkItemDto[];
  generatedAt: string;
}

export async function getDashboardStats(): Promise<
  DashboardStatsDto | DistrictDashboardDto | ContractorDashboardDto | null
> {
  try {
    const apiClient = await createServerApiClient();
    const response = await apiClient.get("/dashboard/stats");
    return response.data || null;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
}
