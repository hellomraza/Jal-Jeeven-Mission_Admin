"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import CreateDODialog from "./CreateDODialog";
import EditDODialog from "./EditDODialog";

interface DOManagementTableProps {
  districtOfficers: any[];
}

export default function DOManagementTable({
  districtOfficers,
}: DOManagementTableProps) {
  const { toast } = useToast();
  const [officers, setOfficers] = useState<any[]>(districtOfficers || []);
  const [selectedDO, setSelectedDO] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setOfficers(districtOfficers || []);
  }, [districtOfficers]);

  const handleToggleBulkOrderAllowed = async (
    officerId: string,
    currentStatus: boolean,
  ) => {
    const nextStatus = !currentStatus;
    setUpdatingId(officerId);

    // Optimistically update local state
    setOfficers((prev) =>
      prev.map((o) =>
        o.id === officerId ? { ...o, is_bulk_order_allowed: nextStatus } : o,
      ),
    );

    try {
      await apiClient.patch(`/users/do/${officerId}`, {
        is_bulk_order_allowed: nextStatus,
      });

      toast({
        title: "Permission Updated",
        description: `District Officer updated to ${
          nextStatus
            ? "Bulk Access enabled"
            : "SVS only"
        }.`,
      });
    } catch (error: any) {
      // Revert optimistic update on failure
      setOfficers((prev) =>
        prev.map((o) =>
          o.id === officerId ? { ...o, is_bulk_order_allowed: currentStatus } : o,
        ),
      );
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to update bulk order permission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
          <CardContent className="p-0">
            {officers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-[14px] text-gray-500 font-medium">
                  No District Officers listed yet
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  Click "Create District Officer" to add a new officer
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
                      Mobile
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      District
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Allow Bulk Orders
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officers.map((do_) => {
                    const isBulkAllowed = Boolean(do_.is_bulk_order_allowed);
                    const isUpdating = updatingId === do_.id;

                    return (
                      <TableRow
                        key={do_.id}
                        className="border-gray-100 hover:bg-gray-50"
                      >
                        <TableCell className="text-[13px] font-medium text-[#1a2b3c]">
                          {do_.name}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          {do_.email}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          {do_.mobile || "N/A"}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          {do_.district?.districtname || "N/A"}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={isBulkAllowed}
                              disabled={isUpdating}
                              onCheckedChange={() =>
                                handleToggleBulkOrderAllowed(do_.id, isBulkAllowed)
                              }
                              aria-label="Toggle Bulk Orders Allowed"
                              className="data-[state=checked]:bg-[#136FB6]"
                            />
                            {isUpdating ? (
                              <Loader2
                                size={14}
                                className="animate-spin text-[#136FB6]"
                              />
                            ) : isBulkAllowed ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#136FB6] border border-blue-200">
                                Yes (Bulk Access)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200">
                                No (SVS Only)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs font-semibold"
                              onClick={() => {
                                setSelectedDO(do_);
                                setIsEditOpen(true);
                              }}
                            >
                              Edit
                            </Button>
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
      </div>

      <CreateDODialog
        isOpen={isCreateOpen}
        onOpenChange={(v) => setIsCreateOpen(v)}
      />

      <EditDODialog
        key={isEditOpen ? "open" : "close"}
        officer={selectedDO}
        isOpen={isEditOpen}
        onOpenChange={(v) => setIsEditOpen(v)}
      />
    </>
  );
}
