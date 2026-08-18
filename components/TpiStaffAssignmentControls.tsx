"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  assignTpiStaffToWorkItem,
  unassignTpiStaffFromWorkItem,
} from "@/services/workService";
import { Check, Loader2, Plus, UserCheck, UserX, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface TpiStaffAssignmentControlsProps {
  workItemId: string;
  assignedStaff: any[];
  allStaff: any[];
}

export default function TpiStaffAssignmentControls({
  workItemId,
  assignedStaff = [],
  allStaff = [],
}: TpiStaffAssignmentControlsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loadingStaffId, setLoadingStaffId] = useState<string | null>(null);

  const assignedStaffIds = new Set(
    assignedStaff.map((s) => s.staff_id || s.id),
  );

  const handleAssign = async (staffId: string) => {
    try {
      setLoadingStaffId(staffId);
      await assignTpiStaffToWorkItem(workItemId, staffId);
      toast({
        title: "Staff Assigned",
        description: "TPI Staff assigned to work order.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: error.message || "Failed to assign staff member.",
      });
    } finally {
      setLoadingStaffId(null);
    }
  };

  const handleUnassign = async (staffId: string) => {
    try {
      setLoadingStaffId(staffId);
      await unassignTpiStaffFromWorkItem(workItemId, staffId);
      toast({
        title: "Staff Unassigned",
        description: "TPI Staff unassigned from work order.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Unassignment Failed",
        description: error.message || "Failed to unassign staff member.",
      });
    } finally {
      setLoadingStaffId(null);
    }
  };

  return (
    <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-2xl">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-[#136FB6]">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#1a2b3c]">
                TPI Field Staff Assignment
              </h3>
              <p className="text-[11px] text-gray-500">
                Assign inspectors from your agency to upload reference photos for this work order
              </p>
            </div>
          </div>
        </div>

        {allStaff.length === 0 ? (
          <div className="p-4 rounded-xl bg-gray-50 text-center">
            <p className="text-[12px] text-gray-500">
              No staff members registered in your agency yet. Go to{" "}
              <a href="/tpi-staff" className="text-[#136FB6] font-bold underline">
                Staff Management
              </a>{" "}
              to add staff.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allStaff.map((staff) => {
              const isAssigned = assignedStaffIds.has(staff.id);
              const isLoading = loadingStaffId === staff.id;

              return (
                <div
                  key={staff.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isAssigned
                      ? "bg-blue-50/50 border-blue-200"
                      : "bg-gray-50/50 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-[12px] font-bold text-[#1a2b3c] truncate">
                      {staff.name}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {staff.email}
                    </p>
                  </div>

                  <div>
                    {isAssigned ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                        disabled={isLoading}
                        onClick={() => handleUnassign(staff.id)}
                      >
                        {isLoading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <>
                            <UserX size={12} className="mr-1" /> Remove
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="h-7 px-2 text-[10px] font-bold bg-[#136FB6] hover:bg-[#0d5a8f] text-white"
                        disabled={isLoading}
                        onClick={() => handleAssign(staff.id)}
                      >
                        {isLoading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <>
                            <Plus size={12} className="mr-1" /> Assign
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
