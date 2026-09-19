import BackButton from "@/components/BackButton";
import VoucherFileViewerModal from "@/components/VoucherFileViewerModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { createServerApiClient } from "@/lib/server-api-client";
import { PaymentDetail, PaymentDetailStatus } from "@/types/payment";
import {
  Building2,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  History,
  Lock,
  Receipt,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Set to true to enable SD Payment workflow inside JJM Admin
const ENABLE_SD_PAYMENT_IN_JJM_ADMIN = false;

export interface PaymentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentDetailsPage({
  params,
}: PaymentDetailsPageProps) {
  if (!ENABLE_SD_PAYMENT_IN_JJM_ADMIN) {
    redirect("/dashboard");
  }

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock size={11} /> Details Filled
          </span>
        );
      case "SEND_TO_DO":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={11} /> Sent to DAO
          </span>
        );
      case "DO_CHECKED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle size={11} /> DAO Checked
          </span>
        );
      case "SEND_TO_EE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock size={11} /> Sent to EE
          </span>
        );
      case "EE_CHECKED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <CheckCircle2 size={11} /> EE Checked
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle2 size={12} className="text-emerald-600" /> Paid
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

        {/* Details Card */}
        <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white overflow-hidden">
          <CardContent className="p-6 space-y-6">
            {/* GROUP 1: Contractor & Agreement Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <UserIcon size={16} className="text-[#136FB6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  1. Contractor & Agreement Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 block">
                    Contractor Name
                  </label>
                  <div className="text-sm font-bold text-[#1a2b3c] bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    {payment.contractor_name}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 block">
                    Contractor ID
                  </label>
                  <div className="text-sm font-mono font-semibold text-gray-800 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    {payment.contractor_id}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 block">
                    Agreement Number
                  </label>
                  <div className="text-sm font-mono font-semibold text-gray-800 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    {payment.agreement_number}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 block">
                    Year
                  </label>
                  <div className="text-sm font-medium text-gray-800 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    {payment.year || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* GROUP 2: Bank Account & Beneficiary Information */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Building2 size={16} className="text-[#136FB6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  2. Beneficiary & Bank Account Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 block">
                    Beneficiary Name (as per Bank Account)
                  </label>
                  <div className="text-sm font-bold text-[#1a2b3c] bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    {payment.beneficiary_name}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 block">
                    Bank Name
                  </label>
                  <div className="text-sm font-semibold text-[#1a2b3c] bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    {payment.bank_name}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 block">
                    Bank Account Number
                  </label>
                  <div className="text-sm font-mono font-bold text-[#1a2b3c] bg-amber-50/40 p-3 rounded-lg border border-amber-200/60">
                    {payment.bank_account_number}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 block">
                    IFSC Code
                  </label>
                  <div className="text-sm font-mono font-bold text-gray-800 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    {payment.ifsc_code}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 block">
                    Branch Name
                  </label>
                  <div className="text-sm font-medium text-gray-800 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    {payment.branch}
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 block">
                    Total Payment Amount (₹)
                  </label>
                  <div className="text-xl font-extrabold text-emerald-700 bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-200">
                    ₹{Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* GROUP 3: Voucher & Verification Documents */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Receipt size={16} className="text-[#136FB6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  3. Voucher & Attached Documents
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 block">
                    Voucher Number
                  </label>
                  <div className="text-sm font-mono font-bold text-[#1a2b3c] bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    {payment.voucher_number}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 block">
                    Cheque Number
                  </label>
                  <div className="text-sm font-mono text-gray-800 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    {payment.cheque_number || "—"}
                  </div>
                </div>

                {/* Primary Voucher Document */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-500 block">
                    Primary Voucher PDF
                  </label>
                  <div className="bg-gray-50/70 p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#136FB6]" />
                      <span className="text-xs font-medium text-gray-700">
                        {payment.voucherFile?.file_name || "Voucher PDF Document"}
                      </span>
                    </div>

                    {payment.voucher_file_url ? (
                      <VoucherFileViewerModal
                        fileUrl={payment.voucher_file_url}
                        title="Voucher Document Preview"
                      >
                        <Button type="button" size="sm" variant="outline" className="text-xs text-[#136FB6] h-8">
                          <ExternalLink size={13} className="mr-1" />
                          View Voucher PDF
                        </Button>
                      </VoucherFileViewerModal>
                    ) : (
                      <span className="text-xs text-gray-400">No file</span>
                    )}
                  </div>
                </div>

                {/* Additional PDF Document */}
                {payment.additional_pdf_url && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-medium text-gray-500 block">
                      Additional Document
                    </label>
                    <div className="bg-purple-50/40 p-3 rounded-lg border border-purple-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-purple-600" />
                        <span className="text-xs font-medium text-gray-700">
                          {payment.additional_file_name || "Additional Document"}
                        </span>
                      </div>

                      <VoucherFileViewerModal
                        fileUrl={payment.additional_pdf_url}
                        title="Additional Document Preview"
                      >
                        <Button type="button" size="sm" variant="outline" className="text-xs text-purple-700 border-purple-200 h-8">
                          <ExternalLink size={13} className="mr-1" />
                          View Document
                        </Button>
                      </VoucherFileViewerModal>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GROUP 4: Record Metadata */}
            <div className="space-y-2 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
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
            <div className="pt-4 border-t border-gray-100">
              <Button asChild variant="outline" className="w-full h-10 text-xs font-semibold">
                <Link href={`/completed-workflows?tab=${payment.status === 'PAID' ? 'history' : 'pay'}`}>
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
