"use client";

import { deletePaymentAction } from "@/actions/paymentAction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PaymentDetail } from "@/types/payment";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeletePaymentConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentDetail | null;
}

export default function DeletePaymentConfirmModal({
  isOpen,
  onOpenChange,
  payment,
}: DeletePaymentConfirmModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!payment) return null;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsConfirmed(false);
      setIsDeleting(false);
    }
    onOpenChange(open);
  };

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await deletePaymentAction(payment.id);
      if (res.success) {
        toast({
          title: "Record Deleted",
          description: "Payment record has been successfully deleted.",
        });
        handleOpenChange(false);
        router.refresh();
      } else {
        toast({
          title: "Delete Failed",
          description: res.error || "Failed to delete payment record.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#1a2b3c]">
                Delete Payment Record
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Are you sure you want to delete this payment record? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 text-xs space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Contractor:</span>
            <span className="font-bold text-[#1a2b3c] truncate max-w-[200px]">
              {payment.contractor_name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Voucher Number:</span>
            <span className="font-mono font-semibold text-gray-800">
              {payment.voucher_number}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-gray-200">
            <span className="text-gray-500 font-medium">Payment Amount:</span>
            <span className="font-bold text-red-600">
              ₹{Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Mandatory Confirmation Checkbox */}
        <div
          onClick={() => !isDeleting && setIsConfirmed(!isConfirmed)}
          className={`p-3.5 rounded-xl border transition-colors cursor-pointer select-none flex items-start gap-3 mt-2 ${
            isConfirmed
              ? "bg-red-50/70 border-red-200"
              : "bg-gray-50/60 border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="checkbox"
            id="delete_confirm_checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="h-4 w-4 mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer shrink-0"
            disabled={isDeleting}
          />
          <label
            htmlFor="delete_confirm_checkbox"
            className="text-xs font-semibold text-gray-800 cursor-pointer leading-relaxed"
          >
            I understand that this action cannot be undone and confirm deletion of this payment record.
          </label>
        </div>

        <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={13} />
                Delete Record
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
