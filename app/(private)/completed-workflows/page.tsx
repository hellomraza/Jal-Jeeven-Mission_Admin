import CompletedWorkflowsTable from "@/components/CompletedWorkflowsTable";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

export interface CompletedWorkflowsPageProps {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

export default async function CompletedWorkflowsPage({
  searchParams,
}: CompletedWorkflowsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const currentPage = Number(resolvedParams.page) || 1;
  const limit = Number(resolvedParams.limit) || 20;
  const search = resolvedParams.search || "";

  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;

  if (role !== UserRole.DistrictOfficer) {
    forbidden();
  }

  let workItems = [];
  let totalWorkItems = 0;
  let totalPages = 1;
  let error = null;

  try {
    const apiClient = await createServerApiClient();
    const res = await apiClient.get<any>("/work-items/completed", {
      params: {
        page: currentPage,
        limit,
        search: search || undefined,
      },
    });

    if (res.data) {
      workItems = res.data.data || [];
      totalWorkItems = res.data.total || 0;
      totalPages = res.data.totalPages || 1;
    }
  } catch (err: any) {
    console.log(err);
    error =
      err.response?.data?.message ||
      err.message ||
      "Failed to load completed workflows";
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#1a2b3c]">
            SD Payment
          </h1>
          <p className="text-[14px] text-gray-500 font-medium mt-2">
            Submit and approve contractor bank details & vouchers for completed projects
          </p>
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <CompletedWorkflowsTable
            initialWorkItems={workItems}
            currentPage={currentPage}
            totalPages={totalPages}
            totalWorkItems={totalWorkItems}
            limit={limit}
            search={search}
          />
        )}
      </div>
    </div>
  );
}
