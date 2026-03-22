"use client";

import React from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
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

export default function PicturesPage() {
  const table1Data = [
    {
      id: 1,
      contractor: "Swanky Infra State Energy Private Limited",
      pictureType: "1234",
      cPic: 3,
      cApp: 3,
      oPic: 0,
      oApp: 0,
      bPic: 3,
      bApp: 3,
    },
    {
      id: 2,
      contractor: "Chlorinator (In No.)",
      pictureType: "1221",
      cPic: 3,
      cApp: 3,
      oPic: 0,
      oApp: 0,
      bPic: 3,
      bApp: 3,
    },
    {
      id: 3,
      contractor: "Chlorinator (In No.)",
      pictureType: "1221",
      cPic: 3,
      cApp: 3,
      oPic: 0,
      oApp: 0,
      bPic: 3,
      bApp: 3,
    },
    {
      id: 4,
      contractor: "Chlorinator (In No.)",
      pictureType: "1234",
      cPic: 3,
      cApp: 3,
      oPic: 0,
      oApp: 0,
      bPic: 3,
      bApp: 3,
    },
    {
      id: 5,
      contractor: "Chlorinator (In No.)",
      pictureType: "1221",
      cPic: 3,
      cApp: 3,
      oPic: 0,
      oApp: 0,
      bPic: 3,
      bApp: 3,
    },
  ];

  const table2Data = [
    { id: 1, code: "W467222300236", district: "Balrampur" },
    { id: 2, code: "W467222300236", district: "Balrampur" },
    { id: 3, code: "W467222300236", district: "Balrampur" },
    { id: 4, code: "W467222300236", district: "Balrampur" },
    { id: 5, code: "W467222300236", district: "Balrampur" },
  ];

  const CircleBadge = ({ value }: { value: number }) => (
    <div className="mx-auto w-6 h-6 rounded-full bg-[#136FB6] flex items-center justify-center text-white text-[11px] font-bold">
      {value}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <h2 className="text-[16px] font-bold text-[#1a2b3c] px-2">
            Pictures From App
          </h2>

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] bg-[#F9FAFB] border-gray-100 text-[12px] h-9">
              <SelectValue placeholder="Select Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* First Table */}
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden bg-white rounded-[16px]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-none">
                    <TableHead
                      rowSpan={3}
                      className="bg-[#DFEEF9] font-bold text-[#1a2b3c] text-[12px] align-middle w-[60px]"
                    >
                      S No.
                    </TableHead>
                    <TableHead
                      rowSpan={3}
                      className="bg-[#DFEEF9] font-bold text-[#1a2b3c] text-[12px] align-middle w-[250px]"
                    >
                      Contractor
                    </TableHead>
                    <TableHead
                      rowSpan={3}
                      className="bg-[#DFEEF9] font-bold text-[#1a2b3c] text-[12px] align-middle"
                    >
                      Picture Type
                    </TableHead>
                    <TableHead
                      colSpan={6}
                      className="bg-[#136FB6] text-white text-center font-bold text-[12px] h-10 border-b border-white/20"
                    >
                      No. Of Pictures
                    </TableHead>
                    <TableHead
                      rowSpan={3}
                      className="bg-[#DFEEF9] font-bold text-[#1a2b3c] text-[12px] align-middle text-center"
                    >
                      View Map
                    </TableHead>
                  </TableRow>
                  <TableRow className="border-none">
                    <TableHead
                      colSpan={2}
                      className="bg-[#1a2b3c] text-white text-center font-medium text-[11px] h-10 border-r border-white/10"
                    >
                      Uploaded By Contractor
                    </TableHead>
                    <TableHead
                      colSpan={2}
                      className="bg-[#DFEEF9] text-[#1a2b3c] text-center font-medium text-[11px] h-10 border-r border-[#1a2b3c]/10"
                    >
                      Uploaded By Officer
                    </TableHead>
                    <TableHead
                      colSpan={2}
                      className="bg-[#1a2b3c] text-white text-center font-medium text-[11px] h-10"
                    >
                      Uploaded By Both
                    </TableHead>
                  </TableRow>
                  <TableRow className="border-none">
                    <TableHead className="bg-[#1a2b3c] text-white text-center text-[10px] h-10 p-2">
                      No. Of Pictures
                    </TableHead>
                    <TableHead className="bg-[#1a2b3c] text-white text-center text-[10px] h-10 p-2 border-r border-white/10">
                      No. Of Applicant
                    </TableHead>
                    <TableHead className="bg-[#DFEEF9] text-[#1a2b3c] text-center text-[10px] h-10 p-2">
                      No. Of Pictures
                    </TableHead>
                    <TableHead className="bg-[#DFEEF9] text-[#1a2b3c] text-center text-[10px] h-10 p-2 border-r border-[#1a2b3c]/10">
                      No. Of Applicant
                    </TableHead>
                    <TableHead className="bg-[#1a2b3c] text-white text-center text-[10px] h-10 p-2">
                      No. Of Pictures
                    </TableHead>
                    <TableHead className="bg-[#1a2b3c] text-white text-center text-[10px] h-10 p-2">
                      No. Of Applicant
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table1Data.map((row) => (
                    <TableRow
                      key={`t1-${row.id}`}
                      className="border-b border-gray-50 hover:bg-transparent"
                    >
                      <TableCell className="text-[12px] text-gray-900 font-medium py-3 border-r border-gray-50">
                        {row.id}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 font-medium py-3 border-r border-gray-50 pr-4">
                        {row.contractor}
                      </TableCell>
                      <TableCell className="text-[12px] font-semibold text-[#136FB6] py-3">
                        {row.pictureType}
                      </TableCell>

                      {/* Contractor Data */}
                      <TableCell className="bg-[#1a2b3c] border-r border-white/5 py-3">
                        <CircleBadge value={row.cPic} />
                      </TableCell>
                      <TableCell className="bg-[#1a2b3c] border-r border-white/10 py-3">
                        <CircleBadge value={row.cApp} />
                      </TableCell>

                      {/* Officer Data */}
                      <TableCell className="bg-[#f8fafc] border-r border-gray-100 py-3">
                        <CircleBadge value={row.oPic} />
                      </TableCell>
                      <TableCell className="bg-[#f8fafc] border-r border-[#1a2b3c]/10 py-3">
                        <CircleBadge value={row.oApp} />
                      </TableCell>

                      {/* Both Data */}
                      <TableCell className="bg-[#1a2b3c] border-r border-white/5 py-3">
                        <CircleBadge value={row.bPic} />
                      </TableCell>
                      <TableCell className="bg-[#1a2b3c] py-3">
                        <CircleBadge value={row.bApp} />
                      </TableCell>

                      <TableCell className="text-center py-3 pl-4">
                        <Button className="h-7 px-4 bg-[#136FB6] hover:bg-[#105E9A] text-white text-[11px] font-bold rounded-md">
                          View Map
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Second Table Card */}
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden bg-white rounded-[16px] mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 pb-4">
            <h2 className="text-[15px] font-bold text-[#1a2b3c]">
              No. Of Pictures - Uploaded By Both
            </h2>
            <input
              type="text"
              placeholder="Search"
              className="w-[180px] px-3 py-1.5 text-[12px] border border-gray-100 rounded-md bg-[#F9FAFB] outline-none focus:border-[#136FB6]/30 transition-colors"
            />
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-11 w-[80px]">
                      S No.
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-11">
                      Id
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-11">
                      WorkCode
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-11">
                      District
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-11 w-[120px] text-center">
                      View Pictures
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-11 w-[120px] text-center">
                      View Map
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table2Data.map((row) => (
                    <TableRow
                      key={`t2-${row.id}`}
                      className="border-b border-gray-50 hover:bg-gray-50/50"
                    >
                      <TableCell className="text-[12px] text-gray-900 py-3.5 font-medium">
                        {row.id}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-3.5 font-medium">
                        {row.code}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-3.5 font-medium">
                        {row.code}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-3.5 font-medium">
                        {row.district}
                      </TableCell>
                      <TableCell className="text-center py-3.5">
                        <Button className="h-7 px-6 bg-[#136FB6] hover:bg-[#105E9A] text-white text-[11px] font-bold rounded-md">
                          View
                        </Button>
                      </TableCell>
                      <TableCell className="text-center py-3.5">
                        <Button className="h-7 px-5 bg-[#136FB6] hover:bg-[#105E9A] text-white text-[11px] font-bold rounded-md">
                          View Map
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
