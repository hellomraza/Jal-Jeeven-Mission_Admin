"use client";

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
import { unassignTpiStaffFromWorkItem } from "@/services/workService";
import { Loader2, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AssignedStaff {
  id: string;
  name?: string;
  email?: string;
  code?: string;
  district_name?: string;
  mobile?: string;
}

interface AssignedTpiStaffTableProps {
  workItemId: string;
  assignedStaff: AssignedStaff[];
}

export default function AssignedTpiStaffTable({
  workItemId,
  assignedStaff,
}: AssignedTpiStaffTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [unassigningId, setUnassigningId] = useState<string | null>(null);

  const handleUnassign = async (staffId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to unassign this staff member from this work order?",
      )
    ) {
      return;
    }

    try {
      setUnassigningId(staffId);
      await unassignTpiStaffFromWorkItem(workItemId, staffId);
      toast({
        title: "Staff Unassigned",
        description: "Staff member has been unassigned from this work order.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Unassignment Failed",
        description: error.message || "Failed to unassign staff member.",
      });
    } finally {
      setUnassigningId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#1a2b3c]">
            Assigned TPI Staff
          </h2>
          <p className="text-[12px] text-gray-500 font-medium">
            Inspection staff currently assigned to review and capture reference photos for this work order
          </p>
        </div>
      </div>

      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] py-0 overflow-hidden bg-white rounded-2xl">
        <CardContent className="p-0">
          {assignedStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-[14px] text-gray-500 font-medium">
                No TPI staff assigned yet
              </p>
              <p className="text-[12px] text-gray-400 mt-1">
                Use the selector above to assign inspection staff to this work order
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      S No.
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Name
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Email
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Code
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      District
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Mobile
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedStaff.map((staff: AssignedStaff, index: number) => (
                    <TableRow
                      key={staff.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50"
                    >
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium bg-[#DFEEF9]/50">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-bold bg-[#DFEEF9]/50">
                        {staff.name || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {staff.email || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {staff.code || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {staff.district_name || "---"}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {staff.mobile || "---"}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={unassigningId === staff.id}
                          onClick={() => handleUnassign(staff.id)}
                          className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 text-[11px] font-bold"
                          title="Unassign from this work order"
                        >
                          {unassigningId === staff.id ? (
                            <Loader2 size={13} className="animate-spin mr-1" />
                          ) : (
                            <UserX size={13} className="mr-1" />
                          )}
                          Unassign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
