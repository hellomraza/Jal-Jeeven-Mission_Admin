"use client";
import * as XLSX from "xlsx";

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
import { useToast } from "@/hooks/use-toast";
import {
  assignTpiToWorkItem,
  unassignTpiFromWorkItem,
} from "@/services/workService";
import { UserRole } from "@/types/usertypes";
import {
  Building2,
  Loader2,
  ShieldCheck,
  Upload,
  UserX,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function WorkOrder({
  workItems,
  role: userRole,
  currentPage,
  totalPages,
  totalWorkItems,
  activeMode,
  isExecutiveEngineer,
}: {
  workItems: WorkItem[];
  role: string | null;
  currentPage: number;
  totalPages: number;
  totalWorkItems: number;
  activeMode?: string;
  isExecutiveEngineer?: boolean;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);

  const currentSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(currentSearch);

  const [selectedDistrict, setSelectedDistrict] = React.useState<string | null>(
    null,
  );

  const isDO =
    userRole === UserRole.DistrictOfficer ||
    userRole === "DO" ||
    userRole === "DistrictOfficer";

  const canManageTpi = Boolean(isDO && isExecutiveEngineer);

  // Sync state with URL if URL changes
  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  // Debounced search input
  useEffect(() => {
    if (search === currentSearch) return;

    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // reset to page 1 on search
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(handler);
  }, [search, currentSearch, router, pathname, searchParams]);

  const updatePageParam = (page: number) => {
    const params = new URLSearchParams(window.location.search);

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const nextUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    router.replace(nextUrl, { scroll: false });
  };

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

  const handleAssignTpi = async (e: React.MouseEvent, workItemId: string) => {
    e.stopPropagation();
    try {
      setLoadingRowId(workItemId);
      await assignTpiToWorkItem(workItemId);
      toast({
        title: "TPI Assigned",
        description: "Active district TPI agency has been successfully assigned.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description:
          error.message ||
          "Failed to assign TPI agency. Ensure an active TPI exists for this district.",
      });
    } finally {
      setLoadingRowId(null);
    }
  };

  const handleUnassignTpi = async (e: React.MouseEvent, workItemId: string) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to unassign the TPI agency from this work order?",
      )
    ) {
      return;
    }

    try {
      setLoadingRowId(workItemId);
      await unassignTpiFromWorkItem(workItemId);
      toast({
        title: "TPI Unassigned",
        description: "TPI agency has been unassigned from this work order.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Unassignment Failed",
        description: error.message || "Failed to unassign TPI agency.",
      });
    } finally {
      setLoadingRowId(null);
    }
  };

  return (
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
                  {/* <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Title
                  </TableHead> */}
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
                    TPI Agency
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Contractor Name
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Contractor Code
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
                {filteredWorkItems?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={19} className="h-24 text-center">
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
                        {(currentPage - 1) * 10 + index + 1}
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
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${row.status === "COMPLETED"
                            ? "bg-green-50 text-green-700"
                            : row.status === "IN_PROGRESS"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-50 text-gray-600"
                            }`}
                        >
                          {row.status || "PENDING"}
                        </span>
                      </TableCell>
                      <TableCell
                        className="text-[12px] text-gray-900 py-4 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.work_order_type === "BULK_VILLAGE" ? (
                          row.tpi ? (
                            <div className="flex items-center gap-1.5">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#136FB6] border border-blue-200"
                                title={row.tpi.email || ""}
                              >
                                <ShieldCheck size={11} />
                                {row.tpi.name || row.tpi.code || "TPI"}
                              </span>
                              {canManageTpi && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                                  title="Unassign TPI Agency"
                                  disabled={loadingRowId === row.id}
                                  onClick={(e) => handleUnassignTpi(e, row.id)}
                                >
                                  {loadingRowId === row.id ? (
                                    <Loader2 size={11} className="animate-spin text-red-600" />
                                  ) : (
                                    <UserX size={12} />
                                  )}
                                </Button>
                              )}
                            </div>
                          ) : canManageTpi ? (
                            <Button
                              size="sm"
                              className="h-7 px-2.5 bg-[#136FB6] hover:bg-[#0d5a8f] text-white text-[11px] font-bold shadow-xs flex items-center gap-1"
                              disabled={loadingRowId === row.id}
                              onClick={(e) => handleAssignTpi(e, row.id)}
                            >
                              {loadingRowId === row.id ? (
                                <Loader2 size={11} className="animate-spin mr-0.5" />
                              ) : (
                                <Building2 size={11} className="mr-0.5" />
                              )}
                              Assign TPI
                            </Button>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">
                              Not Assigned
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-gray-300">—</span>
                        )}
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
                      {(userRole === UserRole.HeadOfficer ||
                        userRole === UserRole.DistrictOfficer ||
                        userRole === UserRole.Contractor) && (
                        <TableCell
                          className="text-center py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 bg-white text-[#136FB6] border-[#136FB6]/20 hover:bg-[#DFEEF9] text-[11px] font-bold"
                            onClick={() => router.push(`/work-order/edit/${row.id}`)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      )}
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
          Showing page {currentPage} of {totalPages} · {totalWorkItems} total
          work item{totalWorkItems === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 px-4 text-[12px]"
            onClick={() => updatePageParam(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1}
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
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
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
  );
}
