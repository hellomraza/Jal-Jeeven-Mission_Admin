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
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import CreateEEDialog from "./CreateEEDialog";
import EditEEDialog from "./EditEEDialog";

interface EEManagementTableProps {
  executiveEngineers: any[];
}

export default function EEManagementTable({
  executiveEngineers,
}: EEManagementTableProps) {
  const [ees, setEes] = useState<any[]>(executiveEngineers || []);
  const [selectedEE, setSelectedEE] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    setEes(executiveEngineers || []);
  }, [executiveEngineers]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-[24px] font-bold text-[#1a2b3c]">
              Executive Engineers
            </h1>
            <p className="text-[13px] text-gray-500 font-medium">
              Manage Executive Engineers assigned to each district (1 per district)
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white flex items-center gap-2"
          >
            <Plus size={16} />
            Create Executive Engineer
          </Button>
        </div>

        <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
          <CardContent className="p-0">
            {ees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-[14px] text-gray-500 font-medium">
                  No Executive Engineers listed yet
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  Click "Create Executive Engineer" to add an officer
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
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ees.map((ee) => {
                    return (
                      <TableRow
                        key={ee.id}
                        className="border-gray-100 hover:bg-gray-50"
                      >
                        <TableCell className="text-[13px] font-medium text-[#1a2b3c]">
                          {ee.name}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          {ee.email}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          {ee.mobile || "N/A"}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          {ee.district?.districtname || "N/A"}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs font-semibold"
                              onClick={() => {
                                setSelectedEE(ee);
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

      <CreateEEDialog
        isOpen={isCreateOpen}
        onOpenChange={(v) => setIsCreateOpen(v)}
      />

      <EditEEDialog
        key={isEditOpen ? "open" : "close"}
        ee={selectedEE}
        isOpen={isEditOpen}
        onOpenChange={(v) => setIsEditOpen(v)}
      />
    </>
  );
}
