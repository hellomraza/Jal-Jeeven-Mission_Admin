"use client";

import { deletePaymentAction, sendToEEAction } from "@/actions/paymentAction";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { PaymentDetail, PaymentDetailStatus } from "@/types/payment";
import { UserRole } from "@/types/usertypes";
import {
  Building2,
  CheckCircle,
  Edit3,
  Eye,
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
import DeletePaymentConfirmModal from "./DeletePaymentConfirmModal";
import EditPaymentDialog from "./EditPaymentDialog";
import VoucherFileViewerModal from "./VoucherFileViewerModal";

interface PaymentDetailsTableProps {
  initialPayments: PaymentDetail[];
  currentPage?: number;
  totalPages?: number;
  totalPayments?: number;
  limit?: number;
  search?: string;
  status?: string;
  districtId?: string;
  districts?: { id: string; name: string }[];
  role?: string;
}

export default function PaymentDetailsTable({
  initialPayments,
  currentPage = 1,
  totalPages = 1,
  totalPayments = 0,
  limit = 20,
  search = "",
  status = "",
  districtId = "",
  districts = [],
  role = "",
}: PaymentDetailsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [searchInput, setSearchInput] = useState(search);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Dialog & Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentDetail | null>(
    null,
  );

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

  const handleStatusChange = (newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus && newStatus !== "ALL") {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`/completed-workflows?${params.toString()}`);
  };

  const handleDistrictChange = (newDistrict: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newDistrict && newDistrict !== "ALL") {
      params.set("district_id", newDistrict);
    } else {
      params.delete("district_id");
    }
    params.set("page", "1");
    router.push(`/completed-workflows?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    router.push("/completed-workflows");
  };

  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `/completed-workflows?${params.toString()}`;
  };

  const handleSendToEE = async (paymentId: string) => {
    setLoadingId(paymentId);
    try {
      const res = await sendToEEAction(paymentId);
      if (res.success) {
        toast({
          title: "Sent to Executive Engineer",
          description:
            "Payment record successfully forwarded to Executive Engineer.",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: res.error,
          variant: "destructive",
        });
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
            Sent to DAO
          </span>
        );
      case "DO_CHECKED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            DAO Checked
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

  const hasActiveFilters = Boolean(search || status || districtId);
  const startRecord =
    totalPayments === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalPayments);

  // Generate pagination page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - delta - 1 || i === currentPage + delta + 1) &&
        !pages.includes("...")
      ) {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Filters Toolbar */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 max-w-md w-full"
            >
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

            {/* Filter Dropdowns & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter for Everyone */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Status:
                </label>
                <Select
                  value={status || "ALL"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="h-10 min-w-[170px] bg-white border-gray-200 text-xs font-medium text-gray-700">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="DETAILS_FILLED">Draft (Filled)</SelectItem>
                    <SelectItem value="SEND_TO_DO">Sent to DAO</SelectItem>
                    <SelectItem value="DO_CHECKED">DAO Checked</SelectItem>
                    <SelectItem value="SEND_TO_EE">Sent to EE</SelectItem>
                    <SelectItem value="EE_CHECKED">EE Checked</SelectItem>
                    <SelectItem value="SEND_FOR_RELEASE_PAYMENT">
                      Payment Released
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* District Filter for HO Only */}
              {isHO && districts.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                    District:
                  </label>
                  <Select
                    value={districtId || "ALL"}
                    onValueChange={handleDistrictChange}
                  >
                    <SelectTrigger className="h-10 min-w-[170px] max-w-[220px] bg-white border-gray-200 text-xs font-medium text-gray-700">
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Districts</SelectItem>
                      {districts.map((d: any) => {
                        const val = String(d.id || d.districtid || d.district_code);
                        const label = d.name || d.districtname || d.district_name || val;
                        return (
                          <SelectItem key={val} value={val}>
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-10 text-xs text-gray-500 hover:text-gray-800"
                >
                  Clear Filters
                </Button>
              )}

              {/* Create Payment Record (Staff & DO Only) */}
              {(isStaff || isDO) && (
                <Button
                  asChild
                  className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white flex items-center gap-2 h-10 ml-auto"
                >
                  <Link href="/completed-workflows/create">
                    <Plus size={16} />
                    Create Payment Record
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <Card className="border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {initialPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-[#DFEEF9]/70 flex items-center justify-center text-[#136FB6] mb-4">
                  <Building2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-[#1a2b3c]">
                  No Payment Records Found
                </h3>
                <p className="text-sm text-gray-500 max-w-md mt-1.5">
                  {hasActiveFilters
                    ? "No records match the current filter criteria. Try clearing your filters."
                    : isStaff || isDO
                      ? "Click 'Create Payment Record' above to submit contractor payment details."
                      : "No payment records are currently found."}
                </p>
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="mt-5 text-xs font-semibold"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[1200px] w-full text-left">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50/90 hover:bg-gray-50/90 h-10">
                      <TableHead className="px-3.5 py-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap min-w-[180px]">
                        Contractor Name / ID
                      </TableHead>
                      <TableHead className="px-3.5 py-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap min-w-[150px]">
                        Agreement No.
                      </TableHead>
                      <TableHead className="px-3.5 py-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap min-w-[80px]">
                        Year
                      </TableHead>
                      <TableHead className="px-3.5 py-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap min-w-[130px]">
                        Amount (₹)
                      </TableHead>
                      <TableHead className="px-3.5 py-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap min-w-[130px]">
                        Status
                      </TableHead>
                      <TableHead className="px-3.5 py-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap min-w-[160px]">
                        Main Action
                      </TableHead>
                      <TableHead className="px-3.5 py-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap min-w-[220px]">
                        Beneficiary & Bank
                      </TableHead>
                      <TableHead className="px-3.5 py-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap min-w-[160px]">
                        Voucher & Docs
                      </TableHead>
                      <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider text-right whitespace-nowrap min-w-[140px]">
                        More
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initialPayments.map((p) => {
                      const isRowLoading = loadingId === p.id;
                      const contractorId =
                        p.contractor_id || p.contractor_code || "—";
                      const agreementNo =
                        p.agreement_number || p.work_order_code || "—";
                      const isPaid = p.status === "PAID";

                      return (
                        <TableRow
                          key={p.id}
                          className="border-b border-gray-100 hover:bg-sky-50/25 transition-colors"
                        >
                          {/* 1. Contractor Name & ID */}
                          <TableCell className="px-3.5 py-2.5 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span className="text-[13px] font-bold text-[#1a2b3c] block">
                                {p.contractor_name}
                              </span>
                              <span className="text-[11px] text-gray-500 font-mono block">
                                ID: {contractorId}
                              </span>
                            </div>
                          </TableCell>

                          {/* 2. Agreement Number */}
                          <TableCell className="px-3.5 py-2.5 whitespace-nowrap">
                            <span className="text-[13px] font-semibold text-gray-900 font-mono">
                              {agreementNo}
                            </span>
                          </TableCell>

                          {/* 3. Year */}
                          <TableCell className="px-3.5 py-2.5 whitespace-nowrap">
                            <span className="text-xs font-semibold text-gray-800">
                              {p.year || "—"}
                            </span>
                          </TableCell>

                          {/* 4. Amount */}
                          <TableCell className="px-3.5 py-2.5 whitespace-nowrap">
                            <span className="text-sm font-extrabold text-emerald-700 font-mono">
                              ₹
                              {Number(p.amount).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </TableCell>

                          {/* 5. Status */}
                          <TableCell className="px-3.5 py-2.5 whitespace-nowrap">
                            {getStatusBadge(p.status)}
                          </TableCell>

                          {/* 6. Main Action */}
                          <TableCell className="px-3.5 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {/* Staff / DO: Send to DAO */}
                              {isStaff && p.status === "DETAILS_FILLED" && (
                                <Button
                                  size="sm"
                                  className="h-7.5 text-xs font-bold bg-[#136FB6] hover:bg-[#0d5a8f] text-white shadow-sm px-2.5"
                                  asChild
                                >
                                  <Link
                                    href={`/completed-workflows/check/${p.id}`}
                                  >
                                    <Send size={12} className="mr-1" />
                                    Send to DAO
                                  </Link>
                                </Button>
                              )}

                              {/* DO: Check Details */}
                              {isDO && p.status === "SEND_TO_DO" && (
                                <Button
                                  size="sm"
                                  className="h-7.5 text-xs font-bold bg-[#136FB6] hover:bg-[#0d5a8f] text-white shadow-sm px-2.5"
                                  asChild
                                >
                                  <Link
                                    href={`/completed-workflows/check/${p.id}`}
                                  >
                                    <CheckCircle size={12} className="mr-1" />
                                    Check Details
                                  </Link>
                                </Button>
                              )}

                              {/* DO: Send to EE */}
                              {isDO && p.status === "DO_CHECKED" && (
                                <Button
                                  size="sm"
                                  className="h-7.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm px-2.5"
                                  onClick={() => handleSendToEE(p.id)}
                                  disabled={isRowLoading}
                                >
                                  {isRowLoading ? (
                                    <Loader2
                                      size={12}
                                      className="animate-spin mr-1"
                                    />
                                  ) : (
                                    <Send size={12} className="mr-1" />
                                  )}
                                  Send to EE
                                </Button>
                              )}

                              {/* EE: Check Details */}
                              {isEE && p.status === "SEND_TO_EE" && (
                                <Button
                                  size="sm"
                                  className="h-7.5 text-xs font-bold bg-[#136FB6] hover:bg-[#0d5a8f] text-white shadow-sm px-2.5"
                                  asChild
                                >
                                  <Link
                                    href={`/completed-workflows/check/${p.id}`}
                                  >
                                    <CheckCircle size={12} className="mr-1" />
                                    Check Details
                                  </Link>
                                </Button>
                              )}

                              {/* EE: Release Payment */}
                              {isEE && p.status === "EE_CHECKED" && (
                                <Button
                                  size="sm"
                                  className="h-7.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-2.5"
                                  disabled={isRowLoading}
                                  asChild
                                >
                                  <Link
                                    href={`/completed-workflows/release/${p.id}`}
                                  >
                                    <FileCheck size={12} className="mr-1" />
                                    Release Payment
                                  </Link>
                                </Button>
                              )}

                              {/* Paid Status indicator */}
                              {isPaid && (
                                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle size={13} />
                                  Completed
                                </span>
                              )}

                              {/* Staff Edit */}
                              {isStaff && p.status === "DETAILS_FILLED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 px-2"
                                  onClick={() => {
                                    setSelectedPayment(p);
                                    setIsEditOpen(true);
                                  }}
                                  disabled={isRowLoading}
                                >
                                  <Edit3 size={12} className="mr-1" />
                                  Edit
                                </Button>
                              )}
                            </div>
                          </TableCell>

                          {/* 7. Beneficiary & Bank */}
                          <TableCell className="px-3.5 py-2.5 whitespace-nowrap">
                            <div className="space-y-0.5 max-w-[220px]">
                              <span
                                className="text-xs font-semibold text-[#1a2b3c] block truncate"
                                title={p.beneficiary_name || p.contractor_name}
                              >
                                {p.beneficiary_name || p.contractor_name}
                              </span>
                              <span className="text-[11px] text-gray-600 font-mono block truncate">
                                {p.bank_name} • {p.bank_account_number}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono block">
                                IFSC: {p.ifsc_code} | {p.branch}
                              </span>
                            </div>
                          </TableCell>

                          {/* 8. Voucher & Docs */}
                          <TableCell className="px-3.5 py-2.5 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className="text-xs font-mono font-bold text-[#1a2b3c] block">
                                {p.voucher_number}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {p.voucher_file_url && (
                                  <VoucherFileViewerModal
                                    fileUrl={p.voucher_file_url}
                                    voucherNumber={p.voucher_number}
                                  >
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-[#136FB6] border border-blue-200 hover:bg-blue-100 transition-colors"
                                    >
                                      Voucher
                                    </button>
                                  </VoucherFileViewerModal>
                                )}
                                {p.additional_pdf_url && (
                                  <VoucherFileViewerModal
                                    fileUrl={p.additional_pdf_url}
                                    title="Additional Document"
                                  >
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                                    >
                                      Doc
                                    </button>
                                  </VoucherFileViewerModal>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* 9. More (View, Audit, Delete) */}
                          <TableCell className="px-4 py-2.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {/* View Details Page Link */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-1.5 text-xs text-gray-600 hover:text-[#1a2b3c]"
                                asChild
                                title="View payment details"
                              >
                                <Link
                                  href={`/completed-workflows/details/${p.id}`}
                                >
                                  <Eye size={13} className="mr-0.5 text-gray-400" />
                                  View
                                </Link>
                              </Button>

                              {/* Audit Trail Page Link */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-1.5 text-xs text-gray-600 hover:text-[#1a2b3c]"
                                asChild
                                title="View audit trail history"
                              >
                                <Link
                                  href={`/completed-workflows/audit/${p.id}`}
                                >
                                  <History
                                    size={13}
                                    className="mr-0.5 text-gray-400"
                                  />
                                  Audit
                                </Link>
                              </Button>

                              {/* Delete Action */}
                              {!isPaid && (isDO || isEE) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                                  onClick={() => {
                                    setPaymentToDelete(p);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  title="Delete payment record"
                                >
                                  <Trash2 size={12} className="mr-0.5" />
                                  Delete
                                </Button>
                              )}

                              {/* Paid Lock indicator */}
                              {isPaid && (
                                <span
                                  className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100"
                                  title="Paid records are locked against deletion"
                                >
                                  <Lock size={10} className="text-gray-400" />
                                  Locked
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.02)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] font-medium text-gray-600">
              Showing {startRecord} to {endRecord} of {totalPayments} record
              {totalPayments === 1 ? "" : "s"}
            </p>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Previous Button */}
              {currentPage <= 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  disabled
                >
                  Previous
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  asChild
                >
                  <Link href={getPageUrl(currentPage - 1)}>Previous</Link>
                </Button>
              )}

              {/* Page Numbers */}
              {getPageNumbers().map((pageItem, index) => {
                if (pageItem === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-xs text-gray-400"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = Number(pageItem);
                const isActive = pageNum === currentPage;

                return isActive ? (
                  <Button
                    key={pageNum}
                    type="button"
                    size="sm"
                    className="h-8 w-8 p-0 text-xs bg-[#136FB6] text-white hover:bg-[#0d5a8f]"
                  >
                    {pageNum}
                  </Button>
                ) : (
                  <Button
                    key={pageNum}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-xs text-gray-700 hover:bg-gray-50"
                    asChild
                  >
                    <Link href={getPageUrl(pageNum)}>{pageNum}</Link>
                  </Button>
                );
              })}

              {/* Next Button */}
              {currentPage >= totalPages ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  disabled
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  asChild
                >
                  <Link href={getPageUrl(currentPage + 1)}>Next</Link>
                </Button>
              )}
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

      <DeletePaymentConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        payment={paymentToDelete}
      />
    </>
  );
}
