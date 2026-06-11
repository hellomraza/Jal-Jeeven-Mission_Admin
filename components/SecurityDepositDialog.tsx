"use client";

import { updateSecurityDepositAction } from "@/actions/agreementAction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";
import { useActionState } from "react";

type Props = {
  agreementId: string;
  agreementNo: string;
  contractorName: string;
  contractorCode: string;
  children?: React.ReactNode;
};

export default function SecurityDepositDialog({
  agreementId,
  agreementNo,
  contractorName,
  contractorCode,
  children,
}: Props) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [state, action, isPending] = useActionState(
    updateSecurityDepositAction,
    { success: "", error: "" }
  );

  React.useEffect(() => {
    if (state.error) {
      toast({
        title: "Failed to update",
        description: state.error,
        variant: "destructive",
      });
    }
    if (state.success) {
      toast({
        title: "Success",
        description: state.success,
      });
      setOpen(false);
    }
  }, [state, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 bg-white text-[#136FB6] border-[#136FB6]/20 hover:bg-[#DFEEF9] text-[11px] font-bold"
          >
            Add Security Deposit
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Security Deposit</DialogTitle>
          <DialogDescription>
            Update the security deposit for this agreement.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4 mt-2">
          <input type="hidden" name="agreementId" value={agreementId} />

          <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Agreement No:</span>
              <span className="font-semibold text-foreground">{agreementNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contractor:</span>
              <span className="font-semibold text-foreground">{contractorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contractor Code:</span>
              <span className="font-semibold text-foreground">{contractorCode}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="security_deposit">Security Deposit Amount (₹)</Label>
            <Input
              id="security_deposit"
              name="security_deposit"
              type="number"
              min="0"
              required
              placeholder="Enter security deposit amount"
            />
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
