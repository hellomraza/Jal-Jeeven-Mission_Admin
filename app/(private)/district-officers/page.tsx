import CreateDOButton from "@/components/CreateDOButton";
import DOManagementTable from "@/components/DOManagementTable";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

export default async function DistrictOfficersPage() {
  let districtOfficers = [];
  let error = null;
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;

  if (role !== UserRole.HeadOfficer) {
    forbidden();
  }

  try {
    const apiClient = await createServerApiClient();
    districtOfficers = (await apiClient.get(`/users/dos`))?.data;
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#1a2b3c]">
              District Officers Management
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-2">
              Create and manage District Officers for your organization
            </p>
          </div>

          <CreateDOButton />
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <DOManagementTable districtOfficers={districtOfficers} />
        )}
      </div>
    </div>
  );
}
