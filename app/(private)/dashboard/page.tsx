import DODashboard from "@/components/DODashboard";
import HODashboard from "@/components/HODashboard";
import TPIDashboard from "@/components/TPIDashboard";
import { createServerApiClient } from "@/lib/server-api-client";
import { getDashboardStats } from "@/services/dashboardService";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const [stats, apiClient] = await Promise.all([
    getDashboardStats(),
    createServerApiClient(),
  ]);

  let user = null;
  try {
    const userRes = await apiClient.get("/users/my-profile");
    user = userRes.data;
  } catch (e) {
    // Ignore
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-gray-500 font-medium">
            Unable to load dashboard data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // TPI users will have 'totalAssignedWorkOrders' or role TPI
  if ("totalAssignedWorkOrders" in stats || user?.role === "TPI") {
    return <TPIDashboard stats={stats} user={user} />;
  }

  // HO users will have 'users' property
  if ("users" in stats) {
    return <HODashboard stats={stats} />;
  }

  // DO users will have 'districtName' property
  if ("districtName" in stats) {
    return <DODashboard stats={stats} />;
  }

  // CO (Contractor) users will have 'totalWorkItems' property - redirect to work-order page
  if ("totalWorkItems" in stats) {
    redirect("/work-order");
  }

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <p className="text-gray-500 font-medium">
          Unknown user role. Unable to display dashboard.
        </p>
      </div>
    </div>
  );
}
