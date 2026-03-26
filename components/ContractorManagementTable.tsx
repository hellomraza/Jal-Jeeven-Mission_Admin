"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ContractorManagementTableProps {
  contractors: any[];
}

export default function ContractorManagementTable({
  contractors,
}: ContractorManagementTableProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#1a2b3c]">
              Contractors
            </h2>
            <p className="text-[12px] text-gray-500 font-medium">
              Manage all contractors in the system
            </p>
          </div>
        </div>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
