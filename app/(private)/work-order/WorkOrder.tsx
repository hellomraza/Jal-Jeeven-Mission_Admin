"use client";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRole } from "@/types/usertypes";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function WorkOrder({
  workItems,
  role: userRole,
}: {
  workItems: WorkItem[];
  role: string | null;
}) {
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = React.useState<string | null>(
    null,
  );

  const resetFilters = () => {
    setSelectedDistrict(null);
  };
  const filteredWorkItems = selectedDistrict
    ? workItems?.filter(
        (item) => item.district_id.toString() === selectedDistrict,
      )
    : workItems;

  let availableDistricts: {
    value: number;
    label: string;
  }[] = [];

  if (userRole === UserRole.HeadOfficer) {
    const districtsSet = new Set<string>();
    workItems?.forEach((item) => {
      if (item.district) {
        districtsSet.add(
          JSON.stringify({
            value: item.district_id,
            label: item.district.districtname,
          }),
        );
      }
    });
    availableDistricts = Array.from(districtsSet).map((str) => JSON.parse(str));
  }

  const handleExport = () => {
    if (!filteredWorkItems) return;
    const ws = XLSX.utils.json_to_sheet(filteredWorkItems);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Work_Orders");
    XLSX.writeFile(wb, "WorkOrders.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <h2 className="text-[16px] font-bold text-[#1a2b3c] whitespace-nowrap px-2">
            Work Code Details
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {userRole === UserRole.HeadOfficer && (
            <>
              <Select
                key={selectedDistrict}
                value={selectedDistrict || undefined}
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger className="w-40 bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
                  <SelectValue placeholder="District Name" />
                </SelectTrigger>
                <SelectContent>
                  {availableDistricts.length > 0 ? (
                    availableDistricts.map((district) => (
                      <SelectItem
                        key={district.value}
                        value={district.value.toString()}
                      >
                        {district.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="all">No Districts Available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button onClick={resetFilters}>Reset Filters</Button>
            </>
          )}
          {userRole === UserRole.HeadOfficer && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push("/work-order/upload")}
                className="bg-[#DFEEF9] hover:bg-[#D0E5F5] text-[#1a2b3c] h-9 px-4 rounded-lg text-[12px] font-medium shadow-sm"
              >
                <Upload size={14} className="mr-1" />
                Upload Workitems
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] py-0 overflow-hidden bg-white rounded-2xl">
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
                    Contractor Name
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Contractor Code
                  </TableHead>
                  {/* <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Latitude
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Longitude
                  </TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkItems?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={17} className="h-24 text-center">
                      <p className="text-[12px] text-gray-500 font-medium">
                        No work items found.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWorkItems?.map((row, index: number) => (
                    <TableRow
                      key={row.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                      onClick={() =>
                        router.push(`/work-order/details/${row.id}`)
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
                        {row.block?.blockname || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.panchayat?.panchayatname || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.village?.villagename || "---"}
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
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium min-w-37.5 max-w-sm truncate">
                        {row.description || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.contractor?.name || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.contractor?.code || "---"}
                      </TableCell>
                      {/* <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.latitude || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.longitude || "---"}
                      </TableCell> */}
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
  );
}
