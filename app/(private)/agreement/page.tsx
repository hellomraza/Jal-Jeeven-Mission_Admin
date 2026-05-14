import AgreementFileDialog from "@/components/AgreementFileDialog";
import AgreementFileViewerModal from "@/components/AgreementFileViewer";
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

const AgreementPage = async () => {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("admin_role")?.value || null;
  const apiClient = await createServerApiClient();
  const response = await apiClient.get<PaginatedResponse<AgreementResponse>>(
    `/agreements?page=${1}&limit=${20}`,
  );

  const agreements = response.data?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <h2 className="text-[16px] font-bold text-[#1a2b3c] whitespace-nowrap px-2">
          Agreement Details {userRole === "CO" ? "(My Agreements)" : ""}
        </h2>

        {userRole === UserRole.HeadOfficer && (
          <Link href="/agreement/upload">
            <Button
              type="button"
              className="bg-[#DFEEF9] hover:bg-[#D0E5F5] text-[#1a2b3c] font-bold text-[12px] h-10 px-6 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <FileUp size={14} className="stroke-[2.5]" />
              Upload Agreement
            </Button>
          </Link>
        )}
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
                    Agreement File
                  </TableHead>
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
                        colSpan={10}
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
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.agreementyear}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.agreementno}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.workItem?.work_code || "N/A"}
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
                          {row.workItem?.district_id || "N/A"}
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
                                    fileName={file?.fileName || row.agreementno}
                                  >
                                    <Button size="sm" variant="outline">
                                      View File
                                    </Button>
                                  </AgreementFileViewerModal>
                                  <AgreementFileDialog
                                    agreementId={row.id}
                                    mode="edit"
                                    currentFile={file}
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
                                  fileName={file?.fileName || row.agreementno}
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
                      </TableRow>
                    ))
                  )
                }
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <ExportAgreement agreements={agreements} />
      </div>
    </div>
  );
};

export default AgreementPage;
