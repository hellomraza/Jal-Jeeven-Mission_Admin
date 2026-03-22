"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkItemComponents,
  updateWorkItemComponent,
  getComponentDetails,
} from "@/services/workService";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Eye,
  Edit,
  CheckCircle2,
  Clock,
  XSquare,
  AlertCircle,
  Camera,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WorkOrderUpdatePage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State
  const [editQuantity, setEditQuantity] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const {
    data: components,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["workItemComponents", id],
    queryFn: () => getWorkItemComponents(id as string),
    enabled: !!id,
  });

  const { data: selectedComponentDetails, isLoading: isLoadingDetails } =
    useQuery({
      queryKey: ["componentDetails", selectedComponentId],
      queryFn: () => getComponentDetails(selectedComponentId!),
      enabled: !!selectedComponentId && isDetailModalOpen,
    });

  const updateMutation = useMutation({
    mutationFn: (payload: any) =>
      updateWorkItemComponent(selectedComponentId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workItemComponents", id] });
      toast.success("Component updated successfully");
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update component");
    },
  });

  const handleOpenDetailModal = (id: string) => {
    setSelectedComponentId(id);
    setIsDetailModalOpen(true);
  };

  const handleOpenEditModal = (component: any) => {
    setSelectedComponentId(component.id);
    setEditQuantity(component.quantity?.toString() || "");
    setEditRemarks(component.remarks || "");
    setEditStatus(component.status || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateComponent = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      quantity: parseFloat(editQuantity),
      remarks: editRemarks,
      status: editStatus,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold">
            <CheckCircle2 size={13} /> Approved
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
            <Clock size={13} /> In Progress
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-bold">
            <XSquare size={13} /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[11px] font-bold">
            <AlertCircle size={13} /> Pending
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full h-9 w-9 border-gray-100 shadow-sm"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </Button>
            <div>
              <h1 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
                Work Order Components
              </h1>
              <p className="text-[12px] text-gray-500 font-medium">
                Update and manage components for Work ID: {id}
              </p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden bg-white rounded-[20px]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 rounded-tl-[20px]">
                    S No.
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Component Name
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                    Unit
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                    Quantity
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                    Photos
                  </TableHead>
                  <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-right rounded-tr-[20px] pr-8">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin text-[#136FB6]" />
                        <p className="text-gray-500 text-[13px] font-medium">
                          Loading components details...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError || !components ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <p className="text-red-500 font-medium">
                        Failed to load components.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : components.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-40 text-center text-gray-500"
                    >
                      No components found for this work item.
                    </TableCell>
                  </TableRow>
                ) : (
                  components.map((row: any, index: number) => (
                    <TableRow
                      key={row.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="text-[12px] text-gray-600 py-4.5 font-bold pl-8">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-900 py-4.5 font-bold">
                        {row.component?.name || "N/A"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-500 py-4.5 font-medium">
                        {row.component?.unit || "N/A"}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-900 py-4.5 font-extrabold text-center">
                        {row.quantity || "0"}
                      </TableCell>
                      <TableCell className="py-4.5 text-center">
                        <div className="flex justify-center">
                          {getStatusBadge(row.status)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4.5 text-center">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/work-order/review-photos/${row.id}`)}
                            className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Review Photos"
                          >
                            <Camera size={16} strokeWidth={2.5} />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4.5 pr-8">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDetailModal(row.id)}
                            className="h-8 w-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye size={16} strokeWidth={2.5} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditModal(row)}
                            className="h-8 w-8 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          >
                            <Edit size={16} strokeWidth={2.5} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Component Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[24px]">
            <DialogHeader className="bg-[#136FB6] p-6 text-white pb-10">
              <DialogTitle className="text-[20px] font-extrabold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Eye size={20} />
                </div>
                Component Details
              </DialogTitle>
            </DialogHeader>
            <div className="p-8 -mt-6 bg-white rounded-t-[24px] space-y-6">
              {isLoadingDetails ? (
                <div className="flex flex-col items-center py-12 space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-[#136FB6]" />
                  <p className="text-gray-500 font-medium">
                    Fetching detail data...
                  </p>
                </div>
              ) : selectedComponentDetails ? (
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                      Component Name
                    </p>
                    <p className="text-[14px] font-extrabold text-[#1a2b3c]">
                      {selectedComponentDetails.component?.name || "---"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                      Unit Type
                    </p>
                    <p className="text-[14px] font-extrabold text-[#1a2b3c]">
                      {selectedComponentDetails.component?.unit || "---"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                      Current Quantity
                    </p>
                    <p className="text-[14px] font-extrabold text-[#1a2b3c]">
                      {selectedComponentDetails.quantity || "0"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                      Work Integrity
                    </p>
                    <div className="pt-1">
                      {getStatusBadge(selectedComponentDetails.status)}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1 mt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                      Administration Remarks
                    </p>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                        {selectedComponentDetails.remarks ||
                          "No remarks provided for this component assignment."}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1 pt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                      Assignment Timeline
                    </p>
                    <div className="flex items-center gap-6 mt-1">
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold">
                          CREATED AT
                        </p>
                        <p className="text-[11px] font-extrabold text-gray-600">
                          {new Date(
                            selectedComponentDetails.created_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold">
                          LAST UPDATED
                        </p>
                        <p className="text-[11px] font-extrabold text-gray-600">
                          {new Date(
                            selectedComponentDetails.updated_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-red-500 font-bold">
                  Data corruption error. Cannot display.
                </div>
              )}
            </div>
            <DialogFooter className="px-8 pb-8 bg-white">
              <Button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-full bg-slate-900 hover:bg-black text-[12px] font-bold h-11 rounded-xl shadow-lg shadow-black/10"
              >
                Close View
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Component Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[24px]">
            <form onSubmit={handleUpdateComponent}>
              <DialogHeader className="bg-[#DFEEF9] p-6 text-[#136FB6] pb-10">
                <DialogTitle className="text-[20px] font-extrabold tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-[#136FB6]/10 rounded-xl">
                    <Edit size={20} />
                  </div>
                  Edit Component Data
                </DialogTitle>
              </DialogHeader>
              <div className="p-8 -mt-6 bg-white rounded-t-[24px] space-y-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-extrabold text-gray-500 ml-1 uppercase tracking-wide">
                    Update Quantity
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="bg-slate-50/50 border-gray-100 rounded-xl h-11 text-[14px] font-bold focus:ring-[#136FB6] focus:border-[#136FB6]"
                    placeholder="Enter updated value..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-extrabold text-gray-500 ml-1 uppercase tracking-wide">
                    Status Lifecycle
                  </Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="bg-slate-50/50 border-gray-100 rounded-xl h-11 text-[13px] font-bold">
                      <SelectValue placeholder="Select current status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="PENDING">Pending Approval</SelectItem>
                      <SelectItem value="IN_PROGRESS">
                        Active / In Progress
                      </SelectItem>
                      <SelectItem value="APPROVED">
                        Verified & Approved
                      </SelectItem>
                      <SelectItem value="REJECTED">
                        Audit Denied / Rejected
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-extrabold text-gray-500 ml-1 uppercase tracking-wide">
                    Detailed Remarks
                  </Label>
                  <textarea
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    className="w-full bg-slate-50/50 border border-gray-100 rounded-xl p-3 text-[13px] font-medium min-h-[100px] outline-none focus:ring-2 focus:ring-[#136FB6]/20 focus:border-[#136FB6] transition"
                    placeholder="Provide specific notes regarding this update..."
                  />
                </div>
              </div>
              <DialogFooter className="px-8 pb-8 bg-white gap-3 flex-col sm:flex-row">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 h-11 rounded-xl text-[12px] font-bold text-gray-500 hover:bg-slate-50"
                >
                  Discard Changes
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-[#136FB6] hover:bg-[#105E9A] text-white h-11 rounded-xl text-[12px] font-bold shadow-lg shadow-[#136FB6]/20"
                >
                  {updateMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Save Information"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
