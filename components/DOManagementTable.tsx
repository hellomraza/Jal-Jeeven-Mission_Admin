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
import { toggleExecutiveEngineer } from "@/services/userService";
import { useState } from "react";
import { toast } from "sonner";
import EditDODialog from "./EditDODialog";

interface DOManagementTableProps {
  districtOfficers: any[];
}

export default function DOManagementTable({
  districtOfficers: initialOfficers,
}: DOManagementTableProps) {
  const [officers, setOfficers] = useState<any[]>(initialOfficers);
  const [selectedDO, setSelectedDO] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleEE = async (officer: any) => {
    const newStatus = !officer.is_executive_engineer;
    setLoadingId(officer.id);

    // Optimistic update
    setOfficers((prev) =>
      prev.map((o) =>
        o.id === officer.id ? { ...o, is_executive_engineer: newStatus } : o,
      ),
    );

    try {
      await toggleExecutiveEngineer(officer.id, newStatus);
      toast.success(
        `${officer.name} is ${
          newStatus
            ? "now granted Executive Engineer permissions"
            : "revoked of Executive Engineer permissions"
        }`,
      );
    } catch (err: any) {
      // Revert optimistic update
      setOfficers((prev) =>
        prev.map((o) =>
          o.id === officer.id
            ? { ...o, is_executive_engineer: !newStatus }
            : o,
        ),
      );
      toast.error(err.message || "Failed to update Executive Engineer status");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#1a2b3c]">
              District Officers
            </h2>
            <p className="text-[12px] text-gray-500 font-medium">
              Manage all District Officers and Executive Engineer permissions
            </p>
          </div>
        </div>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
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
                      Executive Engineer
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officers.map((do_) => (
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
                        {do_.district_name ||
                          do_.district?.districtname ||
                          "N/A"}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={Boolean(do_.is_executive_engineer)}
                            disabled={loadingId === do_.id}
                            onCheckedChange={() => handleToggleEE(do_)}
                          />
                          <span className="text-[11px] font-semibold text-gray-500">
                            {do_.is_executive_engineer ? "EE Enabled" : "Off"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
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
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <EditDODialog
        key={isEditOpen ? "open" : "close"}
        officer={selectedDO}
        isOpen={isEditOpen}
        onOpenChange={(v) => setIsEditOpen(v)}
      />
    </>
  );
}
