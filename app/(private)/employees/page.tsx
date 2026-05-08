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

            <div className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              {employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-[14px] text-gray-500 font-medium">
                    No employees created yet
                  </p>
                  <p className="text-[12px] text-gray-400 mt-1">
                    Click "Create Employee" to add a new employee
                  </p>
                </div>
              ) : (
                <Card className="border-none shadow-none bg-transparent rounded-none py-0">
                  <CardContent className="p-0">
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
                        {employees.map((employee, index) => (
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
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
