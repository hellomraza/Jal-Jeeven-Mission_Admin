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
import { Upload, Loader2, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getWorkItems } from "@/services/workService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function WorkOrderPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["workItems"],
    queryFn: () => getWorkItems(1, 100),
  });

  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("user_role"));
    }
  }, []);

  const workItems = Array.isArray(data) ? data : data?.data || [];

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(workItems);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Work_Orders");
    XLSX.writeFile(wb, "WorkOrders.xlsx");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <h2 className="text-[16px] font-bold text-[#1a2b3c] whitespace-nowrap px-2">
            Work Code Details
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {role !== "CO" && (
              <>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[160px] bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
                    <SelectValue placeholder="District Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">District Name</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[160px] bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
                    <SelectValue placeholder="Block Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Block Name</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[160px] bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
                    <SelectValue placeholder="Work Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Work Code</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            <Button
              onClick={() => router.back()}
              className="bg-[#136FB6] hover:bg-[#105E9A] text-white h-9 px-8 rounded-lg text-[12px] font-medium shadow-md shadow-[#136FB6]/20"
            >
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
                      Title
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Work Code
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      District Name
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-80">
                      Block Name
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-80">
                      Panchayat Name
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-80">
                      Village Name
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-80">
                      Scheme Type
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-80">
                      No FHTC
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-80">
                      A Amount (In Lakh)
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Progress (%)
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Status
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Description
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Contractor ID
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Latitude
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Longitude
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={17} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#136FB6]" />
                        <p className="mt-2 text-[12px] text-gray-500 font-medium">
                          Loading work items...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={17} className="h-24 text-center">
                        <p className="text-[12px] text-red-500 font-medium">
                          Failed to load work items.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetch()}
                          className="mt-2 h-8 text-[11px]"
                        >
                          <RefreshCw className="mr-2 h-3 w-3" /> Retry
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : workItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={17} className="h-24 text-center">
                        <p className="text-[12px] text-gray-500 font-medium">
                          No work items found.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    workItems.map((row: any, index: number) => (
                      <TableRow
                        key={row.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                        onClick={() =>
                          router.push(`/work-order/update/${row.id}`)
                        }
                      >
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                          {row.title || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                          {row.work_code || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                          {row.district?.districtname || row.district_id || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.block?.blockname || row.block || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.panchayat?.panchayatname || row.panchayat || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.village?.villagename || row.village || "---"}
                        </TableCell>

                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.schemetype || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.nofhtc || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.amount_approved || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-[10px] font-bold">
                            {row.progress_percentage || "0"}%
                          </span>
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              row.status === "COMPLETED"
                                ? "bg-green-50 text-green-700"
                                : row.status === "IN_PROGRESS"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-gray-50 text-gray-600"
                            }`}
                          >
                            {row.status || "PENDING"}
                          </span>
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium min-w-[150px]">
                          {row.description || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.contractor_id || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.latitude || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                          {row.longitude || "---"}
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <Button className="h-7 px-4 bg-[#136FB6] hover:bg-[#105E9A] text-white transition-colors text-[11px] font-bold rounded-md">
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
            className="bg-[#DFEEF9] hover:bg-[#D0E5F5] text-[#1a2b3c] font-bold text-[12px] h-10 px-6 rounded-lg flex items-center gap-2 shadow-sm"
          >
            <Upload size={14} className="stroke-[2.5]" />
            Export
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
