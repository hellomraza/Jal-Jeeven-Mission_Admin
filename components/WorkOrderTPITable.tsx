"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { getLocationsByType } from "@/services/locationService";
import { UserRole } from "@/types/usertypes";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye, Plus, ShieldCheck, Upload, UserCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import AssignTPIDialog from "./AssignTPIDialog";

interface WorkOrderTPITableProps {
  workOrders: any[];
  userRole?: string;
  isExecutiveEngineer?: boolean;
  onRefresh?: () => void;
}

export default function WorkOrderTPITable({
  workOrders,
  userRole,
  isExecutiveEngineer,
  onRefresh,
}: WorkOrderTPITableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedWO, setSelectedWO] = useState<any | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const canAssignTpi =
    userRole === UserRole.DistrictOfficer && isExecutiveEngineer;
  const isHO = userRole === UserRole.HeadOfficer;

  const { data: districtsData } = useQuery({
    queryKey: ["locations", "districts"],
    queryFn: () => getLocationsByType("districts"),
  });

  // Extract districts from API + work orders
  const availableDistricts = useMemo(() => {
    const map = new Map<string, string>();
    const officialDistricts = districtsData?.data || [];
    officialDistricts.forEach((d: any) => {
      const id = String(d.districtid ?? d.id ?? d.district_id);
      const name = d.districtname || d.name || id;
      if (id && name) map.set(id, name);
    });

    workOrders.forEach((wo) => {
      const distId = String(wo.district_id || wo.district?.id || wo.district?.districtid || "");
      const distName = wo.district?.districtname || distId;
      if (distId && distName && !map.has(distId)) {
        map.set(distId, String(distName));
      }
    });

    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [districtsData, workOrders]);

  // Filter work orders based on search and selected district
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      const matchSearch =
        !search ||
        wo.work_code?.toLowerCase().includes(search.toLowerCase()) ||
        wo.title?.toLowerCase().includes(search.toLowerCase()) ||
        wo.district?.districtname?.toLowerCase().includes(search.toLowerCase());

      const distId = String(wo.district_id || wo.district?.id || wo.district?.districtid || "");
      const distName = String(wo.district?.districtname || "").toLowerCase();

      const matchDistrict =
        !selectedDistrict ||
        distId === selectedDistrict ||
        distName === selectedDistrict.toLowerCase();

      return matchSearch && matchDistrict;
    });
  }, [workOrders, search, selectedDistrict]);

  const handleExport = () => {
    if (!filteredWorkOrders.length) return;
    const exportData = filteredWorkOrders.map((wo, index) => ({
      "S No.": index + 1,
      "Work Code": wo.work_code || "N/A",
      "Title": wo.title || "N/A",
      "Scheme Type": wo.schemetype || "TPI",
      "District": wo.district?.districtname || wo.district_id || "N/A",
      "Block": wo.block?.blockname || "N/A",
      "Panchayat": wo.panchayat?.panchayatname || "N/A",
      "Assigned TPI": wo.tpiAssignment?.tpi?.name || wo.assignedTpi?.name || "Unassigned",
      "Progress (%)": wo.progress_percentage ?? 0,
      "Status": wo.status || "PENDING",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TPI_Work_Orders");
    XLSX.writeFile(wb, "TPI_Work_Orders.xlsx");
  };

  const resetFilters = () => {
    setSelectedDistrict(null);
    setSearch("");
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-bold text-[#1a2b3c] whitespace-nowrap px-2">
              Work Code Details
            </h2>
            <Input
              type="text"
              placeholder="Search Work Code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[220px] h-9 text-[12px] bg-[#F9FAFB] border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-[#136FB6]/30 focus:border-[#136FB6]/30 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isHO && (
              <>
                <Select
                  key={selectedDistrict || "all"}
                  value={selectedDistrict || undefined}
                  onValueChange={setSelectedDistrict}
                >
                  <SelectTrigger className="w-40 bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
                    <SelectValue placeholder="District Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.length > 0 ? (
                      availableDistricts.map((district) => (
                        <SelectItem key={district.value} value={district.value}>
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

            {isHO && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push("/work-order/create")}
                  type="button"
                  className="w-full sm:w-auto bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white font-bold text-[12px] h-10 px-6 rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  Create Work Code
                </Button>
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
                      Contractor Name
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Contractor Code
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 bg-[#DFEEF9] opacity-90">
                      Assigned TPI
                    </TableHead>
                    {(userRole === UserRole.HeadOfficer ||
                      userRole === UserRole.DistrictOfficer ||
                      userRole === UserRole.Contractor) && (
                      <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center bg-[#DFEEF9] opacity-80">
                        Action
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={18} className="h-24 text-center">
                        <p className="text-[12px] text-gray-500 font-medium">
                          No work items found.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWorkOrders.map((row, index: number) => {
                      const tpiName =
                        row.tpiAssignment?.tpi?.name ||
                        row.assignedTpi?.name ||
                        null;

                      return (
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
                            {row.work_code || "---"}
                          </TableCell>
                          <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                            {row.district?.districtname ||
                              row.district_id ||
                              "---"}
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
                          <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                            {row.contractor?.name
                              ? row.contractor.name
                                  ?.toLowerCase()
                                  ?.includes("temporary")
                                ? "---"
                                : row.contractor.name
                              : "---"}
                          </TableCell>
                          <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                            {row.contractor?.code || "---"}
                          </TableCell>
                          <TableCell className="text-[12px] py-4">
                            {tpiName ? (
                              <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                                <UserCheck size={11} />
                                {tpiName}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                          {(userRole === UserRole.HeadOfficer ||
                            userRole === UserRole.DistrictOfficer ||
                            userRole === UserRole.Contractor) && (
                            <TableCell
                              className="text-center py-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-center gap-2">
                                {canAssignTpi && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedWO(row);
                                      setIsAssignOpen(true);
                                    }}
                                    className="h-7 px-3 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold"
                                  >
                                    Assign TPI
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-3 bg-white text-[#136FB6] border-[#136FB6]/20 hover:bg-[#DFEEF9] text-[11px] font-bold"
                                  onClick={() =>
                                    router.push(`/work-order/details/${row.id}`)
                                  }
                                >
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.02)] md:flex-row md:items-center md:justify-between">
          <p className="text-[12px] font-medium text-gray-600">
            Showing {filteredWorkOrders.length} work order{filteredWorkOrders.length === 1 ? "" : "s"}
          </p>
        </div>

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

      <AssignTPIDialog
        workOrder={selectedWO}
        isOpen={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        onAssigned={() => {
          if (onRefresh) onRefresh();
          router.refresh();
        }}
      />
    </>
  );
}
