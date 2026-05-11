"use client";

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
import { Pencil } from "lucide-react";
import { useState } from "react";

interface ContractorManagementTableProps {
  contractors: Contractor[];
  canEdit?: boolean;
}

export default function ContractorManagementTable({
  contractors,
  canEdit = false,
}: ContractorManagementTableProps) {
  const [selectedContractor, setSelectedContractor] =
    useState<Contractor | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
                  Click "Create Contractor" to add a new contractor
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
                      {canEdit && (
                        <TableCell>
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
