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
import { useToast } from "@/hooks/use-toast";
import { assignTpiStaffToWorkItem } from "@/services/workService";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ComboboxMultiple } from "./ComboboxMultiSelect";
import { Field, FieldLabel } from "./ui/field";

interface StaffMember {
  id: string;
  name?: string;
  email?: string;
  code?: string;
}

interface AssignTpiStaffComboboxProps {
  workItemId: string;
  availableStaff: StaffMember[];
}

export default function AssignTpiStaffCombobox({
  workItemId,
  availableStaff,
}: AssignTpiStaffComboboxProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const staffOptions = availableStaff.map((staff: StaffMember) => ({
    label: `${staff.name || "Staff"} (${staff.email || staff.code || ""})`,
    value: staff.id,
  }));

  const handleConfirmAssignment = async () => {
    if (selectedStaffIds.length === 0) return;
    setIsAssigning(true);
    try {
      for (const staffId of selectedStaffIds) {
        await assignTpiStaffToWorkItem(workItemId, staffId);
      }
      toast({
        title: "Staff Assigned",
        description: `Successfully assigned ${selectedStaffIds.length} staff member(s) to this work order.`,
      });
      setSelectedStaffIds([]);
      setShowConfirmation(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: error.message || "Failed to assign TPI staff.",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <Field className="space-y-2">
        <FieldLabel
          htmlFor="staffIds"
          className="text-xs font-bold text-[#1a2b3c]"
        >
          Select TPI Staff to Assign
        </FieldLabel>
        {staffOptions.length === 0 ? (
          <p className="text-[12px] text-gray-500 font-medium py-2">
            All registered staff are already assigned to this work order, or no staff have been created yet.
          </p>
        ) : (
          <ComboboxMultiple
            items={staffOptions}
            value={selectedStaffIds}
            onSelect={(selectedIds: string[]) => setSelectedStaffIds(selectedIds)}
            name="staffIds"
          />
        )}
      </Field>

      <Button
        onClick={() => setShowConfirmation(true)}
        type="button"
        disabled={isAssigning || selectedStaffIds.length === 0}
        className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white text-[12px] font-bold"
      >
        {isAssigning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Assigning...
          </>
        ) : (
          "Assign Staff"
        )}
      </Button>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Staff Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to assign {selectedStaffIds.length} staff member(s) to inspect this work order?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={handleConfirmAssignment}
            disabled={isAssigning}
            className="bg-[#136FB6] hover:bg-[#0d5a8f]"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Confirm"
            )}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isAssigning}>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
