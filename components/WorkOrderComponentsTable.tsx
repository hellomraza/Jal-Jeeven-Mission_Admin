"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ViewPhoto from "@/components/ViewPhoto";
import apiClient from "@/lib/api-client";
import { UserRole, WorkItemComponentStatus } from "@/types/usertypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  XSquare,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

interface WorkItemComponent {
  approved_photo_id: string | null;
  component_id: string;
  component: {
    id: string;
    name: string;
    unit: string;
  } | null;
  created_at: string;
  id: string;
  progress: string;
  quantity: string;
  remarks: null | string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "IN_PROGRESS" | "SUBMITTED";
  updated_at: string;
  work_item_id: string;
}

interface WorkOrderComponentsTableProps {
  components: WorkItemComponent[];
  userRole?: string;
  workItemId: string;
}

interface QuantityEdit {
  originalValue: number;
  currentValue: number;
  hasChanged: boolean;
}

export default function WorkOrderComponentsTable({
  components,
  userRole,
  workItemId,
}: WorkOrderComponentsTableProps) {
  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="rounded-t-2xl overflow-hidden">
            <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
              <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 rounded-tl-[20px]">
                S No.
              </TableHead>
              <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                Component Name
              </TableHead>
              <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                Quantity
              </TableHead>
              <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                Progress
              </TableHead>
              <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                % of Progress
              </TableHead>
              <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                Status
              </TableHead>
              <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                Photos
              </TableHead>
              {userRole === UserRole.DistrictOfficer && (
                <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                  Action
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {components?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={userRole === UserRole.DistrictOfficer ? 8 : 7}
                  className="h-40 text-center text-gray-500"
                >
                  No components found for this work item.
                </TableCell>
              </TableRow>
            ) : (
              components?.map((row, index) => (
                <WorkOrderComponentsTableRow
                  key={row.id}
                  row={row}
                  index={index}
                  userRole={userRole}
                  workItemId={workItemId}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

type WorkOrderComponentsTableRowProps = {
  row: WorkItemComponent;
  index: number;
  userRole?: string;
  workItemId: string;
};
const WorkOrderComponentsTableRow = ({
  row,
  index,
  userRole,
  workItemId,
}: WorkOrderComponentsTableRowProps) => {
  const [quantityEdits, setQuantityEdits] = useState<QuantityEdit | null>(null);
  const [confirmingComponent, setConfirmingComponent] = useState<string | null>(
    null,
  );
  const handleQuantityChange = (componentId: string, newValue: string) => {
    const numValue = parseInt(newValue, 10) || 0;
    const original = Number(row.quantity) || 0;

    setQuantityEdits((prev) => ({
      ...prev,
      originalValue: original,
      currentValue: numValue,
      hasChanged: numValue !== original,
    }));
  };

  const queryClient = useQueryClient();

  const getStatusBadge = (
    status: string,
    progress: number,
    quantity: number,
  ) => {
    switch (status) {
      case WorkItemComponentStatus.APPROVED:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold">
            <CheckCircle2 size={13} /> Approved
          </span>
        );
      case WorkItemComponentStatus.IN_PROGRESS: {
        if (progress === quantity && quantity > 0) {
          return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
              <Clock size={13} /> Completed
            </span>
          );
        } else if (progress > 0) {
          return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
              <Clock size={13} /> In Progress
            </span>
          );
        }
      }
      case WorkItemComponentStatus.SUBMITTED:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-[11px] font-bold">
            <Clock size={13} /> Submitted
          </span>
        );
      case WorkItemComponentStatus.REJECTED:
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

  const updateComponentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch(`/components/${row.id}`, {
        quantity: quantityEdits?.currentValue,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Component quantity updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["components", workItemId],
      });
      setQuantityEdits(null);
      setConfirmingComponent(null);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update component",
      );
    },
  });

  const isEditableStatus = () => {
    return (
      row.status === WorkItemComponentStatus.PENDING ||
      row.status === WorkItemComponentStatus.IN_PROGRESS
    );
  };

  const handleUpdate = () => {
    if (quantityEdits && quantityEdits?.hasChanged) {
      setConfirmingComponent(row.id);
    }
  };

  const confirmUpdate = () => {
    if (quantityEdits) {
      updateComponentMutation.mutate();
    }
  };

  const quantity = Number(row.quantity) || 0;
  const progress = Number(row.progress) || 0;
  const percentageProgress = quantity > 0 ? (progress / quantity) * 100 : 0;
  const isEditable =
    userRole === UserRole.DistrictOfficer && isEditableStatus();
  const displayQuantity = quantityEdits ? quantityEdits.currentValue : quantity;

  return (
    <>
      <TableRow
        key={row.id}
        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
      >
        <TableCell className="text-[12px] text-gray-600 py-4.5 font-bold pl-8">
          {index + 1}
        </TableCell>
        <TableCell className="text-[13px] text-gray-900 py-4.5 font-bold">
          {row.component?.name || "N/A"}{" "}
          {row.component?.unit ? `(${row.component.unit})` : ""}
        </TableCell>
        <TableCell className="text-[13px] text-gray-900 py-4.5 font-extrabold text-center">
          {userRole === UserRole.DistrictOfficer ? (
            <Input
              type="number"
              min="0"
              disabled={!isEditable}
              value={displayQuantity}
              onChange={(e) => handleQuantityChange(row.id, e.target.value)}
              className="w-24 h-8 text-center text-[12px]"
              placeholder="0"
            />
          ) : (
            <span>{displayQuantity}</span>
          )}
        </TableCell>
        <TableCell className="text-[13px] text-gray-900 py-4.5 font-extrabold text-center">
          {row.progress || "0"}
        </TableCell>
        <TableCell className="text-[13px] text-gray-900 py-4.5 font-extrabold text-center">
          {percentageProgress ? `${percentageProgress.toFixed(2)}%` : "0%"}
        </TableCell>
        <TableCell className="py-4.5 text-center">
          <div className="flex justify-center">
            {getStatusBadge(
              row.status,
              Number(row.progress),
              Number(row.quantity),
            )}
          </div>
        </TableCell>
        <TableCell className="py-4.5 ">
          <ViewPhoto component={row} role={userRole ?? ""} />
        </TableCell>
        {userRole === UserRole.DistrictOfficer && (
          <TableCell className="py-4.5 text-center">
            <Button
              size="sm"
              disabled={
                !quantityEdits?.hasChanged || updateComponentMutation.isPending
              }
              onClick={() => handleUpdate()}
              className="h-8 px-3 text-[11px] bg-[#136FB6] hover:bg-[#105E9A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateComponentMutation.isPending ? (
                <>
                  <Loader2 size={12} className="mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </TableCell>
        )}
      </TableRow>
      <AlertDialog
        open={!!confirmingComponent}
        onOpenChange={(open: boolean) => {
          if (!open) setConfirmingComponent(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Component Quantity?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmingComponent && (
                <>
                  <p className="mb-2">
                    Are you sure you want to update the quantity for this
                    component?
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    New Quantity:{" "}
                    <span className="text-[#136FB6]">
                      {quantityEdits?.currentValue}
                    </span>
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUpdate}
              className="bg-[#136FB6] hover:bg-[#105E9A]"
            >
              Confirm Update
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
