import AssignEmployeeCombobox from "@/components/AssignEmployeeCombobox";
import BackButton from "@/components/BackButton";
import CreateEmployeeButton from "@/components/CreateEmployeeButton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createServerApiClient } from "@/lib/server-api-client";
import { UserRole } from "@/types/usertypes";
import { AxiosResponse } from "axios";
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
  let allEmployeesResponse: AxiosResponse<PaginatedResponse<Employee>> | null =
    null;

  if (role === UserRole.Contractor) {
    allEmployeesResponse = await apiClient.get<PaginatedResponse<Employee>>(
      "/users/my-created-users",
    );
  }
  const response = await apiClient.get(`/users/work-item/${id}/employees`);

  const assignedEmployees = response.data || [];
  const allEmployees = allEmployeesResponse?.data?.data || [];
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#1a2b3c]">
              Assigned Employees
            </h2>
            <p className="text-[12px] text-gray-500 font-medium">
              Manage employees assigned to this work item
            </p>
          </div>
        </div>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] py-0 overflow-hidden bg-white rounded-2xl">
          <CardContent className="p-0">
            {assignedEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-[14px] text-gray-500 font-medium">
                  No employees assigned yet
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  Use "Add Employee" to assign employees to this work item
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      S No.
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Name
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Email
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Code
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      District
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Mobile
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedEmployees.map(
                    (employee: Employee, index: number) => (
                      <TableRow
                        key={employee.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50"
                      >
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                          {employee.name || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {employee.email || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {employee.code || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {employee.district_name || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {employee.mobile || "---"}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
