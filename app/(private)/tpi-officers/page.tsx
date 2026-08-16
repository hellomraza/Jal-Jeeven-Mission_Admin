import CreateTPIButton from "@/components/CreateTPIButton";
import TPIManagementTable from "@/components/TPIManagementTable";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

export default async function TpiOfficersPage() {
  let tpis = [];
  let error = null;
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;

  if (role !== UserRole.HeadOfficer && role !== UserRole.DistrictOfficer) {
    forbidden();
  }

  try {
    const apiClient = await createServerApiClient();
    tpis = (await apiClient.get(`/users/tpi`))?.data || [];
  } catch (err: any) {
    error = err.message;
  }

  const isHO = role === UserRole.HeadOfficer;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#1a2b3c]">
              TPI Officers Management
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-2">
              Third Party Inspection officers assigned across districts
            </p>
          </div>

          {isHO && <CreateTPIButton />}
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <TPIManagementTable tpis={tpis} />
        )}
      </div>
    </div>
  );
}
