"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  assignTpiToWorkItem,
  unassignTpiFromWorkItem,
} from "@/services/workService";
import {
  Building2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface TpiAssignmentControlsProps {
  workItemId: string;
  isExecutiveEngineer: boolean;
  tpi?: any | null;
  tpiAssignedAt?: string | null;
}

export default function TpiAssignmentControls({
  workItemId,
  isExecutiveEngineer,
  tpi,
  tpiAssignedAt,
}: TpiAssignmentControlsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isExecutiveEngineer) return null;

  const handleAssign = async () => {
    try {
      setLoading(true);
      await assignTpiToWorkItem(workItemId);
      toast({
        title: "TPI Assigned",
        description: "Active district TPI agency has been successfully assigned.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description:
          error.message ||
          "Failed to assign TPI agency. Ensure an active TPI exists for this district.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (
      !window.confirm(
        "Are you sure you want to unassign the TPI agency from this work order?",
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await unassignTpiFromWorkItem(workItemId);
      toast({
        title: "TPI Unassigned",
        description: "TPI agency has been unassigned from this work order.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Unassignment Failed",
        description: error.message || "Failed to unassign TPI agency.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-gradient-to-br from-white to-blue-50/40 rounded-2xl">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100/70 text-[#136FB6]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#1a2b3c]">
                  Third-Party Inspection (TPI) Agency
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700">
                  Bulk Village Quality Control
                </span>
              </div>
              {tpi ? (
                <div className="mt-1 space-y-0.5">
                  <p className="text-[13px] font-bold text-gray-800">
                    {tpi.name}{" "}
                    <span className="font-mono text-gray-500 font-normal">
                      ({tpi.code || "No Code"})
                    </span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Contact: {tpi.email} {tpi.mobile ? `| ${tpi.mobile}` : ""}
                    {tpiAssignedAt && (
                      <span className="ml-1 text-gray-400">
                        • Assigned on {new Date(tpiAssignedAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-[12px] text-gray-500 mt-0.5">
                  No TPI agency assigned yet. Click below to automatically assign the active district TPI.
                </p>
              )}
            </div>
          </div>

          <div>
            {tpi ? (
              <Button
                variant="destructive"
                size="sm"
                className="h-9 px-4 text-[12px] font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                disabled={loading}
                onClick={handleUnassign}
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                ) : (
                  <UserX size={14} className="mr-1.5" />
                )}
                Unassign TPI Agency
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-9 px-4 text-[12px] font-bold bg-[#136FB6] hover:bg-[#0d5a8f] text-white shadow-sm"
                disabled={loading}
                onClick={handleAssign}
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                ) : (
                  <Building2 size={14} className="mr-1.5" />
                )}
                Assign District TPI Agency
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
