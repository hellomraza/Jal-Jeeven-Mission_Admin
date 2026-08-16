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
import { UserRole } from "@/types/usertypes";
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

  // Extract unique districts
  const availableDistricts = useMemo(() => {
    const map = new Map<string, string>();
    workOrders.forEach((wo) => {
      const distId = wo.district_id || wo.district?.id;
      const distName = wo.district?.districtname || distId;
      if (distId && distName) {
        map.set(String(distId), String(distName));
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [workOrders]);

  // Filter work orders based on search and selected district
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      const matchSearch =
        !search ||
        wo.work_code?.toLowerCase().includes(search.toLowerCase()) ||
        wo.title?.toLowerCase().includes(search.toLowerCase()) ||
        wo.district?.districtname?.toLowerCase().includes(search.toLowerCase());

      const distId = String(wo.district_id || wo.district?.id || "");
      const matchDistrict = !selectedDistrict || distId === selectedDistrict;

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
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[16px] font-bold text-[#1a2b3c] whitespace-nowrap px-2">
              TPI Work Order Details
            </h2>
            <Input
              type="text"
              placeholder="Search TPI Work Code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[220px] h-9 text-[12px] bg-[#F9FAFB] border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-[#136FB6]/30 focus:border-[#136FB6]/30 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {availableDistricts.length > 0 && (
              <>
                <Select
                  value={selectedDistrict || undefined}
                  onValueChange={setSelectedDistrict}
                >
                  <SelectTrigger className="w-40 bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
                    <SelectValue placeholder="District Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((district) => (
                      <SelectItem key={district.value} value={district.value}>
                        {district.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(selectedDistrict || search) && (
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="h-9 px-3 text-[12px]"
                  >
                    Reset Filters
                  </Button>
                )}
              </>
            )}

            <Button
              variant="outline"
              onClick={handleExport}
              className="h-9 px-3 text-[12px] flex items-center gap-1.5 border-gray-200"
            >
              <Download size={14} />
              Export
            </Button>

            {isHO && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push("/work-order/create")}
                  type="button"
                  className="bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white font-bold text-[12px] h-9 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  Create Work Code
                </Button>
                <Button
                  onClick={() => router.push("/work-order/upload")}
                  className="bg-[#DFEEF9] hover:bg-[#D0E5F5] text-[#1a2b3c] h-9 px-4 rounded-lg text-[12px] font-medium shadow-sm flex items-center gap-1.5"
                >
                  <Upload size={14} />
                  Upload Workitems
                </Button>
              </div>
            )}
          </div>
        </div>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] py-0 overflow-hidden bg-white rounded-2xl">
          <CardContent className="p-0">
            {filteredWorkOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <ShieldCheck size={40} className="text-gray-300 mb-2" />
                <p className="text-[14px] text-gray-500 font-medium">
                  No TPI Work Orders found
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  Create a TPI work order or upload an Excel file to begin.
                </p>
              </div>
            ) : (
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
                        Title
                      </TableHead>
                      <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                        District
                      </TableHead>
                      <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                        Block / Panchayat
                      </TableHead>
                      <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                        Assigned TPI
                      </TableHead>
                      <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                        Progress
                      </TableHead>
                      <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                        Status
                      </TableHead>
                      <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkOrders.map((wo, index) => {
                      const tpiName =
                        wo.tpiAssignment?.tpi?.name ||
                        wo.assignedTpi?.name ||
                        null;

                      return (
                        <TableRow
                          key={wo.id}
                          className="border-b border-gray-50 hover:bg-gray-50/50"
                        >
                          <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-[12px] font-bold text-[#136FB6] py-4">
                            {wo.work_code}
                          </TableCell>
                          <TableCell className="text-[12px] text-gray-700 py-4 font-medium max-w-[200px] truncate">
                            {wo.title || "---"}
                          </TableCell>
                          <TableCell className="text-[12px] text-gray-700 py-4 font-medium">
                            {wo.district?.districtname ||
                              wo.district_id ||
                              "N/A"}
                          </TableCell>
                          <TableCell className="text-[12px] text-gray-700 py-4 font-medium">
                            {wo.block?.blockname || "N/A"} /{" "}
                            {wo.panchayat?.panchayatname || "N/A"}
                          </TableCell>
                          <TableCell className="text-[12px] py-4">
                            {tpiName ? (
                              <Badge className="bg-purple-100 text-purple-900 text-[11px] font-semibold flex items-center gap-1 w-fit">
                                <UserCheck size={11} />
                                {tpiName}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 italic text-[12px]">
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-[12px] py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-[#136FB6] h-1.5 rounded-full"
                                  style={{
                                    width: `${wo.progress_percentage || 0}%`,
                                  }}
                                />
                              </div>
                              <span className="font-semibold text-gray-700 text-[11px]">
                                {wo.progress_percentage || 0}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[12px] py-4">
                            <Badge
                              className={`text-[11px] font-bold ${
                                wo.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : wo.status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {wo.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[12px] py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Link href={`/work-order/details/${wo.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3 text-[12px] flex items-center gap-1 border-gray-200"
                                >
                                  <Eye size={13} />
                                  View
                                </Button>
                              </Link>

                              {canAssignTpi && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedWO(wo);
                                    setIsAssignOpen(true);
                                  }}
                                  className="h-8 px-3 text-[12px] bg-purple-600 hover:bg-purple-700 text-white font-medium"
                                >
                                  Assign TPI
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AssignTPIDialog
        key={isAssignOpen ? "open" : "close"}
        workOrder={selectedWO}
        isOpen={isAssignOpen}
        onOpenChange={(v) => setIsAssignOpen(v)}
        onAssigned={onRefresh}
      />
    </>
  );
}
