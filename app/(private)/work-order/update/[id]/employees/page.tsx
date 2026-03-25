import AssignEmployeeCombobox from "@/components/AssignEmployeeCombobox";
import BackButton from "@/components/BackButton";
import CreateEmployeeButton from "@/components/CreateEmployeeButton";
import EmployeeManagementTable from "@/components/EmployeeManagementTable";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;
  const apiClient = await createServerApiClient();
  const allEmployeesResponse = await apiClient.get("/users/employees");
  const response = await apiClient.get(`/users/work-item/${id}/employees`);

  const assignedEmployees = response.data || [];
  const allEmployees = allEmployeesResponse.data || [];
  const availableEmployees = allEmployees.filter(
    (emp: any) =>
      !assignedEmployees.some((assigned: any) => assigned.id === emp.id),
  );
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[24px] font-bold text-[#1a2b3c]">
            Manage Employees
          </h1>
        </div>
        {role === UserRole.Contractor && <CreateEmployeeButton />}
      </div>

      {/* Assign Employees Combobox */}
      {role === UserRole.Contractor && (
        <AssignEmployeeCombobox
          workItemId={id}
          availableEmployees={availableEmployees}
        />
      )}

      {/* Employee Table */}
      <EmployeeManagementTable assignedEmployees={assignedEmployees} />
    </div>
  );
}
