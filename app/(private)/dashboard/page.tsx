import DODashboard from "@/components/DODashboard";
import HODashboard from "@/components/HODashboard";
import { getDashboardStats } from "@/services/dashboardService";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

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
