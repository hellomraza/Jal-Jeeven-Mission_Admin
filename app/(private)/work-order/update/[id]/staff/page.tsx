import AssignedTpiStaffTable from "@/components/AssignedTpiStaffTable";
import AssignTpiStaffCombobox from "@/components/AssignTpiStaffCombobox";
import BackButton from "@/components/BackButton";
import CreateTpiStaffButton from "@/components/CreateTpiStaffButton";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TpiStaffWorkOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;

  if (role !== UserRole.TPI && role !== "TPI") {
    redirect(`/work-order/update/${id}`);
  }

  const apiClient = await createServerApiClient();

  let allStaff: any[] = [];
  let assignedStaff: any[] = [];

  try {
    const [allStaffRes, assignedStaffRes] = await Promise.all([
      apiClient.get("/users/tpi-staff?page=1&limit=500"),
      apiClient.get(`/work-items/${id}/tpi-staff`),
    ]);

    allStaff = allStaffRes.data?.data || allStaffRes.data || [];
    assignedStaff = assignedStaffRes.data || [];
  } catch (error) {
    console.error("Error fetching TPI staff data:", error);
  }

  const availableStaff = allStaff.filter(
    (staff: any) =>
      !assignedStaff.some((assigned: any) => assigned.id === staff.id),
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[24px] font-bold text-[#1a2b3c]">
              Manage TPI Staff
            </h1>
            <p className="text-[12px] text-gray-500 font-medium mt-0.5">
              Assign inspection personnel to capture baseline photos for this work order
            </p>
          </div>
        </div>
        <CreateTpiStaffButton />
      </div>

      {/* Assign TPI Staff Combobox */}
      <AssignTpiStaffCombobox
        workItemId={id}
        availableStaff={availableStaff}
      />

      {/* Assigned Staff Table with Unassign Actions */}
      <AssignedTpiStaffTable
        workItemId={id}
        assignedStaff={assignedStaff}
      />
    </div>
  );
}
