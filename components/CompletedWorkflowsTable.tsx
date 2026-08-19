"use client";

import { uploadBankVoucherPdfAction } from "@/actions/bankDetailsAction";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
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
import apiClient from "@/lib/api-client";
import {
  Building,
  CheckCircle2,
  FileCheck,
  FileText,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import VoucherFileViewerModal from "./VoucherFileViewerModal";

interface CompletedWorkflowsTableProps {
  initialWorkItems: any[];
  currentPage?: number;
  totalPages?: number;
  totalWorkItems?: number;
  limit?: number;
  search?: string;
}

export default function CompletedWorkflowsTable({
  initialWorkItems,
  currentPage = 1,
  totalPages = 1,
  totalWorkItems = 0,
  limit = 20,
  search = "",
}: CompletedWorkflowsTableProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [workItems, setWorkItems] = useState(initialWorkItems);
  const [searchInput, setSearchInput] = useState(search);
  const [loadingApproveId, setLoadingApproveId] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkItem, setSelectedWorkItem] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    bank_account_name: "",
    bank_account_number: "",
    ifsc_code: "",
    bank_name: "",
    account_type: "Current",
    bank_address: "",
    mobile: "",
    email: "",
    voucher_number: "",
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [cloudinaryFileUrl, setCloudinaryFileUrl] = useState<string | null>(null);

  // Cloudinary upload action state
  const [uploadState, uploadAction, uploadPending] = useActionState(
    uploadBankVoucherPdfAction,
    { success: "", error: "", uploadedFile: null },
  );

  useEffect(() => {
    if (uploadState.error) {
      toast({
        title: "Cloudinary Upload Failed",
        description: uploadState.error,
        variant: "destructive",
      });
    }
  }, [toast, uploadState.error]);

  useEffect(() => {
    if (uploadState.success && uploadState.uploadedFile?.fileUrl) {
      setCloudinaryFileUrl(uploadState.uploadedFile.fileUrl);
      toast({
        title: "PDF Uploaded",
        description: "Voucher PDF has been uploaded to Cloudinary successfully.",
      });
    }
  }, [toast, uploadState.success, uploadState.uploadedFile]);

  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageNumber));
    if (limit) params.set("limit", String(limit));
    if (search) params.set("search", search);
    return `/completed-workflows?${params.toString()}`;
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("page", "1");
    if (limit) params.set("limit", String(limit));
    if (searchInput.trim()) params.set("search", searchInput.trim());
    router.push(`/completed-workflows?${params.toString()}`);
  };

  const handleOpenAddModal = (item: any) => {
    setSelectedWorkItem(item);
    setFormData({
      bank_account_name: item.contractor?.name || "",
      bank_account_number: "",
      ifsc_code: "",
      bank_name: "",
      account_type: "Current",
      bank_address: "",
      mobile: item.contractor?.mobile || "",
      email: item.contractor?.email || "",
      voucher_number: "",
    });
    setPdfFile(null);
    setCloudinaryFileUrl(null);
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewPdfUrl(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ifsc_code" ? value.toUpperCase() : value,
    }));
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF document.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "PDF file size must be 15 MB or smaller.",
          variant: "destructive",
        });
        return;
      }
      setPdfFile(file);
      setCloudinaryFileUrl(null);
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
      }
      setPreviewPdfUrl(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkItem) return;

    if (!cloudinaryFileUrl && !pdfFile) {
      toast({
        title: "Validation Error",
        description: "Please upload a voucher PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Validate IFSC code format: 4 letters, 0, then 6 alphanumeric characters
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(formData.ifsc_code)) {
      toast({
        title: "Validation Error",
        description:
          "Please enter a valid 11-digit IFSC code (e.g. ICIC0000104).",
        variant: "destructive",
      });
      return;
    }

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile.replace(/\D/g, ""))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalVoucherUrl = cloudinaryFileUrl;

      // If not yet uploaded to Cloudinary, upload now via FormData server action or direct multipart
      if (!finalVoucherUrl && pdfFile) {
        const uploadData = new FormData();
        uploadData.append("workItemId", selectedWorkItem.id);
        uploadData.append("file", pdfFile);
        const res = await uploadBankVoucherPdfAction(
          { success: "", error: "", uploadedFile: null },
          uploadData,
        );
        if (res.error || !res.uploadedFile?.fileUrl) {
          throw new Error(res.error || "Failed to upload PDF to Cloudinary");
        }
        finalVoucherUrl = res.uploadedFile.fileUrl;
        setCloudinaryFileUrl(finalVoucherUrl);
      }

      // Submit Bank Details payload to backend
      const payload: any = {
        bank_account_name: formData.bank_account_name,
        bank_account_number: formData.bank_account_number,
        ifsc_code: formData.ifsc_code,
        bank_name: formData.bank_name,
        account_type: formData.account_type,
        bank_address: formData.bank_address,
        mobile: formData.mobile,
        email: formData.email ? formData.email : undefined,
        voucher_number: formData.voucher_number,
        voucher_file_url: finalVoucherUrl,
      };

      const response = await apiClient.post(
        `/work-items/${selectedWorkItem.id}/bank-details`,
        payload,
      );

      toast({
        title: "SD Payment Details Submitted",
        description: "Bank details and voucher submitted successfully.",
      });

      // Update the local state
      setWorkItems((prevItems) =>
        prevItems.map((item) =>
          item.id === selectedWorkItem.id
            ? { ...item, bankDetails: response.data }
            : item,
        ),
      );

      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (workItemId: string) => {
    setLoadingApproveId(workItemId);
    try {
      const response = await apiClient.patch(
        `/work-items/${workItemId}/bank-details/approve`,
      );

      toast({
        title: "Approved Successfully",
        description: "Contractor SD Payment details have been approved.",
      });

      // Update the local state
      setWorkItems((prevItems) =>
        prevItems.map((item) =>
          item.id === workItemId
            ? { ...item, bankDetails: response.data }
            : item,
        ),
      );
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description:
          error.response?.data?.message || "Failed to approve details.",
        variant: "destructive",
      });
    } finally {
      setLoadingApproveId(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by work code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-10 text-[13px] bg-white border-gray-200"
            />
          </div>
          <Button
            type="submit"
            className="h-10 px-4 bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white font-bold text-[12px]"
          >
            Search
          </Button>
        </form>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white py-0">
          <CardContent className="p-0">
            {workItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-[14px] text-gray-500 font-medium">
                  No SD Payment items listed
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  There are no completed work items requiring SD Payment in your
                  assigned district yet.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Work Code
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Work Title
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Contractor
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Bank Details
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Contact Details
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Voucher Details
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Status
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workItems.map((item) => {
                    const details = item.bankDetails;
                    const status = details ? details.status : "NOT_ADDED";

                    return (
                      <TableRow
                        key={item.id}
                        className="border-gray-100 hover:bg-gray-50"
                      >
                        <TableCell className="text-[13px] font-semibold text-[#1a2b3c]">
                          {item.work_code}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600 max-w-xs truncate">
                          {item.title}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          {item.contractor ? (
                            <>
                              <div className="font-semibold text-[#1a2b3c]">
                                {item.contractor.name}
                              </div>
                              <div className="text-[11px] text-gray-400">
                                {item.contractor.code}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">Not Assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          {details ? (
                            <div className="space-y-0.5">
                              <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                                <Building size={13} className="text-[#136FB6]" />
                                <span>{details.bank_account_name}</span>
                              </div>
                              {details.bank_name && (
                                <div className="text-[11px] text-gray-600 font-medium">
                                  {details.bank_name}{" "}
                                  {details.account_type
                                    ? `(${details.account_type})`
                                    : ""}
                                </div>
                              )}
                              <div className="text-[11px] font-mono text-gray-500">
                                A/C: {details.bank_account_number}
                              </div>
                              <div className="text-[11px] font-mono text-gray-400">
                                IFSC: {details.ifsc_code}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          {details ? (
                            <div className="space-y-1">
                              {details.mobile ? (
                                <div className="text-[11px] text-gray-600 flex items-center gap-1 font-medium">
                                  <Phone size={11} className="text-gray-400" />
                                  {details.mobile}
                                </div>
                              ) : null}
                              {details.email ? (
                                <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                  <Mail size={11} className="text-gray-400" />
                                  {details.email}
                                </div>
                              ) : null}
                              {!details.mobile && !details.email && (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          {details ? (
                            <div className="space-y-1.5">
                              <div className="font-semibold text-gray-800 flex items-center gap-1">
                                <FileText size={12} className="text-[#136FB6]" />
                                <span>No: {details.voucher_number}</span>
                              </div>
                              {details.voucher_file_url ? (
                                <VoucherFileViewerModal
                                  fileUrl={details.voucher_file_url}
                                  voucherNumber={details.voucher_number}
                                  fileName={`Voucher_${details.voucher_number}.pdf`}
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2.5 bg-blue-50/60 hover:bg-blue-100 text-[#136FB6] border-blue-200 text-[11px] font-bold"
                                  >
                                    <FileCheck size={12} className="mr-1" />
                                    View PDF
                                  </Button>
                                </VoucherFileViewerModal>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  No PDF
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {status === "NOT_ADDED" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                              Not Added
                            </span>
                          )}
                          {status === "SUBMITTED" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              Submitted
                            </span>
                          )}
                          {status === "APPROVED" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              Approved
                            </span>
                          )}
                          {status === "REJECTED" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              Rejected
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {status === "NOT_ADDED" && (
                              <Button
                                type="button"
                                size="sm"
                                className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white text-[12px] font-semibold"
                                onClick={() => handleOpenAddModal(item)}
                              >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add Details
                              </Button>
                            )}
                            {status === "SUBMITTED" && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={loadingApproveId === item.id}
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[12px] font-semibold"
                                onClick={() => handleApprove(item.id)}
                              >
                                {loadingApproveId === item.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                            )}
                            {status === "APPROVED" && (
                              <span className="text-[12px] text-emerald-600 font-bold inline-flex items-center gap-1">
                                <CheckCircle2 size={14} /> Completed
                              </span>
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

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.02)] md:flex-row md:items-center md:justify-between">
            <p className="text-[12px] font-medium text-gray-600">
              Showing page {currentPage} of {totalPages} · {totalWorkItems}{" "}
              total item{totalWorkItems === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              {currentPage <= 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-4 text-[12px]"
                  disabled
                >
                  Previous
                </Button>
              ) : (
                <Link href={getPageUrl(currentPage - 1)}>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 px-4 text-[12px]"
                  >
                    Previous
                  </Button>
                </Link>
              )}

              {currentPage >= totalPages ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-4 text-[12px]"
                  disabled
                >
                  Next
                </Button>
              ) : (
                <Link href={getPageUrl(currentPage + 1)}>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 px-4 text-[12px]"
                  >
                    Next
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Bank Details Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-bold text-[#1a2b3c]">
              Add Bank & SD Payment Voucher Details
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Holder Name */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-600">
                  Account Holder Name <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="text"
                  name="bank_account_name"
                  required
                  placeholder="e.g. M/S Sunrise Enterprises"
                  value={formData.bank_account_name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                />
              </Field>

              {/* Account Number */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-600">
                  Account Number <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="text"
                  name="bank_account_number"
                  required
                  placeholder="e.g. 104801048892"
                  pattern="[0-9]+"
                  title="Please enter numbers only"
                  value={formData.bank_account_number}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                />
              </Field>

              {/* IFSC Code */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-600">
                  IFSC Code <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="text"
                  name="ifsc_code"
                  required
                  placeholder="e.g. ICIC0000104"
                  maxLength={11}
                  value={formData.ifsc_code}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="h-9 text-xs uppercase"
                />
              </Field>

              {/* Bank Name */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-600">
                  Bank Name <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="text"
                  name="bank_name"
                  required
                  placeholder="e.g. State Bank of India"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                />
              </Field>

              {/* Account Type */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-600">
                  Account Type <span className="text-red-500">*</span>
                </FieldLabel>
                <Select
                  value={formData.account_type}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, account_type: val }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Account Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Current">Current</SelectItem>
                    <SelectItem value="Saving">Saving</SelectItem>
                    <SelectItem value="Joint">Joint</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Mobile */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-600">
                  Mobile <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="tel"
                  name="mobile"
                  required
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                />
              </Field>
            </div>

            {/* Bank Address */}
            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-600">
                Bank Address <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                type="text"
                name="bank_address"
                required
                placeholder="e.g. Main Branch, Civil Lines, Patna"
                value={formData.bank_address}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="h-9 text-xs"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email (not mandatory) */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-600">
                  Email <span className="text-gray-400 font-normal">(not mandatory)</span>
                </FieldLabel>
                <Input
                  type="email"
                  name="email"
                  placeholder="e.g. contractor@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                />
              </Field>

              {/* Voucher No */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-600">
                  Voucher No. <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="text"
                  name="voucher_number"
                  required
                  placeholder="e.g. VCH-2026-001"
                  value={formData.voucher_number}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                />
              </Field>
            </div>

            {/* Upload PDF to Cloudinary */}
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 space-y-3">
              <div>
                <FieldLabel className="text-xs font-semibold text-[#1a2b3c] flex items-center gap-1.5">
                  <UploadCloud size={15} className="text-[#136FB6]" />
                  Upload Voucher PDF <span className="text-red-500">*</span>
                </FieldLabel>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Select a PDF voucher file to store in Cloudinary (Max 15MB)
                </p>
              </div>

              <Input
                type="file"
                accept="application/pdf"
                required={!cloudinaryFileUrl}
                onChange={handlePdfChange}
                disabled={isSubmitting || uploadPending}
                className="cursor-pointer text-[12px] h-10 file:bg-[#DFEEF9] file:text-[#136FB6] file:border-0 file:rounded-md file:text-[11px] file:font-bold"
              />

              {uploadPending && (
                <div className="flex items-center gap-2 text-xs text-[#136FB6] font-medium">
                  <Loader2 size={13} className="animate-spin" />
                  Uploading PDF to Cloudinary...
                </div>
              )}

              {cloudinaryFileUrl && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5 flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-medium truncate">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span className="truncate">
                      {pdfFile?.name || "PDF Document"} uploaded to Cloudinary
                    </span>
                  </div>
                  <a
                    href={cloudinaryFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#136FB6] font-bold hover:underline shrink-0 ml-2"
                  >
                    View
                  </a>
                </div>
              )}

              {previewPdfUrl && !cloudinaryFileUrl && (
                <div className="mt-2 text-xs text-gray-500">
                  Selected: <span className="font-semibold text-gray-700">{pdfFile?.name}</span>{" "}
                  {pdfFile?.size ? `(${(pdfFile.size / 1024).toFixed(1)} KB)` : ""}
                </div>
              )}
            </div>

            <DialogFooter className="mt-6 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting || uploadPending}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploadPending}
                className="h-9 bg-[#136FB6] hover:bg-[#0d5a8f] text-white font-bold text-xs"
              >
                {isSubmitting || uploadPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadPending ? "Uploading to Cloudinary..." : "Submitting..."}
                  </>
                ) : (
                  "Submit Bank Details"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
