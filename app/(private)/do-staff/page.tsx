import DOStaffManagementCard from "@/components/DOStaffManagementCard";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

export default async function DOStaffPage() {
  let staff = null;
  let error = null;
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;

  if (role !== UserRole.DistrictOfficer && role !== "DO") {
    forbidden();
  }

  try {
    const apiClient = await createServerApiClient();
    staff = (await apiClient.get(`/users/do-staff`))?.data;
  } catch (err: any) {
    // 404 or empty is expected if no staff created yet
    if (err?.response?.status !== 404) {
      error = err.message;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <DOStaffManagementCard staff={staff} />
        )}
      </div>
    </div>
  );
}
