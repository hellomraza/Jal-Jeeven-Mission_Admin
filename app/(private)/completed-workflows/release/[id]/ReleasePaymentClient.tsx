"use client";

import { releasePaymentAction } from "@/actions/paymentAction";
import BackButton from "@/components/BackButton";
import VoucherFileViewerModal from "@/components/VoucherFileViewerModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PaymentDetail } from "@/types/payment";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileCheck,
  FileText,
  Loader2,
  Lock,
  Receipt,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ReleasePaymentClientProps {
  payment: PaymentDetail;
  userRole?: string;
}

export default function ReleasePaymentClient({
  payment,
  userRole,
}: ReleasePaymentClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [detailsVerified, setDetailsVerified] = useState(false);
  const [releaseConfirmed, setReleaseConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canRelease = detailsVerified && releaseConfirmed && !isSubmitting;

  const contractorId = payment.contractor_id || (payment as any).contractor_code || "—";
  const agreementNo = payment.agreement_number || (payment as any).work_order_code || "—";
  const beneficiaryName = payment.beneficiary_name || payment.contractor_name || "—";

  const handleReleasePayment = async () => {
    if (!canRelease) return;

    setIsSubmitting(true);
    try {
      const res = await releasePaymentAction(payment.id);

      if (!res.success) {
        toast({
          title: "Payment Release Failed",
          description: res.error || "Failed to authorize and release payment.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      } else {
        toast({
          title: "Payment Successfully Released",
          description: `Payment of ₹${Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })} for ${payment.contractor_name} has been marked as PAID.`,
        });

        // Redirect directly to the Payment History tab
        router.push("/completed-workflows?tab=history");
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

  const isAlreadyPaid = payment.status === "PAID";
  const isReadyForRelease = payment.status === "EE_CHECKED";

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2b3c]">
                Authorize & Release Payment
              </h1>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-bold text-xs uppercase">
                Executive Engineer
              </Badge>
            </div>
            <p className="text-sm text-gray-600 font-medium mt-1">
              Final authorization step. Review all details before releasing payment.
            </p>
          </div>
        </div>

        {/* Warning / Instruction Banner */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
              <Lock size={16} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Final Authorization Step
              </h4>
              <p className="text-xs sm:text-[13px] text-amber-800 leading-relaxed">
                Releasing this payment will mark its status as{" "}
                <strong className="font-extrabold text-amber-950">PAID</strong> and move it to the permanent{" "}
                <strong className="font-extrabold text-amber-950">Payment History</strong> tab.
                Once paid, the record will be permanently locked and cannot be edited or deleted.
              </p>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <Card className="border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6 sm:p-7 space-y-6">
            {/* GROUP 1: Contractor & Agreement Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
                <UserIcon size={18} className="text-[#136FB6]" />
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-800">
                  1. Contractor & Agreement Information
                </h2>
              </div>

              {/* Field: Contractor Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800 block">
                  Contractor Name
                </label>
                <div className="text-sm sm:text-base font-bold text-[#1a2b3c] bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                  {payment.contractor_name || "—"}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field: Contractor ID */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800 block">
                    Contractor ID
                  </label>
                  <div className="text-sm font-mono font-bold text-gray-900 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                    {contractorId}
                  </div>
                </div>

                {/* Field: Year */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800 block">
                    Year
                  </label>
                  <div className="text-sm font-semibold text-gray-900 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                    {payment.year || "—"}
                  </div>
                </div>
              </div>

              {/* Field: Agreement Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800 block">
                  Agreement Number
                </label>
                <div className="text-sm font-mono font-bold text-gray-900 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                  {agreementNo}
                </div>
              </div>
            </div>

            {/* GROUP 2: Bank Account & Beneficiary Information */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
                <Building2 size={18} className="text-[#136FB6]" />
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-800">
                  2. Bank Account & Beneficiary Information
                </h2>
              </div>

              {/* Field: Beneficiary Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800 block">
                  Beneficiary Name (as per Bank Account)
                </label>
                <div className="text-sm sm:text-base font-bold text-[#1a2b3c] bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                  {beneficiaryName}
                </div>
              </div>

              {/* Field: Bank Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800 block">
                  Bank Name
                </label>
                <div className="text-sm sm:text-base font-bold text-[#1a2b3c] bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                  {payment.bank_name || "—"}
                </div>
              </div>

              {/* Field: Bank Account Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800 block">
                  Bank Account Number
                </label>
                <div className="text-lg font-mono font-extrabold text-[#1a2b3c] bg-amber-50/60 p-3 rounded-lg border border-amber-300">
                  {payment.bank_account_number || "—"}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field: IFSC Code */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800 block">
                    IFSC Code
                  </label>
                  <div className="text-sm font-mono font-bold text-gray-900 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                    {payment.ifsc_code || "—"}
                  </div>
                </div>

                {/* Field: Branch Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800 block">
                    Branch Name
                  </label>
                  <div className="text-sm font-semibold text-gray-900 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                    {payment.branch || "—"}
                  </div>
                </div>
              </div>

              {/* Field: Total Payment Amount */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800 block">
                  Total Payable Amount (₹)
                </label>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 bg-emerald-50/90 p-4 rounded-lg border border-emerald-300 flex items-center justify-between">
                  <span>
                    ₹
                    {Number(payment.amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded">
                    Authorized Amount
                  </span>
                </div>
              </div>
            </div>

            {/* GROUP 3: Voucher & Verification Document */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
                <Receipt size={18} className="text-[#136FB6]" />
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-800">
                  3. Voucher & Attached Documents
                </h2>
              </div>

              {/* Field: Voucher Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800 block">
                  Voucher Number
                </label>
                <div className="text-base font-mono font-bold text-[#1a2b3c] bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                  {payment.voucher_number || "—"}
                </div>
              </div>

              {/* Field: Cheque Number (if present) */}
              {payment.cheque_number && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800 block">
                    Cheque Number
                  </label>
                  <div className="text-sm font-mono font-semibold text-gray-900 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                    {payment.cheque_number}
                  </div>
                </div>
              )}

              {/* Field: Voucher Document */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800 block">
                  Attached Voucher Document
                </label>
                <div className="bg-gray-50/80 p-3.5 rounded-lg border border-gray-200 flex items-center justify-between">
                  {payment.voucher_file_url ? (
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-[#136FB6]" />
                      <span className="text-sm font-semibold text-gray-800">
                        {payment.voucherFile?.file_name ||
                          "Voucher PDF Document"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">
                      No PDF attached
                    </span>
                  )}

                  {payment.voucher_file_url && (
                    <VoucherFileViewerModal
                      fileUrl={payment.voucher_file_url}
                      voucherNumber={payment.voucher_number}
                      title="Voucher Document Preview"
                    >
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs sm:text-sm font-semibold text-[#136FB6] border-[#136FB6]/40 hover:bg-blue-50 h-8"
                      >
                        <FileText size={14} className="mr-1.5" />
                        View Attached PDF
                      </Button>
                    </VoucherFileViewerModal>
                  )}
                </div>
              </div>

              {/* Additional Document (if present) */}
              {payment.additional_pdf_url && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800 block">
                    Additional Document
                  </label>
                  <div className="bg-purple-50/50 p-3.5 rounded-lg border border-purple-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-purple-600" />
                      <span className="text-sm font-semibold text-gray-800">
                        {payment.additional_file_name || "Additional Document"}
                      </span>
                    </div>

                    <VoucherFileViewerModal
                      fileUrl={payment.additional_pdf_url}
                      title="Additional Document Preview"
                    >
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs sm:text-sm font-semibold text-purple-700 border-purple-300 h-8 hover:bg-purple-100/60"
                      >
                        <FileText size={14} className="mr-1.5" />
                        View Document
                      </Button>
                    </VoucherFileViewerModal>
                  </div>
                </div>
              )}
            </div>

            {/* GROUP 4: Two Mandatory Release Confirmations */}
            {!isAlreadyPaid && isReadyForRelease && (
              <div className="space-y-4 pt-4 border-t-2 border-purple-200">
                <div className="flex items-center gap-2 pb-1">
                  <ShieldCheck size={20} className="text-purple-700" />
                  <h2 className="text-sm sm:text-base font-bold text-[#1a2b3c]">
                    Executive Engineer Release Confirmation (Mandatory)
                  </h2>
                </div>

                {/* Checkbox 1 */}
                <div
                  onClick={() =>
                    !isSubmitting && setDetailsVerified(!detailsVerified)
                  }
                  className={`p-4 rounded-xl border transition-colors cursor-pointer select-none flex items-start gap-3.5 ${
                    detailsVerified
                      ? "bg-purple-50/90 border-purple-400 shadow-sm"
                      : "bg-gray-50/80 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    id="chk_details"
                    checked={detailsVerified}
                    onChange={(e) => setDetailsVerified(e.target.checked)}
                    className="h-5 w-5 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="chk_details"
                    className="text-xs sm:text-sm font-semibold text-gray-900 cursor-pointer leading-relaxed"
                  >
                    1. I verify that all the details in this payment record
                    (Contractor Name:{" "}
                    <span className="font-bold text-[#136FB6]">
                      {payment.contractor_name}
                    </span>
                    , Contractor ID:{" "}
                    <span className="font-mono font-bold text-gray-900">
                      {contractorId}
                    </span>
                    {payment.year ? `, Year: ${payment.year}` : ""}, Agreement No:{" "}
                    <span className="font-bold text-gray-900">
                      {agreementNo}
                    </span>
                    , Beneficiary Name, Bank Account, and IFSC) are verified and
                    accurate.
                  </label>
                </div>

                {/* Checkbox 2 */}
                <div
                  onClick={() =>
                    !isSubmitting && setReleaseConfirmed(!releaseConfirmed)
                  }
                  className={`p-4 rounded-xl border transition-colors cursor-pointer select-none flex items-start gap-3.5 ${
                    releaseConfirmed
                      ? "bg-emerald-50/90 border-emerald-400 shadow-sm"
                      : "bg-gray-50/80 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    id="chk_release"
                    checked={releaseConfirmed}
                    onChange={(e) => setReleaseConfirmed(e.target.checked)}
                    className="h-5 w-5 mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="chk_release"
                    className="text-xs sm:text-sm font-semibold text-gray-900 cursor-pointer leading-relaxed"
                  >
                    2. I hereby confirm and authorize the release of payment for{" "}
                    <span className="text-emerald-700 font-extrabold text-sm sm:text-base">
                      ₹
                      {Number(payment.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    . I understand this status will become{" "}
                    <span className="font-bold text-emerald-700">PAID</span> and
                    cannot be edited or deleted.
                  </label>
                </div>
              </div>
            )}

            {isAlreadyPaid && (
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800 border border-emerald-200 flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                <p className="text-sm font-bold">
                  This payment has already been released and is marked as PAID.
                </p>
              </div>
            )}

            {!isAlreadyPaid && !isReadyForRelease && (
              <div className="rounded-xl bg-amber-50 p-4 text-amber-800 border border-amber-200 flex items-center gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                <p className="text-xs sm:text-sm font-medium">
                  This payment is currently in status: <strong>{payment.status}</strong>. It must be in <strong>EE_CHECKED</strong> status before releasing payment.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/completed-workflows?tab=pay")}
                disabled={isSubmitting}
                className="w-full sm:w-1/3 h-11 text-xs sm:text-sm font-semibold text-gray-700"
              >
                Cancel & Return
              </Button>

              {!isAlreadyPaid && isReadyForRelease && (
                <Button
                  type="button"
                  onClick={handleReleasePayment}
                  disabled={!canRelease}
                  className="w-full sm:w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Releasing Payment...
                    </>
                  ) : (
                    <>
                      <FileCheck size={18} />
                      Release Payment (Mark as Paid)
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
