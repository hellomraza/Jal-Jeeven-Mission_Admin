import TpiStaffManagementTable from "@/components/TpiStaffManagementTable";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TpiStaffPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;

  if (role !== UserRole.TPI && role !== "TPI") {
    redirect("/dashboard");
  }

  const apiClient = await createServerApiClient();

  let staffList = [];
  try {
    const res = await apiClient.get("/users/tpi-staff?page=1&limit=500");
    staffList = res.data?.data || res.data || [];
  } catch (error) {
    console.error("Error fetching TPI staff:", error);
  }

  return (
    <div className="space-y-6">
      <TpiStaffManagementTable staffList={staffList} />
    </div>
  );
}
