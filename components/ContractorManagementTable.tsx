"use client";

import { toggleContractorStatus } from "@/actions/userAction";
import EditContractorDialog from "@/components/EditContractorDialog";
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
import { UserRole } from "@/types/usertypes";
import { CheckCircle2, Loader2, Pencil, Search, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ContractorManagementTableProps {
  contractors: Contractor[];
  canEdit?: boolean;
  role: UserRole;
  currentPage?: number;
  totalPages?: number;
  totalContractors?: number;
  limit?: number;
  search?: string;
}

export default function ContractorManagementTable({
  contractors,
  role,
  canEdit = false,
  currentPage = 1,
  totalPages = 1,
  totalContractors = 0,
  limit = 20,
  search = "",
}: ContractorManagementTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedContractor, setSelectedContractor] =
    useState<Contractor | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(search);

  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageNumber));
    if (limit) params.set("limit", String(limit));
    if (search) params.set("search", search);
    return `/contractors?${params.toString()}`;
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("page", "1");
    if (limit) params.set("limit", String(limit));
    if (searchInput.trim()) params.set("search", searchInput.trim());
    router.push(`/contractors?${params.toString()}`);
  };

  const handleEditClick = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setIsEditOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setSelectedContractor(null);
    }
  };

  const handleToggleStatus = async (contractor: Contractor) => {
    const nextStatus = !(contractor.is_active === true);
    setLoadingId(contractor.id);
    try {
      const res = await toggleContractorStatus(contractor.id, nextStatus);
      if (res.success) {
        toast({
          title: "Status Updated",
          description: res.success,
        });
      } else {
        toast({
          title: "Error",
          description: res.error,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
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
              placeholder="Search by name, code, email, mobile..."
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
            {contractors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-[14px] text-gray-500 font-medium">
                  No contractors listed yet
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  {role === UserRole.HeadOfficer
                    ? "Click 'Upload Contractors' button to add a new contractor"
                    : "No contractors available in your district or under you work"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Name
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Email
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Code
                    </TableHead>{" "}
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Mobile
                    </TableHead>{" "}
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Pan No.
                    </TableHead>{" "}
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      District
                    </TableHead>{" "}
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Address
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Status
                    </TableHead>
                    {canEdit && (
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractors.map((contractor) => (
                    <TableRow
                      key={contractor.id}
                      className="border-gray-100 hover:bg-gray-50"
                    >
                      <TableCell className="text-[13px] font-medium text-[#1a2b3c]">
                        {contractor.name}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        {contractor.email}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        {contractor.code}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        {contractor.mobile}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        {contractor.pan_number}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        {contractor.district_name}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600 max-w-30 truncate">
                        {contractor.address}
                      </TableCell>
                      <TableCell>
                        {contractor.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      {canEdit && (
                        <TableCell className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-gray-200 text-[12px] font-semibold text-[#1a2b3c] hover:bg-gray-50"
                            onClick={() => handleEditClick(contractor)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={loadingId === contractor.id}
                            className={
                              contractor.is_active
                                ? "border-red-200 text-red-700 hover:bg-red-50 text-[12px] font-semibold"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[12px] font-semibold"
                            }
                            onClick={() => handleToggleStatus(contractor)}
                          >
                            {loadingId === contractor.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : contractor.is_active ? (
                              <>
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.02)] md:flex-row md:items-center md:justify-between">
            <p className="text-[12px] font-medium text-gray-600">
              Showing page {currentPage} of {totalPages} · {totalContractors}{" "}
              total contractor{totalContractors === 1 ? "" : "s"}
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

      <EditContractorDialog
        contractor={selectedContractor}
        isOpen={isEditOpen}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
