"use client";

import { assignEmployees } from "@/actions/userAction";
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
import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { ComboboxMultiple } from "./ComboboxMultiSelect";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

interface AssignEmployeeComboboxProps {
  workItemId: string;
  availableEmployees: Employee[];
  assignedEmployeeIds?: string[];
}

interface Employee {
  id: string;
  name: string;
  email: string;
}

export default function AssignEmployeeCombobox({
  workItemId,
  availableEmployees,
}: AssignEmployeeComboboxProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const employeeOptions = availableEmployees.map((emp: Employee) => ({
    label: `${emp.name} (${emp.email})`,
    value: emp.id,
  }));

  const [state, formAction, isAssigning] = useActionState(assignEmployees, {
    error: "",
    success: "",
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Success",
        description: "Employees assigned successfully",
      });
      formRef.current?.reset();
      setSelectedEmployeeIds([]);
      setShowConfirmation(false);
    }
  }, [state, toast, formRef]);

  const openConfirmation = () => {
    setShowConfirmation(true);
  };

  return (
    <form action={formAction} ref={formRef}>
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
        <Field className="space-y-2">
          <FieldLabel
            htmlFor="employeeIds"
            className="text-xs font-semibold text-gray-500"
          >
            Select Employees to Assign
          </FieldLabel>
          <ComboboxMultiple
            key={state.error + state.success}
            items={employeeOptions}
            value={selectedEmployeeIds}
            onSelect={(selectedIds: string[]) =>
              setSelectedEmployeeIds(selectedIds)
            }
            name="employeeIds"
          />
        </Field>
        <Field className="hidden">
          <Input type="hidden" name="workItemId" value={workItemId} />
        </Field>

        <Button
          onClick={openConfirmation}
          type="button"
          disabled={isAssigning || selectedEmployeeIds.length === 0}
          className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white"
        >
          {isAssigning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            "Assign Employees"
          )}
        </Button>
      </div>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to assign {selectedEmployeeIds.length}{" "}
              employee(s) to this work item?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
            disabled={isAssigning}
            className="bg-[#136FB6] hover:bg-[#0d5a8f]"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm"
            )}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isAssigning}>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
