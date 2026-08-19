import TPIManagementTable from "@/components/TPIManagementTable";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TpiPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;

  if (role !== UserRole.HeadOfficer && role !== "HO") {
    redirect("/dashboard");
  }

  const apiClient = await createServerApiClient();

  let tpis = [];
  let districts = [];

  try {
    const [tpisResponse, districtsResponse] = await Promise.all([
      apiClient.get("/users/tpis?page=1&limit=1000"),
      apiClient.get("/locations/districts"),
    ]);

    tpis = tpisResponse.data?.data || tpisResponse.data || [];
    districts = districtsResponse.data?.data || districtsResponse.data || [];
  } catch (error) {
    console.error("Error fetching TPI data:", error);
  }

  return (
    <div className="space-y-6">
      <TPIManagementTable tpis={tpis} districts={districts} />
    </div>
  );
}
