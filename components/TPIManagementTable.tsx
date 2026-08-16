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
import { useState } from "react";
import EditTPIDialog from "./EditTPIDialog";

interface TPIManagementTableProps {
  tpis: any[];
}

export default function TPIManagementTable({
  tpis,
}: TPIManagementTableProps) {
  const [selectedTPI, setSelectedTPI] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#1a2b3c]">
              TPI Officers
            </h2>
            <p className="text-[12px] text-gray-500 font-medium">
              Manage Third Party Inspection (TPI) officers across districts
            </p>
          </div>
        </div>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
          <CardContent className="p-0">
            {tpis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-[14px] text-gray-500 font-medium">
                  No TPI Officers created yet
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  Click "Create TPI Officer" to assign an inspector to a district
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
                      User Code
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
                  {tpis.map((tpi) => (
                    <TableRow
                      key={tpi.id}
                      className="border-gray-100 hover:bg-gray-50"
                    >
                      <TableCell className="text-[13px] font-medium text-[#1a2b3c]">
                        {tpi.name}
                      </TableCell>
                      <TableCell className="text-[13px] font-mono text-gray-600">
                        {tpi.code}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        {tpi.email}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        {tpi.mobile || "N/A"}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        {tpi.district_name ||
                          tpi.district?.districtname ||
                          tpi.district_id ||
                          "N/A"}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTPI(tpi);
                            setIsEditOpen(true);
                          }}
                          className="h-8 px-3 text-[12px] border-gray-200"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <EditTPIDialog
        key={isEditOpen ? "open" : "close"}
        officer={selectedTPI}
        isOpen={isEditOpen}
        onOpenChange={(v) => setIsEditOpen(v)}
      />
    </>
  );
}
