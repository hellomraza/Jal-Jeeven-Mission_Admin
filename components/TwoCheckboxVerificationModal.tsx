"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentDetail } from "@/types/payment";
import { CheckCircle2, FileText, Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import VoucherFileViewerModal from "./VoucherFileViewerModal";

interface TwoCheckboxVerificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentDetail | null;
  title: string;
  description: string;
  actionButtonLabel: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export default function TwoCheckboxVerificationModal({
  isOpen,
  onOpenChange,
  payment,
  title,
  description,
  actionButtonLabel,
  onConfirm,
  isLoading = false,
}: TwoCheckboxVerificationModalProps) {
  const [detailsVerified, setDetailsVerified] = useState(false);
  const [amountVerified, setAmountVerified] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setDetailsVerified(false);
      setAmountVerified(false);
    }
    onOpenChange(open);
  };

  const handleConfirm = async () => {
    if (detailsVerified && amountVerified) {
      await onConfirm();
      setDetailsVerified(false);
      setAmountVerified(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#136FB6] flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <DialogTitle className="text-[17px] font-bold text-[#1a2b3c]">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Record Overview */}
        <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 space-y-3 mt-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-gray-400 font-semibold block">Contractor</span>
              <span className="font-bold text-[#1a2b3c]">{payment.contractor_name}</span>
              <span className="text-gray-500 block text-[11px]">({payment.contractor_code})</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block">Work Order Code</span>
              <span className="font-bold text-[#1a2b3c]">{payment.work_order_code}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200/60">
            <div>
              <span className="text-gray-400 font-semibold block">Bank & Account</span>
              <span className="font-medium text-[#1a2b3c]">{payment.bank_name}</span>
              <span className="text-gray-500 block font-mono text-[11px]">{payment.bank_account_number}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block">Amount</span>
              <span className="text-[15px] font-extrabold text-[#136FB6]">
                ₹{Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
            <span>
              <strong className="text-gray-500">Voucher No:</strong>{" "}
              <span className="font-mono text-[#1a2b3c] font-semibold">{payment.voucher_number}</span>
            </span>
            {payment.cheque_number && (
              <span>
                <strong className="text-gray-500">Cheque No:</strong>{" "}
                <span className="font-mono text-[#1a2b3c] font-semibold">{payment.cheque_number}</span>
              </span>
            )}
            {payment.voucher_file_url && (
              <VoucherFileViewerModal
                fileUrl={payment.voucher_file_url}
                voucherNumber={payment.voucher_number}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-semibold text-[#136FB6] hover:underline"
                >
                  <FileText size={12} />
                  View Voucher PDF
                </button>
              </VoucherFileViewerModal>
            )}
          </div>
        </div>

        {/* Verification Checkboxes */}
        <div className="space-y-3 mt-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
            <input
              type="checkbox"
              id="verify_details"
              checked={detailsVerified}
              onChange={(e) => setDetailsVerified(e.target.checked)}
              className="h-4 w-4 mt-0.5 rounded border-gray-300 text-[#136FB6] focus:ring-[#136FB6] cursor-pointer"
              disabled={isLoading}
            />
            <label
              htmlFor="verify_details"
              className="text-xs font-semibold text-[#1a2b3c] cursor-pointer select-none leading-relaxed"
            >
              I verify that all the details filled in this payment record are valid and correct as per the voucher.
            </label>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
            <input
              type="checkbox"
              id="verify_amount"
              checked={amountVerified}
              onChange={(e) => setAmountVerified(e.target.checked)}
              className="h-4 w-4 mt-0.5 rounded border-gray-300 text-[#136FB6] focus:ring-[#136FB6] cursor-pointer"
              disabled={isLoading}
            />
            <label
              htmlFor="verify_amount"
              className="text-xs font-semibold text-[#1a2b3c] cursor-pointer select-none leading-relaxed"
            >
              I have confirmed that the entered amount (₹{Number(payment.amount).toLocaleString("en-IN")}) is correct as per the physical voucher.
            </label>
          </div>
        </div>

        <DialogFooter className="pt-3 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!detailsVerified || !amountVerified || isLoading}
            onClick={handleConfirm}
            className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              actionButtonLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
