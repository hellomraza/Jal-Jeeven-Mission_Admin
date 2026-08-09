"use client";

import { toggleContractorStatus } from "@/actions/userAction";
import EditContractorDialog from "@/components/EditContractorDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { CheckCircle2, Loader2, Pencil, XCircle } from "lucide-react";
import { useState } from "react";

interface ContractorManagementTableProps {
  contractors: Contractor[];
  canEdit?: boolean;
  role: UserRole;
}

export default function ContractorManagementTable({
  contractors,
  role,
  canEdit = false,
}: ContractorManagementTableProps) {
  const { toast } = useToast();
  const [selectedContractor, setSelectedContractor] =
    useState<Contractor | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white py-0">
          <CardContent className="p-0">
            {contractors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-[14px] text-gray-500 font-medium">
                  No contractors listed yet
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                {role === UserRole.HeadOfficer ? "Click 'Upload Contractors' button to add a new contractor" : "No contractors available in your district or under you work"}
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
      </div>

      <EditContractorDialog
        contractor={selectedContractor}
        isOpen={isEditOpen}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
