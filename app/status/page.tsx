"use client";
import * as XLSX from "xlsx";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function StatusPage() {
  const dummyData = [
    {
      id: 1,
      component: "Supply & Installation Of Submersible Pump (In No.)",
      qty: "1234",
      doRemark: "15",
      provision: "1",
      physProgress: "2",
      percentProgress: "2",
      contractorRemark: "Re",
      date: "20/01/2023 9:20:18 PM",
      status: "Approved By District Officers",
      actionDisabled: false,
    },
    {
      id: 2,
      component: "Chlorinator (In No.)",
      qty: "1221",
      doRemark: "12",
      provision: "12",
      physProgress: "23",
      percentProgress: "32223",
      contractorRemark: "Re",
      date: "20/01/2023 9:20:18 PM",
      status: "Edited By District Officers",
      actionDisabled: true,
    },
    {
      id: 3,
      component: "Chlorinator (In No.)",
      qty: "1221",
      doRemark: "12",
      provision: "1",
      physProgress: "2",
      percentProgress: "3",
      contractorRemark: "Re",
      date: "20/01/2023 9:20:18 PM",
      status: "Approved By District Officers",
      actionDisabled: true,
    },
    {
      id: 4,
      component: "Chlorinator (In No.)",
      qty: "1234",
      doRemark: "15",
      provision: "12",
      physProgress: "23",
      percentProgress: "32223",
      contractorRemark: "Re",
      date: "20/01/2023 9:20:18 PM",
      status: "Edited By District Officers",
      actionDisabled: true,
    },
    {
      id: 5,
      component: "Chlorinator (In No.)",
      qty: "1221",
      doRemark: "12",
      provision: "1",
      physProgress: "2",
      percentProgress: "2",
      contractorRemark: "Re",
      date: "20/01/2023 9:20:18 PM",
      status: "Approved By District Officers",
      actionDisabled: true,
    },
  ];

  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const role = localStorage.getItem("user_role");
    setUserRole(role);
  }, []);

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(dummyData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Status_Progress");
    XLSX.writeFile(wb, "Status_Progress.xlsx");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4 px-2">
            <h2 className="text-[16px] font-bold text-[#1a2b3c] whitespace-nowrap">
              Physical Progress Submitted by Contractor
            </h2>
            <span className="text-[12px] font-medium text-[#136FB6]">
              Work Code W46722300236
            </span>
          </div>

          {userRole !== "CO" && (
            <Select defaultValue="all">
              <SelectTrigger className="w-[160px] bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
                <SelectValue placeholder="Select Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Select Name</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>


        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden bg-white rounded-[16px]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      S No.
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Component Wise Progress
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Quantity
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      DO Remark
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Provision In AA
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Physical Progress
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      % Of Physical
                      <br />
                      Progress Till Date
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Contractor Remark
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Date
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Status
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyData.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50"
                    >
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.id}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.component}
                      </TableCell>
                      <TableCell className="text-[12px] font-semibold text-[#136FB6] py-4">
                        {row.qty}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.doRemark}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.provision}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.physProgress}
                      </TableCell>
                      <TableCell className="text-[12px] font-semibold text-[#136FB6] py-4">
                        {row.percentProgress}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.contractorRemark}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium max-w-[100px] leading-tight">
                        {row.date}
                      </TableCell>
                      <TableCell className="text-[12px] font-medium py-4 max-w-[140px] leading-tight">
                        <span
                          className={
                            row.status.includes("Edited")
                              ? "text-[#136FB6]"
                              : "text-gray-900"
                          }
                        >
                          {row.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Button
                          className={`h-7 px-4 text-[11px] font-bold rounded-md ${row.actionDisabled ? "bg-[#DFEEF9] text-[#64748B] hover:bg-[#d0e5f5]" : "bg-[#136FB6] hover:bg-[#105E9A] text-white"}`}
                        >
                          View History
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-white hover:bg-white border-0">
                    <TableCell
                      colSpan={2}
                      className="text-[12px] font-extrabold text-[#1a2b3c] py-4"
                    >
                      Total
                    </TableCell>
                    <TableCell className="text-[12px] font-extrabold text-[#136FB6] py-4">
                      32226
                    </TableCell>
                    <TableCell colSpan={3}></TableCell>
                    <TableCell className="text-[12px] font-extrabold text-[#136FB6] py-4">
                      64446
                    </TableCell>
                    <TableCell colSpan={4}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleExport}
            className="bg-[#DFEEF9] hover:bg-[#D0E5F5] text-[#1a2b3c] font-bold text-[12px] h-10 px-6 rounded-lg flex items-center gap-2 shadow-sm"
          >
            <Upload size={14} className="stroke-[2.5]" />
            Export
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
