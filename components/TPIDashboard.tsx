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
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface TpiDashboardProps {
  stats: any;
  user: any;
}

export default function TPIDashboard({ stats, user }: TpiDashboardProps) {
  const totalAssignedWorkOrders = stats?.totalAssignedWorkOrders || 0;
  const totalStaff = stats?.totalStaff || 0;
  const totalComponents = stats?.totalComponents || 0;
  const referenceSelectedComponents = stats?.referenceSelectedComponents || 0;
  const referencePendingComponents = stats?.referencePendingComponents || 0;
  const workOrders = stats?.workOrders || [];

  const selectionPercentage =
    totalComponents > 0
      ? Math.round((referenceSelectedComponents / totalComponents) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-[#1a2b3c] via-[#136FB6] to-[#1a2b3c] p-8 text-white shadow-[0_10px_30px_rgba(19,111,182,0.15)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={24} className="text-blue-300" />
              <span className="text-xs font-mono font-bold tracking-widest text-blue-200 uppercase">
                TPI Quality Control Portal
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">
              {user?.name || "TPI Agency"}
            </h1>
            <p className="text-sm text-blue-100/80 mt-1 max-w-xl">
              District: {user?.district?.districtname || "Assigned District"} • User Code: {user?.code || "---"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tpi-staff"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur text-xs font-bold text-white transition-all border border-white/20 flex items-center gap-2"
            >
              <Users size={15} />
              Manage Staff
            </Link>
            <Link
              href="/work-order"
              className="px-4 py-2.5 rounded-xl bg-white text-[#136FB6] hover:bg-blue-50 text-xs font-extrabold transition-all shadow-md flex items-center gap-2"
            >
              <ClipboardList size={15} />
              Bulk Work Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Assigned Work Orders
              </p>
              <h3 className="text-2xl font-extrabold text-[#1a2b3c] mt-1">
                {totalAssignedWorkOrders}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Bulk Village projects</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-[#136FB6]">
              <Building2 size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Active Staff
              </p>
              <h3 className="text-2xl font-extrabold text-[#1a2b3c] mt-1">
                {totalStaff}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Field inspection inspectors</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
              <Users size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                References Selected
              </p>
              <h3 className="text-2xl font-extrabold text-[#1a2b3c] mt-1">
                {referenceSelectedComponents} / {totalComponents}
              </h3>
              <p className="text-[11px] text-green-600 font-bold mt-0.5">
                {selectionPercentage}% Verified
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-green-50 text-green-600">
              <CheckCircle2 size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                References Pending
              </p>
              <h3 className="text-2xl font-extrabold text-[#1a2b3c] mt-1">
                {referencePendingComponents}
              </h3>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                Require reference photo
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <Clock size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Orders Table */}
      <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-extrabold text-[#1a2b3c]">
                Assigned Bulk Village Work Orders
              </h3>
              <p className="text-[12px] text-gray-500">
                Track inspection staff assignment and baseline reference photo selection progress
              </p>
            </div>
          </div>

          {workOrders.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[14px] font-bold text-gray-700">
                No work orders assigned yet
              </p>
              <p className="text-[12px] text-gray-400 mt-1">
                Work orders assigned to your agency by the District Officer will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Work Code
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c]">
                      Location (Village / Block / Panchayat)
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c] text-center">
                      Assigned Staff
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c] text-center">
                      Reference Progress
                    </TableHead>
                    <TableHead className="text-[12px] font-bold text-[#1a2b3c] text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((wo: any) => {
                    const progress =
                      wo.total_components > 0
                        ? Math.round(
                            (wo.reference_selected_components /
                              wo.total_components) *
                              100,
                          )
                        : 0;

                    return (
                      <TableRow
                        key={wo.id}
                        className="border-gray-50 hover:bg-gray-50/50"
                      >
                        <TableCell className="text-[13px] font-bold text-[#1a2b3c]">
                          {wo.work_code || wo.title || "---"}
                        </TableCell>
                        <TableCell className="text-[12px] text-gray-600">
                          {wo.village || "---"}, {wo.block || "---"},{" "}
                          {wo.panchayat || "---"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#136FB6]">
                            <Users size={12} /> {wo.assigned_staff_count} Staff
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-2">
                            <span className="text-[11px] font-bold text-gray-700">
                              {wo.reference_selected_components} /{" "}
                              {wo.total_components}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700">
                              {progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Link
                            href={`/work-order/details/${wo.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#136FB6] hover:bg-[#DFEEF9] transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink size={12} />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
