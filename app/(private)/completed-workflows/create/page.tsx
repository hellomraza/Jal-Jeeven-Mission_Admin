"use client";

import {
  createPaymentAction,
  uploadPaymentVoucherPdfAction,
} from "@/actions/paymentAction";
import BackButton from "@/components/BackButton";
import VoucherFileViewerModal from "@/components/VoucherFileViewerModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FilePlus2,
  FileText,
  Loader2,
  Receipt,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

// Set to true to enable SD Payment workflow inside JJM Admin
const ENABLE_SD_PAYMENT_IN_JJM_ADMIN = false;

export default function CreatePaymentPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!ENABLE_SD_PAYMENT_IN_JJM_ADMIN) {
      router.replace("/dashboard");
    }
  }, [router]);

  const formRef = useRef<HTMLFormElement>(null);
  const voucherFileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    contractor_name: "",
    beneficiary_name: "",
    contractor_id: "",
    agreement_number: "",
    year: "",
    bank_name: "",
    bank_account_number: "",
    ifsc_code: "",
    branch: "",
    amount: "",
    voucher_number: "",
    cheque_number: "",
    voucher_file_url: "",
    file_name: "",
    file_size: 0,
    additional_pdf_url: "",
    additional_file_name: "",
    additional_file_size: 0,
  });

  const [voucherPdfFile, setVoucherPdfFile] = useState<File | null>(null);
  const [isUploadingVoucher, setIsUploadingVoucher] = useState(false);

  const [additionalPdfFile, setAdditionalPdfFile] = useState<File | null>(null);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);

  // Modal states for previewing PDFs
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [previewModalTitle, setPreviewModalTitle] = useState("");

  const [state, formAction, isPending] = useActionState(createPaymentAction, {
    success: "",
    error: "",
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Success",
        description: state.success,
      });
      router.push("/completed-workflows");
    }
  }, [state.success, toast, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVoucherFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file",
        description: "Only PDF documents are allowed for vouchers.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "PDF file size must be 15 MB or smaller.",
        variant: "destructive",
      });
      return;
    }

    setVoucherPdfFile(file);
    setIsUploadingVoucher(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await uploadPaymentVoucherPdfAction(
        { success: "", error: "", uploadedFile: null },
        uploadData,
      );

      if (res.error || !res.uploadedFile) {
        toast({
          title: "Upload Failed",
          description: res.error || "Failed to upload voucher PDF.",
          variant: "destructive",
        });
        setVoucherPdfFile(null);
      } else {
        setFormData((prev) => ({
          ...prev,
          voucher_file_url: res.uploadedFile?.fileUrl || "",
          file_name: res.uploadedFile?.fileName || file.name,
          file_size: res.uploadedFile?.fileSize || file.size,
        }));
        toast({
          title: "Voucher Uploaded",
          description: "Voucher PDF file uploaded successfully.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload Error",
        description: err.message || "An error occurred during voucher upload.",
        variant: "destructive",
      });
      setVoucherPdfFile(null);
    } finally {
      setIsUploadingVoucher(false);
    }
  };

  const handleRemoveVoucherFile = () => {
    setVoucherPdfFile(null);
    setFormData((prev) => ({
      ...prev,
      voucher_file_url: "",
      file_name: "",
      file_size: 0,
    }));
    if (voucherFileInputRef.current) voucherFileInputRef.current.value = "";
  };

  const handleAdditionalFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file",
        description: "Only PDF documents are allowed.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "PDF file size must be 15 MB or smaller.",
        variant: "destructive",
      });
      return;
    }

    setAdditionalPdfFile(file);
    setIsUploadingAdditional(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await uploadPaymentVoucherPdfAction(
        { success: "", error: "", uploadedFile: null },
        uploadData,
      );

      if (res.error || !res.uploadedFile) {
        toast({
          title: "Upload Failed",
          description: res.error || "Failed to upload additional PDF.",
          variant: "destructive",
        });
        setAdditionalPdfFile(null);
      } else {
        setFormData((prev) => ({
          ...prev,
          additional_pdf_url: res.uploadedFile?.fileUrl || "",
          additional_file_name: res.uploadedFile?.fileName || file.name,
          additional_file_size: res.uploadedFile?.fileSize || file.size,
        }));
        toast({
          title: "Document Uploaded",
          description: "Additional PDF document uploaded successfully.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload Error",
        description: err.message || "An error occurred during document upload.",
        variant: "destructive",
      });
      setAdditionalPdfFile(null);
    } finally {
      setIsUploadingAdditional(false);
    }
  };

  const handleRemoveAdditionalFile = () => {
    setAdditionalPdfFile(null);
    setFormData((prev) => ({
      ...prev,
      additional_pdf_url: "",
      additional_file_name: "",
      additional_file_size: 0,
    }));
    if (additionalFileInputRef.current)
      additionalFileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[26px] font-bold text-[#1a2b3c]">
              Create Payment Record
            </h1>
            <p className="text-[13px] text-gray-500 font-medium">
              Submit contractor details, agreement number, bank information, and voucher documents for verification
            </p>
          </div>
        </div>

        <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#1a2b3c] flex items-center gap-2">
              <Receipt size={20} className="text-[#136FB6]" />
              Payment & Contractor Details
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Ensure all fields and bank details match the official voucher and agreement documents.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              action={formAction}
              ref={formRef}
              className="space-y-6"
              onSubmit={(e) => {
                if (!formData.voucher_file_url) {
                  e.preventDefault();
                  toast({
                    title: "Voucher PDF Required",
                    description:
                      "Please upload the voucher PDF document before submitting.",
                    variant: "destructive",
                  });
                }
              }}
            >
              {/* Hidden File Values */}
              <input
                type="hidden"
                name="voucher_file_url"
                value={formData.voucher_file_url}
              />
              <input
                type="hidden"
                name="file_name"
                value={formData.file_name}
              />
              <input
                type="hidden"
                name="file_size"
                value={formData.file_size}
              />
              <input
                type="hidden"
                name="additional_pdf_url"
                value={formData.additional_pdf_url}
              />
              <input
                type="hidden"
                name="additional_file_name"
                value={formData.additional_file_name}
              />
              <input
                type="hidden"
                name="additional_file_size"
                value={formData.additional_file_size}
              />

              {/* Group 1: Contractor & Agreement Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#1a2b3c] uppercase tracking-wider text-gray-400">
                  1. Contractor & Agreement Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Contractor Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      name="contractor_name"
                      required
                      placeholder="e.g. Shyam Construction Co."
                      value={formData.contractor_name}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                      className="bg-white"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Contractor ID <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      name="contractor_id"
                      required
                      placeholder="e.g. CON-8821"
                      value={formData.contractor_id}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                      className="bg-white"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Agreement Number <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      name="agreement_number"
                      required
                      placeholder="e.g. AGR-2026/092"
                      value={formData.agreement_number}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                      className="bg-white"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      Year (Optional text)
                    </FieldLabel>
                    <Input
                      type="text"
                      name="year"
                      placeholder="e.g. 2025-26"
                      value={formData.year}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                      className="bg-white"
                    />
                  </Field>
                </div>
              </div>

              {/* Group 2: Bank Account & Beneficiary Information */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-[#1a2b3c] uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#136FB6]" />
                  2. Bank Account & Beneficiary Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Beneficiary Name (as per Bank) <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      name="beneficiary_name"
                      required
                      placeholder="e.g. Shyam Construction Private Limited"
                      value={formData.beneficiary_name}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                      className="bg-white"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Bank Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      name="bank_name"
                      required
                      placeholder="State Bank of India"
                      value={formData.bank_name}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                      className="bg-white"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Bank Account Number <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      name="bank_account_number"
                      required
                      placeholder="309812345678"
                      value={formData.bank_account_number}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                      className="bg-white"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      IFSC Code <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      name="ifsc_code"
                      required
                      placeholder="SBIN0001234"
                      value={formData.ifsc_code}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                      className="bg-white"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Branch Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      name="branch"
                      required
                      placeholder="Main Branch, District Center"
                      value={formData.branch}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                      className="bg-white"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Total Payment Amount (₹) <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="number"
                      name="amount"
                      step="0.01"
                      required
                      placeholder="500000.00"
                      value={formData.amount}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                      className="bg-white"
                    />
                  </Field>
                </div>
              </div>

              {/* Group 3: Voucher & Verification Documents */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-[#1a2b3c] uppercase tracking-wider text-gray-400">
                  3. Voucher & Verification Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Voucher Number <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      name="voucher_number"
                      required
                      placeholder="VCH-2026-881"
                      value={formData.voucher_number}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                      className="bg-white"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Cheque Number (Optional)
                    </FieldLabel>
                    <Input
                      type="text"
                      name="cheque_number"
                      placeholder="CHQ-992102"
                      value={formData.cheque_number}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                      className="bg-white"
                    />
                  </Field>
                </div>

                {/* Primary Voucher PDF Upload (Required) */}
                <div className="space-y-2">
                  <FieldLabel className="text-xs font-semibold text-gray-700">
                    Primary Voucher PDF Document <span className="text-red-500">*</span>
                  </FieldLabel>

                  {formData.voucher_file_url ? (
                    <div className="flex items-center justify-between p-3.5 border border-emerald-200 bg-emerald-50/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1a2b3c]">
                            {formData.file_name || "Voucher_Document.pdf"}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {formData.file_size
                              ? `${(formData.file_size / 1024).toFixed(1)} KB`
                              : "PDF document uploaded"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-[#136FB6] hover:bg-[#DFEEF9]/50"
                          onClick={() => {
                            setPreviewModalUrl(formData.voucher_file_url);
                            setPreviewModalTitle("Voucher Document Preview");
                          }}
                        >
                          <ExternalLink size={14} className="mr-1" />
                          View PDF
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-red-600 hover:bg-red-50"
                          onClick={handleRemoveVoucherFile}
                          disabled={isPending}
                        >
                          <X size={14} className="mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-200 hover:border-[#136FB6] rounded-xl p-5 text-center cursor-pointer transition-colors bg-gray-50/50"
                      onClick={() => voucherFileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={voucherFileInputRef}
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleVoucherFileSelect}
                        disabled={isUploadingVoucher || isPending}
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-[#DFEEF9] flex items-center justify-center text-[#136FB6]">
                          {isUploadingVoucher ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <UploadCloud size={20} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1a2b3c]">
                            {isUploadingVoucher
                              ? "Uploading Voucher PDF..."
                              : "Click to upload Voucher PDF document"}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            PDF format only (Max 15MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional PDF Document Upload (Optional) */}
                <div className="space-y-2 pt-2">
                  <FieldLabel className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <FilePlus2 size={13} className="text-gray-400" />
                    Additional PDF Document (Optional)
                  </FieldLabel>

                  {formData.additional_pdf_url ? (
                    <div className="flex items-center justify-between p-3.5 border border-blue-200 bg-blue-50/40 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1a2b3c]">
                            {formData.additional_file_name || "Additional_Document.pdf"}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {formData.additional_file_size
                              ? `${(formData.additional_file_size / 1024).toFixed(1)} KB`
                              : "Optional document attached"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-[#136FB6] hover:bg-[#DFEEF9]/50"
                          onClick={() => {
                            setPreviewModalUrl(formData.additional_pdf_url);
                            setPreviewModalTitle("Additional Document Preview");
                          }}
                        >
                          <ExternalLink size={14} className="mr-1" />
                          View PDF
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-red-600 hover:bg-red-50"
                          onClick={handleRemoveAdditionalFile}
                          disabled={isPending}
                        >
                          <X size={14} className="mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-200 hover:border-[#136FB6] rounded-xl p-4 text-center cursor-pointer transition-colors bg-gray-50/30"
                      onClick={() => additionalFileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={additionalFileInputRef}
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleAdditionalFileSelect}
                        disabled={isUploadingAdditional || isPending}
                      />
                      <div className="flex flex-col items-center justify-center space-y-1.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          {isUploadingAdditional ? (
                            <Loader2 size={16} className="animate-spin text-[#136FB6]" />
                          ) : (
                            <FilePlus2 size={16} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">
                            {isUploadingAdditional
                              ? "Uploading Document..."
                              : "Upload an extra document (Optional)"}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            PDF format only (Max 15MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {state.error && (
                <div className="rounded-xl bg-red-50 p-4 text-red-700 border border-red-100">
                  <p className="text-xs font-semibold">{state.error}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending || isUploadingVoucher || isUploadingAdditional}
                  className="h-10 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    isUploadingVoucher ||
                    isUploadingAdditional ||
                    !formData.voucher_file_url
                  }
                  className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white h-10 text-xs font-semibold px-6 shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Creating Payment Record...
                    </>
                  ) : (
                    "Save & Create Payment"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* PDF Document Viewer Modal */}
      {previewModalUrl && (
        <VoucherFileViewerModal
          isOpen={!!previewModalUrl}
          onClose={() => setPreviewModalUrl(null)}
          fileUrl={previewModalUrl}
          title={previewModalTitle}
        />
      )}
    </div>
  );
}
