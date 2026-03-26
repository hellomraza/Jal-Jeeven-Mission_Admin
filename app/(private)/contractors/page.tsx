import ContractorManagementTable from "@/components/ContractorManagementTable";
import CreateContractorButton from "@/components/CreateContractorButton";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

export default async function ContractorsPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;
  let contractors: Contractor[] = [];
  let error = null;

  if (role !== UserRole.DistrictOfficer && role !== UserRole.HeadOfficer) {
    forbidden();
  }

  try {
    const apiClient = await createServerApiClient();
    contractors = (await apiClient.get<Contractor[]>(`/users/contractors`))
      ?.data;
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
            {role === UserRole.DistrictOfficer && (
              <p className="text-[14px] text-gray-500 font-medium mt-2">
                Create and manage contractors for your projects
              </p>
            )}
          </div>

          {role === UserRole.DistrictOfficer && <CreateContractorButton />}
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <ContractorManagementTable contractors={contractors} />
        )}
      </div>
    </div>
  );
}
