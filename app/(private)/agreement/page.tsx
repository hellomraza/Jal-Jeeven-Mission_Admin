"use client";
import * as XLSX from "xlsx";

import React from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { getAgreements } from "@/services/agreementService";

export default function AgreementPage() {
  const [agreements, setAgreements] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const role = localStorage.getItem("user_role");
    setUserRole(role);
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const data = await getAgreements();
      setAgreements(data.data || []);
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
      "Work Order Date": row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A",
      "Division": row.work?.district_id || "N/A",
      "Agreement No.": row.agreementno || "N/A",
      "Agreement Year": row.agreementyear || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agreements");
    XLSX.writeFile(wb, "Agreements.xlsx");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <h2 className="text-[16px] font-bold text-[#1a2b3c] whitespace-nowrap px-2">
            Agreement Details {userRole === "CO" ? "(My Agreements)" : ""}
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {userRole !== "CO" && (
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

                <Select defaultValue="all">
                  <SelectTrigger className="w-[160px] bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
                    <SelectValue placeholder="Contractor Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Contractor Code</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[160px] bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
                    <SelectValue placeholder="Division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Division</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            <Button className="bg-[#136FB6] hover:bg-[#105E9A] text-white h-9 px-8 rounded-lg text-[12px] font-medium shadow-md shadow-[#136FB6]/20">
              Back
            </Button>
          </div>

        </div>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden bg-white rounded-[16px]">
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
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-10 text-gray-500">
                        Loading agreements...
                      </TableCell>
                    </TableRow>
                  ) : agreements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-10 text-gray-500">
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
                          {row.contractor?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.contractor?.code || "N/A"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.agreementno}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium max-w-[120px]">
                          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A"}
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
                        <TableCell className="text-center py-4">
                          <Button className="h-7 px-4 bg-[#DFEEF9] hover:bg-[#136FB6] text-[#136FB6] hover:text-white transition-colors text-[11px] font-bold rounded-md">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

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
    </DashboardLayout>
  );
}
