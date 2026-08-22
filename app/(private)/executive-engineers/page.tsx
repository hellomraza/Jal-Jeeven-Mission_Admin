import EEManagementTable from "@/components/EEManagementTable";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

export default async function ExecutiveEngineersPage() {
  let executiveEngineers = [];
  let error = null;
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;

  if (role !== UserRole.HeadOfficer && role !== "HO") {
    forbidden();
  }

  try {
    const apiClient = await createServerApiClient();
    executiveEngineers = (await apiClient.get(`/users/ees`))?.data;
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <EEManagementTable executiveEngineers={executiveEngineers} />
        )}
      </div>
    </div>
  );
}
