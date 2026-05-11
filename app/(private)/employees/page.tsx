import CreateEmployeeButton from "@/components/CreateEmployeeButton";
import EmployeeManagementTable from "@/components/EmployeeManagementTable";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";

export default async function EmployeesPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;
  let employees: Employee[] = [];
  let error: string | null = null;

  if (role !== UserRole.Contractor) {
    forbidden();
  }

  try {
    const apiClient = await createServerApiClient();
    const res = await apiClient.get<PaginatedResponse<Employee>>(
      "/users/my-created-users",
    );
    employees = res.data?.data || [];
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#1a2b3c]">
              Employees Management
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-2">
              Create and manage employees for your projects
            </p>
          </div>

          <CreateEmployeeButton />
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#1a2b3c]">
                  Employees
                </h2>
                <p className="text-[12px] text-gray-500 font-medium">
                  Manage all employees created by you
                </p>
              </div>
            </div>

            <EmployeeManagementTable employees={employees} canEdit />
          </div>
        )}
      </div>
    </div>
  );
}
