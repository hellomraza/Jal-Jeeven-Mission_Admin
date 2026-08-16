"use client";

import { Badge } from "@/components/ui/badge";
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
import { UserRole } from "@/types/usertypes";
import { CheckCircle2, Clock, Eye, ShieldCheck } from "lucide-react";
import { useState } from "react";
import DualPhotoReviewDialog from "./DualPhotoReviewDialog";

interface WorkOrderTPIComponentsTableProps {
  workOrderTpiId: string;
  components: any[];
  userRole?: string;
  isExecutiveEngineer?: boolean;
  onRefresh?: () => void;
}

export default function WorkOrderTPIComponentsTable({
  workOrderTpiId,
  components: initialComponents,
  userRole,
  isExecutiveEngineer,
  onRefresh,
}: WorkOrderTPIComponentsTableProps) {
  const [components, setComponents] = useState<any[]>(initialComponents);
  const [selectedComp, setSelectedComp] = useState<any | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const canApprove =
    userRole === UserRole.DistrictOfficer || userRole === UserRole.HeadOfficer;

  const handleComponentApproved = () => {
    if (selectedComp) {
      setComponents((prev) =>
        prev.map((c) =>
          c.id === selectedComp.id
            ? { ...c, status: "APPROVED", progress: 100 }
            : c,
        ),
      );
    }
    onRefresh?.();
  };

  return (
    <>
      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="text-[12px] font-bold text-[#1a2b3c] w-16">
                  #
                </TableHead>
                <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                  Component / Inspection Milestone
                </TableHead>
                <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                  Unit
                </TableHead>
                <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                  Progress
                </TableHead>
                <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                  Status
                </TableHead>
                <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                  Verification
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((comp) => (
                <TableRow
                  key={comp.id}
                  className="border-gray-100 hover:bg-gray-50"
                >
                  <TableCell className="text-[13px] font-bold text-gray-500">
                    {comp.order_number}
                  </TableCell>
                  <TableCell className="text-[13px] font-semibold text-[#1a2b3c]">
                    {comp.name}
                  </TableCell>
                  <TableCell className="text-[13px] text-gray-600">
                    {comp.unit || "No."}
                  </TableCell>
                  <TableCell className="text-[13px] text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            comp.status === "APPROVED"
                              ? "bg-emerald-500"
                              : "bg-[#136FB6]"
                          }`}
                          style={{
                            width: `${comp.progress || (comp.status === "APPROVED" ? 100 : 0)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-gray-600">
                        {comp.progress || (comp.status === "APPROVED" ? 100 : 0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[13px]">
                    {comp.status === "APPROVED" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 w-fit">
                        <CheckCircle2 size={12} />
                        Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1 w-fit">
                        <Clock size={12} />
                        Pending Approval
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-[13px]">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedComp(comp);
                        setIsReviewOpen(true);
                      }}
                      className={`h-8 px-3 text-[12px] font-semibold flex items-center gap-1.5 ${
                        comp.status === "APPROVED"
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                          : "bg-[#136FB6] hover:bg-[#0f5a94] text-white"
                      }`}
                    >
                      <Eye size={14} />
                      {comp.status === "APPROVED" ? "View Photos" : "Review Photos"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DualPhotoReviewDialog
        key={isReviewOpen ? "open" : "close"}
        workOrderTpiId={workOrderTpiId}
        component={selectedComp}
        isOpen={isReviewOpen}
        onOpenChange={(v) => setIsReviewOpen(v)}
        onApproved={handleComponentApproved}
        canApprove={canApprove}
      />
    </>
  );
}
