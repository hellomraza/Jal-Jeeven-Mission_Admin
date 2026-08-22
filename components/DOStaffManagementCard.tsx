"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Plus, User, UserCheck } from "lucide-react";
import { useState } from "react";
import CreateDOStaffDialog from "./CreateDOStaffDialog";
import EditDOStaffDialog from "./EditDOStaffDialog";

interface DOStaffManagementCardProps {
  staff: any | null;
}

export default function DOStaffManagementCard({
  staff,
}: DOStaffManagementCardProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-[24px] font-bold text-[#1a2b3c]">
              Staff Management
            </h1>
            <p className="text-[13px] text-gray-500 font-medium">
              Manage your district office staff member (1 staff allowed per district)
            </p>
          </div>
          {!staff && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-[#136FB6] hover:bg-[#0d5a8f] text-white flex items-center gap-2"
            >
              <Plus size={16} />
              Create Staff Member
            </Button>
          )}
        </div>

        {!staff ? (
          <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#DFEEF9]/60 flex items-center justify-center text-[#136FB6] mb-3">
                <User size={28} />
              </div>
              <h2 className="text-[16px] font-bold text-[#1a2b3c]">
                No DO Staff Member Created
              </h2>
              <p className="text-[13px] text-gray-500 max-w-sm mt-1">
                You haven't created a staff member for your district office yet. Click the button above to create one.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white overflow-hidden">
            <div className="bg-[#DFEEF9]/30 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#136FB6] text-white flex items-center justify-center font-bold text-sm">
                  {staff.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1a2b3c]">
                    {staff.name}
                  </h3>
                  <p className="text-[12px] text-gray-500 font-mono">
                    Code: {staff.code || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <UserCheck size={12} />
                  Active Staff
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-semibold"
                  onClick={() => setIsEditOpen(true)}
                >
                  Edit Details
                </Button>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase text-gray-400">
                    Email Address
                  </span>
                  <div className="flex items-center gap-2 text-[13px] text-gray-700 font-medium">
                    <Mail size={14} className="text-gray-400" />
                    <span>{staff.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase text-gray-400">
                    Mobile Number
                  </span>
                  <div className="flex items-center gap-2 text-[13px] text-gray-700 font-medium">
                    <Phone size={14} className="text-gray-400" />
                    <span>{staff.mobile || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase text-gray-400">
                    Role
                  </span>
                  <p className="text-[13px] text-gray-700 font-medium">
                    District Office Staff (DO_STAFF)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateDOStaffDialog
        isOpen={isCreateOpen}
        onOpenChange={(v) => setIsCreateOpen(v)}
      />

      <EditDOStaffDialog
        key={isEditOpen ? "open" : "close"}
        staff={staff}
        isOpen={isEditOpen}
        onOpenChange={(v) => setIsEditOpen(v)}
      />
    </>
  );
}
