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
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Receipt,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

export default function CreatePaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    contractor_name: "",
    contractor_code: "",
    work_order_code: "",
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
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setPdfFile(file);
    setIsUploadingPdf(true);

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
        setPdfFile(null);
      } else {
        setFormData((prev) => ({
          ...prev,
          voucher_file_url: res.uploadedFile?.fileUrl || "",
          file_name: res.uploadedFile?.fileName || file.name,
          file_size: res.uploadedFile?.fileSize || file.size,
        }));
        toast({
          title: "Voucher Uploaded",
          description: "Voucher PDF file uploaded to Cloudinary successfully.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload Error",
        description: err.message || "An unexpected error occurred during upload.",
        variant: "destructive",
      });
      setPdfFile(null);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setFormData((prev) => ({
      ...prev,
      voucher_file_url: "",
      file_name: "",
      file_size: 0,
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
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
              Submit contractor bank information, voucher document, and payment amount for verification
            </p>
          </div>
        </div>

        <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#1a2b3c] flex items-center gap-2">
              <Receipt size={20} className="text-[#136FB6]" />
              Payment & Bank Details
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Ensure all fields and bank details match the official physical voucher.
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
                    description: "Please upload the voucher PDF document before submitting.",
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

              {/* Group 1: Contractor & Work Order Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#1a2b3c] uppercase tracking-wider text-gray-400">
                  1. Contractor & Work Order Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Contractor Code <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      name="contractor_code"
                      required
                      placeholder="CON-1002"
                      value={formData.contractor_code}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingPdf}
                      className="bg-white"
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Work Order Code <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      name="work_order_code"
                      required
                      placeholder="WO-2026-091"
                      value={formData.work_order_code}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingPdf}
                      className="bg-white"
                    />
                  </Field>
                </div>
              </div>

              {/* Group 2: Bank Account Information */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-[#1a2b3c] uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#136FB6]" />
                  2. Bank Account Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      disabled={isPending || isUploadingPdf}
                      className="bg-white"
                    />
                  </Field>

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
                      disabled={isPending || isUploadingPdf}
                      className="bg-white"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      disabled={isPending || isUploadingPdf}
                      className="bg-white"
                    />
                  </Field>

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
                      disabled={isPending || isUploadingPdf}
                      className="bg-white"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-xs font-semibold text-gray-700">
                      Contractor Name as per Bank Account <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      type="text"
                      name="contractor_name"
                      required
                      placeholder="ABC Infratech Pvt Ltd"
                      value={formData.contractor_name}
                      onChange={handleInputChange}
                      disabled={isPending || isUploadingPdf}
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
                      disabled={isPending || isUploadingPdf}
                      className="bg-white"
                    />
                  </Field>
                </div>
              </div>

              {/* Group 3: Voucher & Verification Document */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-[#1a2b3c] uppercase tracking-wider text-gray-400">
                  3. Voucher & Verification Document
                </h3>
                <div className="grid grid-cols-1 gap-4">
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
                      disabled={isPending || isUploadingPdf}
                      className="bg-white"
                    />
                  </Field>
                </div>

                {/* Voucher PDF Upload (Mandatory) */}
                <div className="pt-2">
                  <FieldLabel className="text-xs font-semibold text-gray-700 block mb-2">
                    Voucher PDF Document <span className="text-red-500">*</span>
                  </FieldLabel>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isPending || isUploadingPdf}
                  />

                  {!formData.voucher_file_url && !pdfFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 hover:border-[#136FB6] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-blue-50/20"
                    >
                      <UploadCloud size={32} className="text-[#136FB6] mb-2" />
                      <p className="text-sm font-semibold text-gray-800">
                        Click to browse and upload Voucher PDF (Mandatory)
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF files only, max 15MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText size={24} className="text-[#136FB6] shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-[#1a2b3c] truncate">
                            {formData.file_name || pdfFile?.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            {isUploadingPdf ? (
                              <span className="flex items-center gap-1 text-blue-600 font-semibold">
                                <Loader2 size={12} className="animate-spin" /> Uploading to cloud...
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                <CheckCircle2 size={12} /> Cloud Uploaded
                              </span>
                            )}
                            {formData.file_size ? (
                              <span>({(formData.file_size / 1024).toFixed(1)} KB)</span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {formData.voucher_file_url && (
                          <VoucherFileViewerModal
                            fileUrl={formData.voucher_file_url}
                            fileName={formData.file_name || pdfFile?.name}
                            voucherNumber={formData.voucher_number}
                          >
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs text-[#136FB6]"
                            >
                              <FileText size={14} className="mr-1" />
                              View PDF
                            </Button>
                          </VoucherFileViewerModal>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          disabled={isUploadingPdf}
                          className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {state.error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                  <p className="text-xs font-medium text-red-700">{state.error}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/completed-workflows")}
                  disabled={isPending || isUploadingPdf}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || isUploadingPdf}
                  className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white px-6"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : isUploadingPdf ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading PDF...
                    </>
                  ) : (
                    "Create Payment Record"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
