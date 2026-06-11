import AgreementFileDialog from "@/components/AgreementFileDialog";
import AgreementFileViewerModal from "@/components/AgreementFileViewer";
import AgreementFilters from "@/components/AgreementFilters";
import { Button } from "@/components/ui/button";
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
import { FileUp } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import ExportAgreement from "./ExportAgreement";
import SecurityDepositDialog from "@/components/SecurityDepositDialog";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    agreementyear?: string;
    page?: string;
  }>;
}

const AgreementPage = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams.search || "";
  const agreementyear = resolvedSearchParams.agreementyear || "";
  const page = resolvedSearchParams.page || "1";

  const cookieStore = await cookies();
  const userRole = cookieStore.get("admin_role")?.value || null;
  
  const queryParams = new URLSearchParams({
    page,
    limit: "10",
  });
  if (search) queryParams.set("search", search);
  if (agreementyear) queryParams.set("agreementyear", agreementyear);

  const apiClient = await createServerApiClient();
  const response = await apiClient.get<PaginatedResponse<AgreementResponse>>(
    `/agreements?${queryParams.toString()}`,
  );

  const agreements = response.data?.data || [];
  const totalAgreements = response.data?.total || 0;
  const currentPage = response.data?.page || 1;
  const totalPages = response.data?.totalPages || 1;

  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (agreementyear) params.set("agreementyear", agreementyear);
    if (pageNumber > 1) {
      params.set("page", pageNumber.toString());
    }
    const qs = params.toString();
    return `/agreement${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <h2 className="text-[16px] font-bold text-[#1a2b3c] whitespace-nowrap px-2">
          Agreement Details {userRole === "CO" ? "(My Agreements)" : ""}
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <AgreementFilters />

          {userRole === UserRole.HeadOfficer && (
            <>
              <Link href="/agreement/create" className="w-full sm:w-auto">
                <Button
                  type="button"
                  className="w-full sm:w-auto bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white font-bold text-[12px] h-10 px-6 rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  Create Agreement
                </Button>
              </Link>
              <Link href="/agreement/upload" className="w-full sm:w-auto">
                <Button
                  type="button"
                  className="w-full sm:w-auto bg-[#DFEEF9] hover:bg-[#D0E5F5] text-[#1a2b3c] font-bold text-[12px] h-10 px-6 rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  <FileUp size={14} className="stroke-[2.5]" />
                  Upload Agreement
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden bg-white rounded-2xl py-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    S No.
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Agreement No.
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Agreement Year
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Work Code
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Name Of Contractor
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Contractor Code
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Work Order No.
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Work Order Date
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Division
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Security Deposit
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Agreement File
                  </TableHead>
                  {(userRole === UserRole.HeadOfficer || userRole === UserRole.DistrictOfficer) && (
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                      Action
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  // loading ? (
                  //   <TableRow>
                  //     <TableCell
                  //       colSpan={10}
                  //       className="text-center py-10 text-gray-500"
                  //     >
                  //       Loading agreements...
                  //     </TableCell>
                  //   </TableRow>
                  // ) :
                  agreements.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={12}
                        className="text-center py-10 text-gray-500"
                      >
                        No agreements found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    agreements.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50"
                      >
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {(currentPage - 1) * 10 + index + 1}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.agreementno}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.agreementyear}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.workItems && row.workItems.length > 0
                            ? row.workItems.map((w) => w.work_code).join(", ")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.contractor?.name
                            ? row.contractor?.name
                                ?.toLowerCase()
                                .includes("temporary")
                              ? "---"
                              : row.contractor?.name
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.contractor?.code || "N/A"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.agreementno}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium max-w-30">
                          {row.created_at
                            ? new Date(row.created_at).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.workItems && row.division_code}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.security_deposit !== undefined && row.security_deposit !== null ? (
                            `₹${row.security_deposit}`
                          ) : userRole === UserRole.HeadOfficer ? (
                            <SecurityDepositDialog
                              agreementId={row.id}
                              agreementNo={row.agreementno}
                              contractorName={
                                row.contractor?.name?.toLowerCase().includes("temporary")
                                  ? "---"
                                  : row.contractor?.name || "N/A"
                              }
                              contractorCode={row.contractor?.code || "N/A"}
                            />
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {(() => {
                            const file = row?.files?.[0];
                            const fileUrl = file?.file_url ?? null;

                            if (userRole === UserRole.HeadOfficer) {
                              if (!fileUrl) {
                                return (
                                  <AgreementFileDialog
                                    agreementId={row.id}
                                    mode="add"
                                  >
                                    <Button size="sm">Add File</Button>
                                  </AgreementFileDialog>
                                );
                              }

                              return (
                                <div className="flex items-center gap-2">
                                  <AgreementFileViewerModal
                                    fileUrl={fileUrl}
                                    fileName={file?.file_name || row.agreementno}
                                  >
                                    <Button size="sm" variant="outline">
                                      View File
                                    </Button>
                                  </AgreementFileViewerModal>
                                  <AgreementFileDialog
                                    agreementId={row.id}
                                    mode="edit"
                                    currentFile={file ? { fileUrl: file.file_url, fileName: file.file_name, mimeType: file.mime_type } : null}
                                  >
                                    <Button size="sm">Edit File</Button>
                                  </AgreementFileDialog>
                                </div>
                              );
                            }

                            if (fileUrl) {
                              return (
                                <AgreementFileViewerModal
                                  fileUrl={fileUrl}
                                  fileName={file?.file_name || row.agreementno}
                                >
                                  <Button size="sm" variant="outline">
                                    View File
                                  </Button>
                                </AgreementFileViewerModal>
                              );
                            }

                            return (
                              <span className="text-sm text-muted-foreground">
                                —
                              </span>
                            );
                          })()}
                        </TableCell>
                        {(userRole === UserRole.HeadOfficer || userRole === UserRole.DistrictOfficer) && (
                          <TableCell className="text-center py-4">
                            <Link href={`/agreement/edit/${row.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 bg-white text-[#136FB6] border-[#136FB6]/20 hover:bg-[#DFEEF9] text-[11px] font-bold"
                              >
                                Edit
                              </Button>
                            </Link>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )
                }
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.02)] md:flex-row md:items-center md:justify-between">
        <p className="text-[12px] font-medium text-gray-600">
          Showing page {currentPage} of {totalPages} · {totalAgreements} total
          agreement{totalAgreements === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          {currentPage <= 1 ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 px-4 text-[12px]"
              disabled
            >
              Previous
            </Button>
          ) : (
            <Link href={getPageUrl(currentPage - 1)}>
              <Button
                type="button"
                variant="outline"
                className="h-9 px-4 text-[12px]"
              >
                Previous
              </Button>
            </Link>
          )}

          {currentPage >= totalPages ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 px-4 text-[12px]"
              disabled
            >
              Next
            </Button>
          ) : (
            <Link href={getPageUrl(currentPage + 1)}>
              <Button
                type="button"
                variant="outline"
                className="h-9 px-4 text-[12px]"
              >
                Next
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <ExportAgreement agreements={agreements} />
      </div>
    </div>
  );
};

export default AgreementPage;
