import ContractorManagementTable from "@/components/ContractorManagementTable";
import CreateContractorButton from "@/components/CreateContractorButton";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

export interface ContractorsPageProps {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

export default async function ContractorsPage({
  searchParams,
}: ContractorsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const currentPage = Number(resolvedParams.page) || 1;
  const limit = Number(resolvedParams.limit) || 20;
  const search = resolvedParams.search || "";

  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;
  let contractors: Contractor[] = [];
  let totalContractors = 0;
  let totalPages = 1;
  let error = null;

  if (role !== UserRole.DistrictOfficer && role !== UserRole.HeadOfficer) {
    forbidden();
  }

  try {
    const apiClient = await createServerApiClient();
    const res = await apiClient.get<any>("/users/contractors", {
      params: {
        page: currentPage,
        limit,
        search: search || undefined,
      },
    });

    if (Array.isArray(res.data)) {
      contractors = res.data;
      totalContractors = res.data.length;
      totalPages = 1;
    } else if (res.data) {
      contractors = res.data.data || [];
      totalContractors = res.data.total || 0;
      totalPages = res.data.totalPages || 1;
    }
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#1a2b3c]">
              Contractors Management
            </h1>
            {role === UserRole.HeadOfficer && (
              <p className="text-[14px] text-gray-500 font-medium mt-2">
                Create and manage contractors for your projects
              </p>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {/* {role === UserRole.DistrictOfficer && <CreateContractorButton />} */}
            {role === UserRole.HeadOfficer && (
              <div className="ml-4">
                <a href="/contractors/upload">
                  <button className="h-10 px-4 rounded-lg bg-[#DFEEF9] hover:bg-[#D0E5F5] text-[#1a2b3c] font-bold text-[12px]">
                    Upload Contractors
                  </button>
                </a>
              </div>
            )}
          </div>
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#1a2b3c]">
                  Contractors
                </h2>
                <p className="text-[12px] text-gray-500 font-medium">
                  Manage all contractors in the system
                </p>
              </div>
            </div>

            <ContractorManagementTable
              contractors={contractors}
              role={role}
              canEdit={role === UserRole.DistrictOfficer || role === UserRole.HeadOfficer}
              currentPage={currentPage}
              totalPages={totalPages}
              totalContractors={totalContractors}
              limit={limit}
              search={search}
            />
          </div>
        )}
      </div>
    </div>
  );
}
