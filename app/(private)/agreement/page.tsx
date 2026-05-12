"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";

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
import { getAgreements } from "@/services/agreementService";
import { UserRole } from "@/types/usertypes";
import { FileUp, Upload } from "lucide-react";
import React from "react";

export default function AgreementPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [agreements, setAgreements] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalAgreements, setTotalAgreements] = React.useState(0);

  const currentPage = React.useMemo(() => {
    const pageValue = Number(searchParams.get("page") || "1");
    return Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  }, [searchParams]);

  React.useEffect(() => {
    const role = localStorage.getItem("admin_role");
    setUserRole(role);
  }, []);

  React.useEffect(() => {
    fetchAgreements(currentPage);
  }, [currentPage]);

  const updatePageParam = (page: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(page));
    }

    const nextUrl = nextParams.toString()
      ? `${pathname}?${nextParams.toString()}`
      : pathname;

    router.replace(nextUrl, { scroll: false });
  };

  const fetchAgreements = async (page: number) => {
    try {
      setLoading(true);
      const data = await getAgreements(page, 10);
      setAgreements(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalAgreements(data.total || 0);

      if (data.page && data.page !== currentPage) {
        updatePageParam(data.page);
      }
    } catch (error) {
      console.error("Error fetching agreements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = agreements.map((row, index) => ({
      "S No.": index + 1,
      "Work Code": row.work?.work_code || "N/A",
      "Name Of Contractor": row.contractor?.name || "N/A",
      "Contractor Code": row.contractor?.code || "N/A",
      "Work Order No.": row.agreementno || "N/A",
      "Work Order Date": row.created_at
        ? new Date(row.created_at).toLocaleDateString()
        : "N/A",
      Division: row.work?.district_id || "N/A",
      "Agreement No.": row.agreementno || "N/A",
      "Agreement Year": row.agreementyear || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agreements");
    XLSX.writeFile(wb, "Agreements.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <h2 className="text-[16px] font-bold text-[#1a2b3c] whitespace-nowrap px-2">
          Agreement Details {userRole === "CO" ? "(My Agreements)" : ""}
        </h2>

        {/* {userRole !== "CO" && (
          <div className="flex flex-wrap items-center gap-3">
            <>
              <Select defaultValue="2022-2023">
                <SelectTrigger className="w-[140px] bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2022-2023">2022-2023</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-[160px] bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
                  <SelectValue placeholder="Contractor Name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Contractor Name</SelectItem>
                </SelectContent>
              </Select>
            </>
          </div>
        )} */}
        {userRole === UserRole.HeadOfficer && (
          <Button
            type="button"
            onClick={() => router.push("/agreement/upload")}
            className="bg-[#DFEEF9] hover:bg-[#D0E5F5] text-[#1a2b3c] font-bold text-[12px] h-10 px-6 rounded-lg flex items-center gap-2 shadow-sm"
          >
            <FileUp size={14} className="stroke-[2.5]" />
            Upload Agreement
          </Button>
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
                    Agreement No.
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Agreement Year
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-10 text-gray-500"
                    >
                      Loading agreements...
                    </TableCell>
                  </TableRow>
                ) : agreements.length === 0 ? (
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
                        {row.work?.work_code || "N/A"}
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
                        {row.work?.district_id || "N/A"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.agreementno}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.agreementyear}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.02)] md:flex-row md:items-center md:justify-between">
        <p className="text-[12px] font-medium text-gray-600">
          Showing page {currentPage} of {totalPages} · {totalAgreements} total
          agreement{totalAgreements === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 px-4 text-[12px]"
            onClick={() => updatePageParam(Math.max(currentPage - 1, 1))}
            disabled={loading || currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 px-4 text-[12px]"
            onClick={() =>
              updatePageParam(Math.min(currentPage + 1, totalPages))
            }
            disabled={loading || currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleExport}
          disabled={agreements.length === 0}
          className="bg-[#DFEEF9] hover:bg-[#D0E5F5] text-[#1a2b3c] font-bold text-[12px] h-10 px-6 rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Upload size={14} className="stroke-[2.5]" />
          Export
        </Button>
      </div>
    </div>
  );
}
