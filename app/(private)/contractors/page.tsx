import CreateContractorButton from "@/components/CreateContractorButton";
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

export default async function ContractorsPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_role")?.value;
  let contractors: Contractor[] = [];
  let error = null;

  if (role !== UserRole.DistrictOfficer && role !== UserRole.HeadOfficer) {
    forbidden();
  }

  try {
    const apiClient = await createServerApiClient();
    let url = "";
    if (role === UserRole.DistrictOfficer) {
      url = "";
      const res = await apiClient.get<PaginatedResponse<Contractor>>(
        "/users/my-created-users",
      );
      contractors = res.data?.data || [];
    } else if (role === UserRole.HeadOfficer) {
      url = "";
      const res = await apiClient.get<Contractor[]>("/users/contractors");
      contractors = res.data || [];
    }
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#1a2b3c]">
              Contractors Management
            </h1>
            {role === UserRole.DistrictOfficer && (
              <p className="text-[14px] text-gray-500 font-medium mt-2">
                Create and manage contractors for your projects
              </p>
            )}
          </div>

          {role === UserRole.DistrictOfficer && <CreateContractorButton />}
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
                  Contractors
                </h2>
                <p className="text-[12px] text-gray-500 font-medium">
                  Manage all contractors in the system
                </p>
              </div>
            </div>

            <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] py-0 overflow-hidden bg-white rounded-2xl">
              <CardContent className="p-0">
                {contractors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-[14px] text-gray-500 font-medium">
                      No contractors listed yet
                    </p>
                    {role === UserRole.DistrictOfficer && (
                      <p className="text-[12px] text-gray-400 mt-1">
                        Click "Create Contractor" to add a new contractor
                      </p>
                    )}
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
                      {contractors.map((contractor, index) => (
                        <TableRow
                          key={contractor.id}
                          className="border-b border-gray-50 hover:bg-gray-50/50"
                        >
                          <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                            {contractor.name || "---"}
                          </TableCell>
                          <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                            {contractor.email || "---"}
                          </TableCell>
                          <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                            {contractor.code || "---"}
                          </TableCell>
                          <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                            {contractor.district_name || "---"}
                          </TableCell>
                          <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                            {contractor.mobile || "---"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
