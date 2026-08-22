import BackButton from "@/components/BackButton";
import VoucherFileViewerModal from "@/components/VoucherFileViewerModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createServerApiClient } from "@/lib/server-api-client";
import { PaymentDetail, PaymentDetailStatus } from "@/types/payment";
import {
  Building2,
  Calendar,
  CheckCircle,
  FileCheck,
  FileText,
  History,
  Mail,
  Receipt,
  Send,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

export interface PaymentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentDetailsPage({
  params,
}: PaymentDetailsPageProps) {
  const { id } = await params;

  let payment: PaymentDetail | null = null;
  let error: string | null = null;

  try {
    const apiClient = await createServerApiClient();
    const res = await apiClient.get<PaymentDetail>(`/payments/${id}`);
    payment = res.data;
  } catch (err: any) {
    console.error("Failed to load payment detail:", err);
    error = err.response?.data?.message || err.message || "Record not found";
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <BackButton />
          <div className="rounded-xl bg-red-50 p-6 text-red-700 border border-red-100">
            <h2 className="text-lg font-bold">Payment Record Not Found</h2>
            <p className="text-sm mt-1">
              {error || "The requested payment record could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: PaymentDetailStatus) => {
    switch (status) {
      case "DETAILS_FILLED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Draft (Filled)
          </span>
        );
      case "SEND_TO_DO":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#136FB6] border border-blue-200">
            Sent to DO
          </span>
        );
      case "DO_CHECKED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            DO Checked
          </span>
        );
      case "SEND_TO_EE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Sent to EE
          </span>
        );
      case "EE_CHECKED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            EE Checked
          </span>
        );
      case "SEND_FOR_RELEASE_PAYMENT":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
            Payment Released
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const createdDate = new Date(payment.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#1a2b3c]">
                  Payment Details
                </h1>
                {getStatusBadge(payment.status)}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Record ID: <span className="font-mono text-gray-600">{payment.id}</span>
              </p>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href={`/completed-workflows/audit/${payment.id}`}>
              <History size={14} className="mr-1.5 text-gray-400" />
              View Audit History
            </Link>
          </Button>
        </div>

        {/* Single-Column Sequential Details Card */}
        <Card className="border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6 space-y-6">
            {/* GROUP 1: Contractor & Work Order */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <UserIcon size={16} className="text-[#136FB6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Contractor & Work Order Information
                </h2>
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

            {/* GROUP 2: Bank Information */}
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

              {/* Field: Branch */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  Branch Name
                </label>
                <div className="text-sm font-medium text-gray-800 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                  {payment.branch}
                </div>
              </div>
            </div>

            {/* GROUP 3: Voucher & Payment Details */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Receipt size={16} className="text-[#136FB6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Voucher & Payment Amount
                </h2>
              </div>

              {/* Field: Payment Amount */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  Total Payment Amount (₹)
                </label>
                <div className="text-2xl font-extrabold text-[#136FB6] bg-blue-50/60 p-4 rounded-lg border border-blue-200">
                  ₹{Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
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

              {/* Field: Cheque Number */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 block">
                  Cheque / Reference Number
                </label>
                <div className="text-sm font-mono text-gray-700 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                  {payment.cheque_number || "Not provided"}
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
                        {payment.voucherFile?.file_name || "Voucher PDF Document"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No PDF attached</span>
                  )}

                  {payment.voucher_file_url && (
                    <VoucherFileViewerModal
                      fileUrl={payment.voucher_file_url}
                      voucherNumber={payment.voucher_number}
                    >
                      <Button type="button" size="sm" variant="outline" className="text-xs text-[#136FB6] h-8">
                        <FileText size={13} className="mr-1.5" />
                        View Attached PDF
                      </Button>
                    </VoucherFileViewerModal>
                  )}
                </div>
              </div>
            </div>

            {/* GROUP 4: Record Metadata */}
            <div className="space-y-3 pt-4 border-t border-gray-200 text-xs text-gray-500">
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span>Created Date & Time</span>
                <span className="font-medium text-gray-700">{createdDate}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Created By Role</span>
                <Badge variant="outline" className="text-[11px] font-bold text-gray-600">
                  {payment.created_by_role}
                </Badge>
              </div>
            </div>

            {/* Back Action */}
            <div className="pt-4 border-t border-gray-200">
              <Button asChild variant="outline" className="w-full h-11">
                <Link href="/completed-workflows">
                  Return to Payments
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
