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
import { PaymentDetail, PaymentDetailAudit } from "@/types/payment";
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
  Mail,
  Receipt,
  Send,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { redirect } from "next/navigation";

// Set to true to enable SD Payment workflow inside JJM Admin
const ENABLE_SD_PAYMENT_IN_JJM_ADMIN = false;

export interface PaymentAuditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentAuditPage({
  params,
}: PaymentAuditPageProps) {
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
    console.error("Failed to load payment audit record:", err);
    error = err.response?.data?.message || err.message || "Record not found";
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <BackButton />
          <div className="rounded-xl bg-red-50 p-6 text-red-700 border border-red-100">
            <h2 className="text-lg font-bold">Payment Record Not Found</h2>
            <p className="text-sm mt-1">
              {error || "The requested payment detail record could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DETAILS_FILLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Details Filled (Draft)
          </span>
        );
      case "SEND_TO_DO":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Send size={11} />
            Sent to DAO
          </span>
        );
      case "DO_CHECKED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle size={11} />
            DAO Checked & Verified
          </span>
        );
      case "SEND_TO_EE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Send size={11} />
            Sent to EE
          </span>
        );
      case "EE_CHECKED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <CheckCircle2 size={11} />
            EE Checked & Ready
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Paid & Released
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATED":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-none font-semibold text-[11px]">
            CREATED
          </Badge>
        );
      case "EDITED":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-none font-semibold text-[11px]">
            EDITED
          </Badge>
        );
      case "SEND_TO_DO":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-none font-semibold text-[11px]">
            SENT TO DAO
          </Badge>
        );
      case "DO_CHECKED":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 border-none font-semibold text-[11px]">
            DAO VERIFIED
          </Badge>
        );
      case "SEND_TO_EE":
        return (
          <Badge className="bg-cyan-100 text-cyan-800 border-none font-semibold text-[11px]">
            SENT TO EE
          </Badge>
        );
      case "EE_CHECKED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-none font-semibold text-[11px]">
            EE VERIFIED
          </Badge>
        );
      case "RELEASED_PAYMENT":
        return (
          <Badge className="bg-emerald-600 text-white border-none font-bold text-[11px]">
            PAYMENT RELEASED (PAID)
          </Badge>
        );
      case "SOFT_DELETED":
        return (
          <Badge className="bg-red-100 text-red-800 border-none font-semibold text-[11px]">
            DELETED
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[11px]">
            {action}
          </Badge>
        );
    }
  };

  const audits = payment.audits || [];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[26px] font-bold text-[#1a2b3c]">
                  Payment Audit Log
                </h1>
                {getStatusBadge(payment.status)}
              </div>
              <p className="text-[13px] text-gray-500 font-medium">
                Record ID: <span className="font-mono text-gray-600">{payment.id}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Contractor & Agreement Information */}
          <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon size={14} className="text-[#136FB6]" />
                Contractor & Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Contractor Name</span>
                <span className="text-sm font-bold text-[#1a2b3c]">{payment.contractor_name}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 block font-medium">Contractor ID</span>
                <span className="font-mono text-sm font-semibold text-gray-800">{payment.contractor_id}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 block font-medium">Agreement Number</span>
                <span className="font-mono text-sm font-semibold text-gray-800">{payment.agreement_number}</span>
              </div>
              {payment.year && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400 block font-medium">Year</span>
                  <span className="text-sm font-medium text-gray-800">{payment.year}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Beneficiary & Bank Account */}
          <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={14} className="text-[#136FB6]" />
                Beneficiary & Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Beneficiary Name</span>
                <span className="text-sm font-bold text-[#1a2b3c] truncate block">{payment.beneficiary_name}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 block font-medium">Bank & Account</span>
                <span className="text-sm font-medium text-gray-800 block">{payment.bank_name}</span>
                <span className="font-mono text-xs text-gray-500 font-bold block">{payment.bank_account_number}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 block font-medium">Amount</span>
                <span className="text-base font-extrabold text-emerald-700">
                  ₹{Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Voucher & Documents */}
          <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt size={14} className="text-[#136FB6]" />
                Voucher & Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Voucher Number</span>
                <span className="font-mono text-sm font-bold text-gray-800">{payment.voucher_number}</span>
              </div>

              {/* Primary Voucher PDF */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Voucher PDF</span>
                {payment.voucher_file_url ? (
                  <VoucherFileViewerModal
                    fileUrl={payment.voucher_file_url}
                    title="Voucher Document Preview"
                  >
                    <Button type="button" size="sm" variant="ghost" className="text-xs text-[#136FB6] h-7 px-2">
                      <ExternalLink size={12} className="mr-1" />
                      View
                    </Button>
                  </VoucherFileViewerModal>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </div>

              {/* Additional Document */}
              {payment.additional_pdf_url && (
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-purple-700 font-medium">Extra PDF</span>
                  <VoucherFileViewerModal
                    fileUrl={payment.additional_pdf_url}
                    title="Additional Document Preview"
                  >
                    <Button type="button" size="sm" variant="ghost" className="text-xs text-purple-700 h-7 px-2">
                      <ExternalLink size={12} className="mr-1" />
                      View
                    </Button>
                  </VoucherFileViewerModal>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline of Actions */}
        <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-bold text-[#1a2b3c] flex items-center gap-2">
              <History size={18} className="text-[#136FB6]" />
              Audit Trail & Verification Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {audits.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No audit records found for this payment.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {audits.map((audit: PaymentDetailAudit, index: number) => {
                  const dateFormatted = new Date(audit.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <div key={audit.id || index} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 border-white bg-[#136FB6] shadow-sm flex items-center justify-center" />

                      <div className="bg-gray-50/50 hover:bg-gray-50/80 p-4 rounded-xl border border-gray-100 transition-colors space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getActionBadge(audit.action)}
                            <span className="text-xs font-bold text-[#1a2b3c]">
                              {audit.performed_by_name}
                            </span>
                            <Badge variant="outline" className="text-[10px] py-0 font-medium">
                              {audit.performed_by_role}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {dateFormatted}
                          </span>
                        </div>

                        {audit.description && (
                          <p className="text-xs text-gray-600 leading-relaxed font-normal">
                            {audit.description}
                          </p>
                        )}

                        {(audit.previous_status || audit.new_status) && (
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-500 font-mono">
                            <span>Status:</span>
                            <span className="font-semibold text-gray-700">
                              {audit.previous_status || "None"}
                            </span>
                            <span>&rarr;</span>
                            <span className="font-semibold text-[#136FB6]">
                              {audit.new_status || "None"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
