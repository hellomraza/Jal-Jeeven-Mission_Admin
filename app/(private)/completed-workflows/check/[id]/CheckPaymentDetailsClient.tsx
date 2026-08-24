"use client";

import {
  doCheckPaymentAction,
  eeCheckPaymentAction,
  sendToDOAction,
} from "@/actions/paymentAction";
import BackButton from "@/components/BackButton";
import VoucherFileViewerModal from "@/components/VoucherFileViewerModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PaymentDetail } from "@/types/payment";
import {
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  Receipt,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CheckPaymentDetailsClientProps {
  payment: PaymentDetail;
  userRole?: string;
}

export default function CheckPaymentDetailsClient({
  payment,
  userRole,
}: CheckPaymentDetailsClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [detailsVerified, setDetailsVerified] = useState(false);
  const [amountVerified, setAmountVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = detailsVerified && amountVerified && !isSubmitting;

  const isStaffFlow = payment.status === "DETAILS_FILLED";
  const isDOFlow = payment.status === "SEND_TO_DO";
  const isEEFlow = payment.status === "SEND_TO_EE";

  const getPageTitle = () => {
    if (isStaffFlow) return "Verify & Send to Divisional Account Officer";
    if (isDOFlow)
      return "Divisional Account Officer - Check & Validate Details";
    if (isEEFlow) return "Executive Engineer - Check & Validate Details";
    return "Check Payment Details";
  };

  const getActionButtonLabel = () => {
    if (isStaffFlow) return "Confirm & Send to DAO";
    if (isDOFlow) return "Confirm & Validate Details";
    if (isEEFlow) return "Confirm & Validate Details";
    return "Confirm Verification";
  };

  const handleConfirm = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      let res;
      if (isStaffFlow) {
        res = await sendToDOAction(payment.id);
      } else if (isDOFlow) {
        res = await doCheckPaymentAction(payment.id);
      } else if (isEEFlow) {
        res = await eeCheckPaymentAction(payment.id);
      } else {
        toast({
          title: "Invalid action",
          description: "This record is not in a status requiring verification.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!res.success) {
        toast({
          title: "Verification Failed",
          description: res.error || "Failed to submit verification.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      } else {
        toast({
          title: "Verification Successful",
          description: isStaffFlow
            ? "Payment record verified and sent to Divisional Account Officer."
            : isDOFlow
              ? "Payment record details validated by Divisional Account Officer."
              : "Payment record verified by Executive Engineer.",
        });

        // Automatically return to the payment table
        router.push("/completed-workflows");
        router.refresh();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1a2b3c]">
                {getPageTitle()}
              </h1>
              <Badge
                variant="outline"
                className="text-xs uppercase font-bold text-[#136FB6] border-blue-200 bg-blue-50/50"
              >
                {payment.status}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Review all fields one by one against the physical voucher before
              confirming.
            </p>
          </div>
        </div>

        {/* Single-Column Sequential Details Card */}
        <Card className="border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6 space-y-6">
            {/* GROUP 1: Contractor & Work Order Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <UserIcon size={16} className="text-[#136FB6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Contractor & Work Order Information
                </h2>
              </div>

              {/* Field: Contractor Code */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  Contractor Code
                </label>
                <div className="text-sm font-mono font-semibold text-gray-800 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                  {payment.contractor_code}
                </div>
              </div>

              {/* Field: Work Order Code */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  Work Order Code
                </label>
                <div className="text-sm font-mono font-semibold text-gray-800 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                  {payment.work_order_code}
                </div>
              </div>
            </div>

            {/* GROUP 2: Bank Account Information */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Building2 size={16} className="text-[#136FB6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Bank Account Information
                </h2>
              </div>

              {/* Field: Bank Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  Bank Name
                </label>
                <div className="text-base font-bold text-[#1a2b3c] bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                  {payment.bank_name}
                </div>
              </div>

              {/* Field: Bank Account Number */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  Bank Account Number
                </label>
                <div className="text-lg font-mono font-extrabold text-[#1a2b3c] bg-amber-50/40 p-3 rounded-lg border border-amber-200/60">
                  {payment.bank_account_number}
                </div>
              </div>

              {/* Field: IFSC Code */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  IFSC Code
                </label>
                <div className="text-sm font-mono font-bold text-gray-800 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                  {payment.ifsc_code}
                </div>
              </div>

              {/* Field: Branch Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  Branch Name
                </label>
                <div className="text-sm font-medium text-gray-800 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                  {payment.branch}
                </div>
              </div>

              {/* Field: Contractor Name as per Bank Account */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  Contractor Name as per Bank Account
                </label>
                <div className="text-base font-bold text-[#1a2b3c] bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                  {payment.contractor_name}
                </div>
              </div>

              {/* Field: Total Payment Amount */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  Total Payment Amount (₹)
                </label>
                <div className="text-2xl font-extrabold text-[#136FB6] bg-blue-50/60 p-4 rounded-lg border border-blue-200">
                  ₹
                  {Number(payment.amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>

            {/* GROUP 3: Voucher & Verification Document */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Receipt size={16} className="text-[#136FB6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Voucher & Verification Document
                </h2>
              </div>

              {/* Field: Voucher Number */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  Voucher Number
                </label>
                <div className="text-base font-mono font-bold text-[#1a2b3c] bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                  {payment.voucher_number}
                </div>
              </div>

              {/* Field: Voucher Document */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  Attached Voucher Document
                </label>
                <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                  {payment.voucher_file_url ? (
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-[#136FB6]" />
                      <span className="text-xs font-medium text-gray-700">
                        {payment.voucherFile?.file_name ||
                          "Voucher PDF Document"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">
                      No PDF attached
                    </span>
                  )}

                  {payment.voucher_file_url && (
                    <VoucherFileViewerModal
                      fileUrl={payment.voucher_file_url}
                      voucherNumber={payment.voucher_number}
                    >
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs text-[#136FB6] h-8"
                      >
                        <FileText size={13} className="mr-1.5" />
                        View Attached PDF
                      </Button>
                    </VoucherFileViewerModal>
                  )}
                </div>
              </div>
            </div>

            {/* GROUP 4: Verification Checkpoints */}
            <div className="space-y-4 pt-4 border-t-2 border-blue-100">
              <div className="flex items-center gap-2 pb-1">
                <ShieldCheck size={18} className="text-[#136FB6]" />
                <h2 className="text-sm font-bold text-[#1a2b3c]">
                  Verification Confirmation
                </h2>
              </div>

              {/* Checkbox 1 */}
              <div
                onClick={() =>
                  !isSubmitting && setDetailsVerified(!detailsVerified)
                }
                className={`p-4 rounded-xl border transition-colors cursor-pointer select-none flex items-start gap-3.5 ${
                  detailsVerified
                    ? "bg-blue-50 border-blue-300"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  id="chk_details"
                  checked={detailsVerified}
                  onChange={(e) => setDetailsVerified(e.target.checked)}
                  className="h-5 w-5 mt-0.5 rounded border-gray-300 text-[#136FB6] focus:ring-[#136FB6] cursor-pointer shrink-0"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="chk_details"
                  className="text-xs font-semibold text-gray-800 cursor-pointer leading-relaxed"
                >
                  I verify that all the details filled in this payment record
                  (Contractor Name, Bank Account, IFSC, Work Order) are valid
                  and correct as per the official voucher.
                </label>
              </div>

              {/* Checkbox 2 */}
              <div
                onClick={() =>
                  !isSubmitting && setAmountVerified(!amountVerified)
                }
                className={`p-4 rounded-xl border transition-colors cursor-pointer select-none flex items-start gap-3.5 ${
                  amountVerified
                    ? "bg-blue-50 border-blue-300"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  id="chk_amount"
                  checked={amountVerified}
                  onChange={(e) => setAmountVerified(e.target.checked)}
                  className="h-5 w-5 mt-0.5 rounded border-gray-300 text-[#136FB6] focus:ring-[#136FB6] cursor-pointer shrink-0"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="chk_amount"
                  className="text-xs font-semibold text-gray-800 cursor-pointer leading-relaxed"
                >
                  I have confirmed that the entered amount of{" "}
                  <span className="text-[#136FB6] font-bold">
                    ₹
                    {Number(payment.amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>{" "}
                  is accurate and matches the voucher.
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/completed-workflows")}
                disabled={isSubmitting}
                className="w-full sm:w-1/3 h-11"
              >
                Cancel & Return
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!canSubmit}
                className="w-full sm:w-2/3 bg-[#136FB6] hover:bg-[#0d5a8f] text-white h-11 text-sm font-bold flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying & Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    {getActionButtonLabel()}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
