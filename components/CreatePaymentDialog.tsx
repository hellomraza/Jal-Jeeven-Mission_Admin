"use client";

import {
  createPaymentAction,
  uploadPaymentVoucherPdfAction,
} from "@/actions/paymentAction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

interface CreatePaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePaymentDialog({
  isOpen,
  onOpenChange,
}: CreatePaymentDialogProps) {
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
      handleReset();
      onOpenChange(false);
    }
  }, [state.success, toast, onOpenChange]);

  const handleReset = () => {
    setFormData({
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
    setPdfFile(null);
  };

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

  const handleOpenChange = (open: boolean) => {
    if (!open) handleReset();
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-bold text-[#1a2b3c]">
            Create Payment Record
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} ref={formRef} className="space-y-4 mt-2">
          {/* Hidden File Values */}
          <input
            type="hidden"
            name="voucher_file_url"
            value={formData.voucher_file_url}
          />
          <input type="hidden" name="file_name" value={formData.file_name} />
          <input type="hidden" name="file_size" value={formData.file_size} />

          {/* Section: Contractor & Work Order Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
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
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
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
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
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
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
                Payment Amount (₹) <span className="text-red-500">*</span>
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
              />
            </Field>
          </div>

          {/* Section: Bank Details */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-[#1a2b3c] uppercase tracking-wider mb-3">
              Bank Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">
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
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">
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
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">
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
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">
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
                />
              </Field>
            </div>
          </div>

          {/* Section: Vouchers & Cheque */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-[#1a2b3c] uppercase tracking-wider mb-3">
              Voucher & Reference
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">
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
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-gray-500">
                  Cheque / Check Number (Optional)
                </FieldLabel>
                <Input
                  type="text"
                  name="cheque_number"
                  placeholder="CHQ-654321"
                  value={formData.cheque_number}
                  onChange={handleInputChange}
                  disabled={isPending || isUploadingPdf}
                />
              </Field>
            </div>

            {/* Voucher PDF Upload */}
            <div className="mt-4">
              <FieldLabel className="text-xs font-semibold text-gray-500 block mb-1.5">
                Voucher PDF Document (Optional)
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
                  className="border-2 border-dashed border-gray-200 hover:border-[#136FB6] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-blue-50/20"
                >
                  <UploadCloud size={24} className="text-[#136FB6] mb-1" />
                  <p className="text-xs font-semibold text-gray-700">
                    Click to browse and upload Voucher PDF
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    PDF files only, max 15MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText size={20} className="text-[#136FB6] shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#1a2b3c] truncate">
                        {formData.file_name || pdfFile?.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        {isUploadingPdf ? (
                          <span className="flex items-center gap-1 text-blue-600 font-semibold">
                            <Loader2 size={10} className="animate-spin" /> Uploading to cloud...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            <CheckCircle2 size={10} /> Cloud Uploaded
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 text-xs text-[#136FB6]"
                      >
                        <a
                          href={formData.voucher_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={13} className="mr-1" />
                          View
                        </a>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      disabled={isUploadingPdf}
                      className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {state.error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-xs text-red-700">{state.error}</p>
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending || isUploadingPdf}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isUploadingPdf}
              className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
