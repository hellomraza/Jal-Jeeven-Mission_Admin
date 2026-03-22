"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function GisMapPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const tableData = [
    {
      id: 1,
      userId: "JJM00001",
      userName: "Mohansahu012345",
      mobile: "9406558231",
      email: "mohansahu@gmail.com",
      status: "Active",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <h2 className="text-[16px] font-bold text-[#1a2b3c] tracking-wide">
            Create User For GIS App
          </h2>
        </div>

        {/* Form Card */}
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[16px] overflow-hidden bg-white">
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              {/* Row 1 */}
              <div className="space-y-2.5">
                <label className="text-[12px] font-bold text-gray-500">
                  User Id
                </label>
                <Input
                  defaultValue="JJM00001"
                  className="h-12 bg-[#FAFAFA] border-gray-100 rounded-[8px] text-[13px] font-medium px-4 shadow-sm"
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-[12px] font-bold text-gray-500">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    defaultValue="***********"
                    className="h-12 bg-[#FAFAFA] border-gray-100 rounded-[8px] text-[13px] font-medium px-4 pr-10 shadow-sm"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#136FB6] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-[12px] font-bold text-gray-500">
                  User Name
                </label>
                <Input
                  defaultValue="Mohansahu012345"
                  className="h-12 bg-[#FAFAFA] border-gray-100 rounded-[8px] text-[13px] font-medium px-4 shadow-sm"
                />
              </div>

              {/* Row 2 */}
              <div className="space-y-2.5">
                <label className="text-[12px] font-bold text-gray-500">
                  Mobile No.
                </label>
                <Input
                  defaultValue="91+ 9406558231"
                  className="h-12 bg-[#FAFAFA] border-gray-100 rounded-[8px] text-[13px] font-medium px-4 shadow-sm"
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-[12px] font-bold text-gray-500">
                  Email
                </label>
                <Input
                  defaultValue="mohansahu@gmail.com"
                  className="h-12 bg-[#FAFAFA] border-gray-100 rounded-[8px] text-[13px] font-medium px-4 shadow-sm"
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-[12px] font-bold text-gray-500">
                  Status
                </label>
                <div className="flex h-12 bg-[#F4F5F7] rounded-[8px] p-1 border border-gray-100 overflow-hidden shadow-inner">
                  <button
                    onClick={() => setIsActive(true)}
                    className={`flex-1 rounded-[6px] text-[13px] font-bold transition-all ${isActive ? "bg-[#136FB6] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setIsActive(false)}
                    className={`flex-1 rounded-[6px] text-[13px] font-bold transition-all ${!isActive ? "bg-[#136FB6] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    In-Active
                  </button>
                </div>
              </div>
            </div>

            <Button className="bg-[#136FB6] hover:bg-[#105E9A] text-white h-11 px-8 rounded-lg text-[13px] font-bold shadow-md shadow-[#136FB6]/20 flex items-center gap-2">
              <Plus size={18} strokeWidth={3} />
              Create
            </Button>
          </CardContent>
        </Card>

        {/* Table list */}
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden bg-white rounded-[16px]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#CFE1EE] hover:bg-[#CFE1EE] border-none">
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 w-[60px] border-r border-white/60">
                      S No.
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 border-r border-white/60">
                      User Id
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 border-r border-white/60">
                      User Name
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 border-r border-white/60">
                      Mobile No.
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 border-r border-white/60">
                      Email
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 border-r border-white/60">
                      Status
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 w-[120px] text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50"
                    >
                      <TableCell className="text-[12px] text-gray-900 py-4 px-4 font-medium">
                        {row.id}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.userId}
                      </TableCell>
                      <TableCell className="text-[12px] font-bold text-[#136FB6] py-4">
                        {row.userName}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.mobile}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium">
                        {row.email}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4 font-medium tracking-wide">
                        {row.status}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Button className="h-8 px-6 bg-[#136FB6] hover:bg-[#105E9A] text-white text-[11px] font-bold rounded-md">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
