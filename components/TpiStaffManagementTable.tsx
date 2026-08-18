"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Plus, Search, Users } from "lucide-react";
import React, { useState } from "react";
import CreateTpiStaffDialog from "./CreateTpiStaffDialog";
import EditTpiStaffDialog from "./EditTpiStaffDialog";

interface TpiStaffManagementTableProps {
  staffList: any[];
}

export default function TpiStaffManagementTable({
  staffList,
}: TpiStaffManagementTableProps) {
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredStaff = staffList.filter((s) => {
    return (
      !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-extrabold text-[#1a2b3c] tracking-tight">
              TPI Field Staff Management
            </h2>
            <p className="text-[12px] text-gray-500 font-medium mt-0.5">
              Manage inspection personnel who capture baseline reference photos on mobile
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-white font-bold text-[12px] h-10 px-6 rounded-lg flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} className="stroke-[2.5]" />
            Add Staff Member
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              placeholder="Search staff by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-[12px] bg-[#F9FAFB] border-gray-100 rounded-lg"
            />
          </div>
        </div>

        {/* Table */}
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Users size={36} className="text-gray-300 mb-2" />
                <p className="text-[14px] font-bold text-gray-700">
                  No staff members found
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  Click "Add Staff Member" to register your agency's field inspectors
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                        S No.
                      </TableHead>
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                        Full Name
                      </TableHead>
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                        Email (Mobile Login)
                      </TableHead>
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                        Created At
                      </TableHead>
                      <TableHead className="text-[12px] font-bold text-[#1a2b3c] text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff, idx) => (
                      <TableRow
                        key={staff.id}
                        className="border-gray-50 hover:bg-gray-50/50"
                      >
                        <TableCell className="text-[12px] text-gray-900 font-medium">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="text-[13px] font-bold text-[#1a2b3c]">
                          {staff.name}
                        </TableCell>
                        <TableCell className="text-[13px] text-gray-600">
                          {staff.email}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-400">
                          {staff.created_at
                            ? new Date(staff.created_at).toLocaleDateString()
                            : "---"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-[11px] font-bold text-[#136FB6] border-[#136FB6]/20 hover:bg-[#DFEEF9]"
                            onClick={() => {
                              setSelectedStaff(staff);
                              setIsEditOpen(true);
                            }}
                          >
                            <Edit size={13} className="mr-1" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateTpiStaffDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
      <EditTpiStaffDialog
        staff={selectedStaff}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}
