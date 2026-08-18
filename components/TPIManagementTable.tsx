"use client";

import { toggleTpiStatus } from "@/actions/userAction";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import apiClient from "@/lib/api-client";
import {
  CheckCircle2,
  Edit,
  Loader2,
  Power,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import React, { useState, useTransition } from "react";
import CreateTPIButton from "./CreateTPIButton";
import EditTPIDialog from "./EditTPIDialog";

interface TPIManagementTableProps {
  tpis: any[];
  districts?: any[];
}

export default function TPIManagementTable({
  tpis,
  districts = [],
}: TPIManagementTableProps) {
  const { toast } = useToast();
  const [selectedTpi, setSelectedTpi] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  // View Staff Dialog State
  const [viewingStaffTpi, setViewingStaffTpi] = useState<any | null>(null);
  const [tpiStaffList, setTpiStaffList] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const handleOpenStaffModal = async (tpi: any) => {
    setViewingStaffTpi(tpi);
    setLoadingStaff(true);
    try {
      const res = await apiClient.get(`/users/tpi/${tpi.id}/staff`);
      setTpiStaffList(res.data?.data || res.data || []);
    } catch (err) {
      setTpiStaffList([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    setActionId(id);
    startTransition(async () => {
      try {
        const res = await toggleTpiStatus(id, !currentStatus);
        if (res.error) {
          toast({
            variant: "destructive",
            title: "Action Failed",
            description: res.error,
          });
        } else {
          toast({
            title: "Success",
            description: res.success,
          });
        }
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Failed to update status",
        });
      } finally {
        setActionId(null);
      }
    });
  };

  const filteredTpis = tpis.filter((tpi) => {
    const matchesSearch =
      !search ||
      tpi.name?.toLowerCase().includes(search.toLowerCase()) ||
      tpi.code?.toLowerCase().includes(search.toLowerCase()) ||
      tpi.email?.toLowerCase().includes(search.toLowerCase()) ||
      tpi.pan_number?.toLowerCase().includes(search.toLowerCase()) ||
      tpi.mobile?.includes(search);

    const matchesDistrict =
      selectedDistrict === "all" ||
      tpi.district_id?.toString() === selectedDistrict ||
      tpi.district?.district_code?.toString() === selectedDistrict;

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && tpi.is_active) ||
      (selectedStatus === "inactive" && !tpi.is_active);

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              Third-Party Inspector (TPI) Agencies
            </h2>
            <p className="text-[12px] text-gray-500 font-medium mt-0.5">
              Manage Third-Party Inspection agencies for Bulk Village quality monitoring
            </p>
          </div>
          <CreateTPIButton />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="relative flex-1 min-w-[240px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              placeholder="Search by name, code, email, mobile, PAN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-[12px] bg-[#F9FAFB] border-gray-100 rounded-lg"
            />
          </div>

          <Select
            value={selectedDistrict}
            onValueChange={setSelectedDistrict}
          >
            <SelectTrigger className="w-[180px] h-9 text-[12px] bg-[#F9FAFB] border-gray-100">
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map((d: any) => (
                <SelectItem
                  key={d.district_code || d.id}
                  value={String(d.district_code || d.id)}
                >
                  {d.districtname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className="w-[150px] h-9 text-[12px] bg-[#F9FAFB] border-gray-100">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {(search || selectedDistrict !== "all" || selectedStatus !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedDistrict("all");
                setSelectedStatus("all");
              }}
              className="h-9 text-[12px] text-gray-500 hover:text-gray-900"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Table */}
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {filteredTpis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-[14px] font-bold text-gray-700">
                  No TPI agencies found
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  Try adjusting your search filters or click "Create TPI Agency"
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                        S No.
                      </TableHead>
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                        Agency Name
                      </TableHead>
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                        User Code
                      </TableHead>
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                        District
                      </TableHead>
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                        Contact (Email / Mobile)
                      </TableHead>
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                        PAN Number
                      </TableHead>
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c] text-center">
                        Status
                      </TableHead>
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c] text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTpis.map((tpi, idx) => (
                      <TableRow
                        key={tpi.id}
                        className="border-gray-50 hover:bg-gray-50/50"
                      >
                        <TableCell className="text-[12px] text-gray-900 font-medium">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="text-[13px] font-bold text-[#1a2b3c]">
                          {tpi.name}
                        </TableCell>
                        <TableCell className="text-[12px] font-mono font-semibold text-gray-700">
                          {tpi.code || "---"}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-700">
                          {tpi.district?.districtname || "N/A"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-600">
                          <div>{tpi.email}</div>
                          {tpi.mobile && (
                            <div className="text-gray-400">{tpi.mobile}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-600 font-mono">
                          {tpi.pan_number || "---"}
                        </TableCell>
                        <TableCell className="text-center">
                          {tpi.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-green-50 text-green-700 border border-green-200">
                              <CheckCircle2 size={12} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200">
                              <XCircle size={12} /> Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-[11px] font-bold text-gray-700 hover:bg-gray-100"
                              onClick={() => handleOpenStaffModal(tpi)}
                            >
                              <Users size={13} className="mr-1" /> Staff
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-[11px] font-bold text-[#136FB6] border-[#136FB6]/20 hover:bg-[#DFEEF9]"
                              onClick={() => {
                                setSelectedTpi(tpi);
                                setIsEditOpen(true);
                              }}
                            >
                              <Edit size={13} className="mr-1" /> Edit
                            </Button>
                            <Button
                              variant={tpi.is_active ? "destructive" : "default"}
                              size="sm"
                              className={`h-8 px-2.5 text-[11px] font-bold ${
                                tpi.is_active
                                  ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                                  : "bg-green-600 hover:bg-green-700 text-white"
                              }`}
                              disabled={isPending && actionId === tpi.id}
                              onClick={() =>
                                handleToggleStatus(tpi.id, tpi.is_active)
                              }
                            >
                              {isPending && actionId === tpi.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <>
                                  <Power size={13} className="mr-1" />
                                  {tpi.is_active ? "Deactivate" : "Activate"}
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditTPIDialog
        tpi={selectedTpi}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* HO Staff View Dialog - Identity info only, NO reference photos */}
      <Dialog
        open={Boolean(viewingStaffTpi)}
        onOpenChange={(open) => !open && setViewingStaffTpi(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {viewingStaffTpi?.name} - Registered Field Staff
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            {loadingStaff ? (
              <div className="py-8 text-center">
                <Loader2 size={24} className="animate-spin mx-auto text-[#136FB6]" />
                <p className="text-xs text-gray-500 mt-2">Loading staff list...</p>
              </div>
            ) : tpiStaffList.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs">
                No field staff members registered by this agency yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {tpiStaffList.map((staff, idx) => (
                  <div
                    key={staff.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1a2b3c]">
                        {staff.name}
                      </p>
                      <p className="text-[11px] text-gray-500">{staff.email}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {staff.created_at
                        ? new Date(staff.created_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

