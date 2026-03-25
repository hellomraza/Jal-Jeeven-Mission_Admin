"use client";

import { updateComponent } from "@/actions/componentAction";
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
import { UserRole, WorkItemComponentStatus } from "@/types/usertypes";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Edit,
  Loader2,
  XSquare,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Field, FieldLabel } from "./ui/field";

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

  const [state, update, isPending] = useActionState(updateComponent, {
    error: "",
    success: "",
  });

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
      setQuantityEdits(null);
      setConfirmingComponent(null);
    } else if (state.success) {
      toast.success(state.success);
      setQuantityEdits(null);
      setConfirmingComponent(null);
    }
  }, [state]);

  const isEditableStatus = () => {
    return (
      row.status === WorkItemComponentStatus.PENDING ||
      row.status === WorkItemComponentStatus.IN_PROGRESS
    );
  };

  const quantity = Number(row.quantity) || 0;
  const progress = Number(row.progress) || 0;
  const percentageProgress = quantity > 0 ? (progress / quantity) * 100 : 0;
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
          <span>{displayQuantity}</span>
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
              disabled={!isEditableStatus() || isPending}
              onClick={() => setConfirmingComponent(row.id)}
              className="h-8 px-3 text-[11px] bg-[#136FB6] hover:bg-[#105E9A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 size={12} className="mr-1 animate-spin" />
              ) : (
                <Edit size={14} className="stroke-[2.5]" />
              )}
            </Button>
          </TableCell>
        )}
      </TableRow>
      <AlertDialog
        open={!!confirmingComponent}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setConfirmingComponent(null);
            setQuantityEdits(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Component Quantity</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the new quantity for this component.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form action={update}>
            <Field>
              <FieldLabel
                htmlFor="quantity"
                className="text-sm font-medium text-gray-700"
              >
                New Quantity
              </FieldLabel>
              <Input
                type="number"
                min="0"
                defaultValue={quantity}
                name="quantity"
                placeholder="Enter quantity"
              />
            </Field>
            <Input
              type="hidden"
              defaultValue={row.id}
              name="componentId"
              placeholder="Enter quantity"
            />
            <Input
              type="hidden"
              defaultValue={workItemId}
              name="workItemId"
              placeholder="Enter quantity"
            />
            <div className="flex gap-2 justify-end mt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                disabled={isPending}
                className="bg-[#136FB6] hover:bg-[#105E9A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <Check size={14} className="stroke-[2.5] mr-1" />
                )}
                Update Quantity
              </AlertDialogAction>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
