import BackButton from "@/components/BackButton";
import VoucherFileViewerModal from "@/components/VoucherFileViewerModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createServerApiClient } from "@/lib/server-api-client";
import { PaymentDetail, PaymentDetailAudit } from "@/types/payment";
import {
  Building2,
  Calendar,
  CheckCircle,
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
import { notFound } from "next/navigation";

export interface PaymentAuditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentAuditPage({
  params,
}: PaymentAuditPageProps) {
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
            <p className="text-sm mt-1">{error || "The requested payment detail record could not be loaded."}</p>
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileCheck size={11} />
            EE Checked & Ready
          </span>
        );
      case "SEND_FOR_RELEASE_PAYMENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle size={11} />
            Payment Released
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
          {/* Card 1: Contractor & Work Order Information */}
          <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon size={14} className="text-[#136FB6]" />
                Contractor & Work Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Contractor Code</span>
                <span className="font-mono text-sm font-semibold text-gray-800">{payment.contractor_code}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 block font-medium">Work Order Code</span>
                <span className="font-mono text-sm font-semibold text-gray-800">{payment.work_order_code}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Bank Account Information */}
          <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={14} className="text-[#136FB6]" />
                Bank Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Bank Name</span>
                <span className="font-bold text-[#1a2b3c]">{payment.bank_name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 block font-medium">Account No.</span>
                  <span className="font-mono text-xs font-semibold text-gray-700">{payment.bank_account_number}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block font-medium">IFSC & Branch</span>
                  <span className="text-xs font-semibold text-gray-700 block truncate">{payment.ifsc_code}</span>
                  <span className="text-[11px] text-gray-400 block truncate">{payment.branch}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 block font-medium">Contractor Name (Bank)</span>
                <span className="font-semibold text-xs text-[#1a2b3c]">{payment.contractor_name}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 block font-medium">Total Payment Amount</span>
                <span className="text-[16px] font-extrabold text-[#136FB6]">
                  ₹{Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Voucher & Verification Document */}
          <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt size={14} className="text-[#136FB6]" />
                Voucher & Verification Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Voucher Number</span>
                <span className="font-mono text-sm font-bold text-[#1a2b3c]">{payment.voucher_number}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 block font-medium mb-1">Voucher PDF Document</span>
                {payment.voucher_file_url ? (
                  <VoucherFileViewerModal
                    fileUrl={payment.voucher_file_url}
                    voucherNumber={payment.voucher_number}
                  >
                    <Button size="sm" variant="outline" className="h-8 text-xs text-[#136FB6] w-full flex items-center justify-center">
                      <FileText size={13} className="mr-1.5" />
                      View Attached PDF
                    </Button>
                  </VoucherFileViewerModal>
                ) : (
                  <span className="text-xs text-gray-400">Not uploaded</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Audit Trail Timeline */}
        <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-[#1a2b3c] flex items-center gap-2">
                  <History size={20} className="text-[#136FB6]" />
                  Audit History Timeline
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-1">
                  Complete immutable log of all actions, updates, verification gates, and actors.
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {audits.length} {audits.length === 1 ? "Event" : "Events"}
              </span>
            </div>
          </CardHeader>

          <CardContent>
            {audits.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No audit events recorded yet for this payment.
              </div>
            ) : (
              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                {audits.map((audit: PaymentDetailAudit, index: number) => {
                  const date = new Date(audit.created_at);
                  const formattedDate = date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const formattedTime = date.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <div key={audit.id || index} className="relative group">
                      {/* Timeline Node */}
                      <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#136FB6] shadow-[0_0_0_3px_rgba(19,111,182,0.15)] group-hover:scale-110 transition-transform" />

                      <div className="rounded-2xl p-5 border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-all space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getActionBadge(audit.action)}
                            {audit.previous_status && audit.new_status && audit.previous_status !== audit.new_status && (
                              <span className="text-[11px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                                {audit.previous_status} → {audit.new_status}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                            <Clock size={12} />
                            {formattedDate}, {formattedTime}
                          </span>
                        </div>

                        {audit.description && (
                          <p className="text-sm font-medium text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                            {audit.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                          <div className="flex items-center gap-1.5">
                            <UserIcon size={13} className="text-gray-400" />
                            <span className="font-semibold text-gray-700">
                              {audit.performed_by_name || "System User"}
                            </span>
                            <Badge variant="outline" className="text-[10px] py-0 h-4 uppercase font-bold text-gray-500">
                              {audit.performed_by_role}
                            </Badge>
                          </div>
                          {audit.performed_by_email && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <Mail size={12} />
                              <span>{audit.performed_by_email}</span>
                            </div>
                          )}
                        </div>
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
