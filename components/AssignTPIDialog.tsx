"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTPIs } from "@/services/userService";
import { assignTpiToWorkOrder } from "@/services/workOrderTpiService";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AssignTPIDialogProps {
  workOrder: any | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: () => void;
}

export default function AssignTPIDialog({
  workOrder,
  isOpen,
  onOpenChange,
  onAssigned,
}: AssignTPIDialogProps) {
  const [selectedTpiId, setSelectedTpiId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (workOrder?.tpiAssignment?.tpi_id) {
      setSelectedTpiId(workOrder.tpiAssignment.tpi_id);
    } else {
      setSelectedTpiId("");
    }
  }, [workOrder]);

  const districtId =
    workOrder?.district_id || workOrder?.district?.district_code;

  const tpiQuery = useQuery({
    queryKey: ["tpis-for-district", districtId],
    queryFn: async () => {
      const list = await getTPIs(districtId);
      return Array.isArray(list) ? list : [];
    },
    enabled: isOpen && Boolean(districtId),
  });

  const tpis = tpiQuery.data || [];
  const isLoadingTpis = tpiQuery.isLoading;

  const handleAssign = async () => {
    if (!workOrder?.id || !selectedTpiId) return;

    setIsSubmitting(true);
    try {
      await assignTpiToWorkOrder(workOrder.id, selectedTpiId);
      toast.success("TPI officer assigned to work order successfully.");
      onOpenChange(false);
      onAssigned?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to assign TPI officer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-0 border-0 rounded-2xl overflow-hidden bg-white shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-[#136FB6]">
            <ShieldCheck size={20} />
            <DialogTitle className="text-[18px] font-bold text-[#1a2b3c]">
              Assign TPI Inspector
            </DialogTitle>
          </div>
          <p className="text-[12px] text-gray-500 font-medium mt-1">
            Assign the district TPI inspector for independent field verification
          </p>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 space-y-1">
            <p className="text-[11px] font-bold text-[#136FB6] uppercase tracking-wider">
              Work Order
            </p>
            <p className="text-[14px] font-bold text-[#1a2b3c]">
              {workOrder?.work_code || "N/A"}
            </p>
            <p className="text-[12px] text-gray-600 font-medium truncate">
              {workOrder?.title || "No title"}
            </p>
          </div>

          <Field>
            <FieldLabel className="text-[12px] font-bold text-[#1a2b3c]">
              Select TPI Inspector <span className="text-red-500">*</span>
            </FieldLabel>
            <Select
              value={selectedTpiId}
              onValueChange={setSelectedTpiId}
              disabled={isLoadingTpis}
            >
              <SelectTrigger className="h-10 border-gray-200 focus:border-[#136FB6] focus:ring-0 text-[13px] bg-white">
                <SelectValue
                  placeholder={
                    isLoadingTpis
                      ? "Loading district TPI officers..."
                      : tpis.length === 0
                      ? "No TPI found in this district"
                      : "Choose TPI officer"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tpis.map((tpi: any) => (
                  <SelectItem key={tpi.id} value={tpi.id}>
                    {tpi.name} ({tpi.code}) - {tpi.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tpis.length === 0 && !isLoadingTpis && (
              <p className="text-[11px] text-amber-600 font-medium mt-1.5">
                ⚠️ No TPI officer is registered for this district yet. Head Office must create a TPI officer first.
              </p>
            )}
          </Field>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 text-[13px] font-semibold border-gray-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !selectedTpiId}
            onClick={handleAssign}
            className="h-10 text-[13px] font-semibold bg-[#136FB6] hover:bg-[#0f5a94] text-white"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
