"use client";

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
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [formData, setFormData] = useState({
    bank_account_name: "",
    bank_account_number: "",
    ifsc_code: "",
    voucher_number: "",
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

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
      bank_account_name: "",
      bank_account_number: "",
      ifsc_code: "",
      voucher_number: "",
    });
    setUploadFile(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ifsc_code" ? value.toUpperCase() : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkItem) return;

    if (!uploadFile) {
      toast({
        title: "Validation Error",
        description: "Please upload a voucher file.",
        variant: "destructive",
      });
      return;
    }
    console.log("sdgsdf");

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

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("file", uploadFile);
      data.append("bank_account_name", formData.bank_account_name);
      data.append("bank_account_number", formData.bank_account_number);
      data.append("ifsc_code", formData.ifsc_code);
      data.append("voucher_number", formData.voucher_number);

      console.log(data.entries());

      const response = await apiClient.post(
        `/work-items/${selectedWorkItem.id}/bank-details`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast({
        title: "Details Submitted",
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
        description: error.response?.data?.message || "Something went wrong.",
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
        description: "Contractor bank details have been approved.",
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
                  No completed workflows listed
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  There are no completed work items in your assigned district
                  yet.
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
                            <div>
                              <div className="font-medium text-gray-800">
                                {details.bank_account_name}
                              </div>
                              <div className="text-[11px] font-mono text-gray-500">
                                AC: {details.bank_account_number}
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
                            <div>
                              <div className="font-medium text-gray-800">
                                No: {details.voucher_number}
                              </div>
                              <div className="mt-1">
                                <a
                                  href={details.voucher_file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-[#136FB6] font-bold hover:underline"
                                >
                                  View File <ExternalLink size={12} />
                                </a>
                              </div>
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
              total workflow{totalWorkItems === 1 ? "" : "s"}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contractor Bank & Voucher Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
                Bank Account Name
              </FieldLabel>
              <Input
                type="text"
                name="bank_account_name"
                required
                placeholder="e.g. M/S Sunrise Enterprises"
                value={formData.bank_account_name}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
                Bank Account Number
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
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
                IFSC Code
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
              />
              <p className="text-[10px] text-gray-400 font-medium">
                11 characters alphanumeric code
              </p>
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
                Voucher Number
              </FieldLabel>
              <Input
                type="text"
                name="voucher_number"
                required
                placeholder="e.g. VCH-00124"
                value={formData.voucher_number}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold text-gray-500">
                Voucher Document (Image or PDF)
              </FieldLabel>
              <Input
                type="file"
                accept="image/*,application/pdf"
                required
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="cursor-pointer text-[12px] h-10 file:bg-gray-100 file:border-0 file:rounded-md file:text-[11px] file:font-semibold"
              />
            </Field>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#136FB6] hover:bg-[#0d5a8f]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
