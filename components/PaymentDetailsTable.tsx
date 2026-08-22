"use client";

import {
  deletePaymentAction,
  doCheckPaymentAction,
  eeCheckPaymentAction,
  sendToDOAction,
  sendToEEAction,
} from "@/actions/paymentAction";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { PaymentDetail, PaymentDetailStatus } from "@/types/payment";
import { UserRole } from "@/types/usertypes";
import {
  Building2,
  CheckCircle,
  CheckCircle2,
  Edit3,
  FileCheck,
  History,
  Loader2,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import EditPaymentDialog from "./EditPaymentDialog";
import TwoCheckboxVerificationModal from "./TwoCheckboxVerificationModal";
import VoucherFileViewerModal from "./VoucherFileViewerModal";

interface PaymentDetailsTableProps {
  initialPayments: PaymentDetail[];
  currentPage?: number;
  totalPages?: number;
  totalPayments?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export default function PaymentDetailsTable({
  initialPayments,
  currentPage = 1,
  totalPages = 1,
  totalPayments = 0,
  limit = 20,
  search = "",
  role = "",
}: PaymentDetailsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [payments, setPayments] = useState<PaymentDetail[]>(initialPayments);
  const [searchInput, setSearchInput] = useState(search);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Dialog & Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null);

  // Verification Modal State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationType, setVerificationType] = useState<
    "SEND_TO_DO" | "DO_CHECK" | "EE_CHECK" | null
  >(null);

  const isStaff =
    role === UserRole.DOStaff || role === "DO_STAFF" || role === "STAFF";
  const isDO = role === UserRole.DistrictOfficer || role === "DO";
  const isEE = role === UserRole.ExecutiveEngineer || role === "EE";
  const isHO = role === UserRole.HeadOfficer || role === "HO";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/completed-workflows?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/completed-workflows?${params.toString()}`);
  };

  const openVerificationModal = (
    payment: PaymentDetail,
    type: "SEND_TO_DO" | "DO_CHECK" | "EE_CHECK",
  ) => {
    setSelectedPayment(payment);
    setVerificationType(type);
    setIsVerificationModalOpen(true);
  };

  const handleVerificationConfirm = async () => {
    if (!selectedPayment || !verificationType) return;
    setLoadingId(selectedPayment.id);

    try {
      if (verificationType === "SEND_TO_DO") {
        const res = await sendToDOAction(selectedPayment.id);
        if (res.success) {
          toast({
            title: "Sent to DO",
            description: "Payment record verified and submitted to District Officer.",
          });
          setIsVerificationModalOpen(false);
          router.refresh();
        } else {
          toast({ title: "Error", description: res.error, variant: "destructive" });
        }
      } else if (verificationType === "DO_CHECK") {
        const res = await doCheckPaymentAction(selectedPayment.id);
        if (res.success) {
          toast({
            title: "Details Verified",
            description: "Payment details checked and verified.",
          });
          setIsVerificationModalOpen(false);
          router.refresh();
        } else {
          toast({ title: "Error", description: res.error, variant: "destructive" });
        }
      } else if (verificationType === "EE_CHECK") {
        const res = await eeCheckPaymentAction(selectedPayment.id);
        if (res.success) {
          toast({
            title: "EE Verified",
            description: "Payment details verified by Executive Engineer.",
          });
          setIsVerificationModalOpen(false);
          router.refresh();
        } else {
          toast({ title: "Error", description: res.error, variant: "destructive" });
        }
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleSendToEE = async (paymentId: string) => {
    setLoadingId(paymentId);
    try {
      const res = await sendToEEAction(paymentId);
      if (res.success) {
        toast({
          title: "Sent to Executive Engineer",
          description: "Payment record successfully forwarded to Executive Engineer.",
        });
        router.refresh();
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this payment record? This action will be recorded in the audit trail.",
      )
    ) {
      return;
    }

    setLoadingId(paymentId);
    try {
      const res = await deletePaymentAction(paymentId);
      if (res.success) {
        toast({
          title: "Record Deleted",
          description: "Payment record soft-deleted successfully.",
        });
        router.refresh();
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: PaymentDetailStatus) => {
    switch (status) {
      case "DETAILS_FILLED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Draft (Filled)
          </span>
        );
      case "SEND_TO_DO":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#136FB6] border border-blue-200">
            Sent to DO
          </span>
        );
      case "DO_CHECKED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            DO Checked
          </span>
        );
      case "SEND_TO_EE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Sent to EE
          </span>
        );
      case "EE_CHECKED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            EE Checked
          </span>
        );
      case "SEND_FOR_RELEASE_PAYMENT":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            Payment Released
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Search contractor, voucher, account..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-10 bg-white"
              />
            </div>
            <Button type="submit" variant="secondary" className="h-10">
              Search
            </Button>
          </form>

          {(isStaff || isDO) && (
            <Button
              asChild
              className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white flex items-center gap-2"
            >
              <Link href="/completed-workflows/create">
                <Plus size={16} />
                Create Payment Record
              </Link>
            </Button>
          )}
        </div>

        {/* Payments Table */}
        <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
          <CardContent className="p-0">
            {initialPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#DFEEF9]/60 flex items-center justify-center text-[#136FB6] mb-3">
                  <Building2 size={28} />
                </div>
                <h3 className="text-[16px] font-bold text-[#1a2b3c]">
                  No Payment Records Found
                </h3>
                <p className="text-[13px] text-gray-500 max-w-sm mt-1">
                  {(isStaff || isDO)
                    ? "Click 'Create Payment Record' above to submit contractor payment details."
                    : "No payment records are currently pending for your review."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Contractor (as per Bank)
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Work Order
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Bank & Account
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Voucher / Cheque
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Amount
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Status
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialPayments.map((p) => {
                    const isRowLoading = loadingId === p.id;

                    return (
                      <TableRow
                        key={p.id}
                        className="border-gray-100 hover:bg-gray-50/70"
                      >
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="text-[13px] font-bold text-[#1a2b3c] block">
                              {p.contractor_name}
                            </span>
                            <span className="text-[11px] text-gray-500 font-mono">
                              {p.contractor_code}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-[13px] font-medium text-[#1a2b3c] font-mono">
                            {p.work_order_code}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="text-[13px] font-medium text-[#1a2b3c] block">
                              {p.bank_name}
                            </span>
                            <span className="text-[11px] text-gray-500 font-mono block">
                              A/C: {p.bank_account_number}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              IFSC: {p.ifsc_code} | {p.branch}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[12px] font-semibold text-[#1a2b3c] font-mono">
                                VCH: {p.voucher_number}
                              </span>
                              {p.voucher_file_url && (
                                <VoucherFileViewerModal
                                  fileUrl={p.voucher_file_url}
                                  voucherNumber={p.voucher_number}
                                >
                                  <button
                                    type="button"
                                    className="inline-flex items-center text-[10px] font-bold text-[#136FB6] bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors"
                                  >
                                    PDF
                                  </button>
                                </VoucherFileViewerModal>
                              )}
                            </div>
                            {p.cheque_number && (
                              <span className="text-[11px] text-gray-500 font-mono block">
                                CHQ: {p.cheque_number}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-[14px] font-extrabold text-[#136FB6]">
                            ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </TableCell>

                        <TableCell>{getStatusBadge(p.status)}</TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Staff Actions */}
                            {isStaff && p.status === "DETAILS_FILLED" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs font-semibold"
                                  onClick={() => {
                                    setSelectedPayment(p);
                                    setIsEditOpen(true);
                                  }}
                                  disabled={isRowLoading}
                                >
                                  <Edit3 size={13} className="mr-1" />
                                  Edit
                                </Button>

                                <Button
                                  size="sm"
                                  className="h-8 text-xs font-semibold bg-[#136FB6] hover:bg-[#0d5a8f] text-white"
                                  onClick={() => openVerificationModal(p, "SEND_TO_DO")}
                                  disabled={isRowLoading}
                                >
                                  <Send size={13} className="mr-1" />
                                  Send to DO
                                </Button>
                              </>
                            )}

                            {/* DO Actions */}
                            {isDO && p.status === "SEND_TO_DO" && (
                              <Button
                                size="sm"
                                className="h-8 text-xs font-semibold bg-[#136FB6] hover:bg-[#0d5a8f] text-white"
                                onClick={() => openVerificationModal(p, "DO_CHECK")}
                                disabled={isRowLoading}
                              >
                                <CheckCircle size={13} className="mr-1" />
                                Check Details
                              </Button>
                            )}

                            {isDO && p.status === "DO_CHECKED" && (
                              <Button
                                size="sm"
                                className="h-8 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => handleSendToEE(p.id)}
                                disabled={isRowLoading}
                              >
                                {isRowLoading ? (
                                  <Loader2 size={13} className="animate-spin mr-1" />
                                ) : (
                                  <Send size={13} className="mr-1" />
                                )}
                                Send to EE
                              </Button>
                            )}

                            {/* EE Actions */}
                            {isEE && p.status === "SEND_TO_EE" && (
                              <Button
                                size="sm"
                                className="h-8 text-xs font-semibold bg-[#136FB6] hover:bg-[#0d5a8f] text-white"
                                onClick={() => openVerificationModal(p, "EE_CHECK")}
                                disabled={isRowLoading}
                              >
                                <CheckCircle size={13} className="mr-1" />
                                Check Details
                              </Button>
                            )}

                            {isEE && p.status === "EE_CHECKED" && (
                              <Button
                                size="sm"
                                className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => {
                                  toast({
                                    title: "Payment Release",
                                    description: "Payment release processing triggered.",
                                  });
                                }}
                                disabled={isRowLoading}
                              >
                                <FileCheck size={13} className="mr-1" />
                                Release Payment
                              </Button>
                            )}

                            {/* Audit Trail Page Link */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs text-gray-600 hover:text-[#1a2b3c]"
                              asChild
                              title="View audit trail history"
                            >
                              <Link href={`/completed-workflows/audit/${p.id}`}>
                                <History size={14} className="mr-1 text-gray-400" />
                                Audit Log
                              </Link>
                            </Button>

                            {/* Soft Delete Action for DO / EE / HO */}
                            {(isDO || isEE || isHO) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleDelete(p.id)}
                                disabled={isRowLoading}
                                title="Delete payment record"
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-2">
            <p className="text-xs text-gray-500">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalPayments} records)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <EditPaymentDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        payment={selectedPayment}
      />

      <TwoCheckboxVerificationModal
        isOpen={isVerificationModalOpen}
        onOpenChange={setIsVerificationModalOpen}
        payment={selectedPayment}
        title={
          verificationType === "SEND_TO_DO"
            ? "Verify & Send to District Officer"
            : verificationType === "DO_CHECK"
            ? "District Officer Verification"
            : "Executive Engineer Verification"
        }
        description="Please cross-check and complete the 2-point voucher verification before proceeding."
        actionButtonLabel={
          verificationType === "SEND_TO_DO"
            ? "Confirm & Send to DO"
            : "Confirm Verification"
        }
        onConfirm={handleVerificationConfirm}
        isLoading={loadingId === selectedPayment?.id}
      />
    </>
  );
}
