"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

interface EEDashboardProps {
  stats?: any;
  user?: any;
}

export default function EEDashboard({ stats, user }: EEDashboardProps) {
  const districtName = user?.district?.districtname || "Assigned District";

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#DFEEF9] text-[#136FB6] tracking-wide uppercase">
              Executive Engineer
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-xs font-semibold text-gray-500">
              {districtName}
            </span>
          </div>
          <h1 className="text-[24px] font-bold text-[#1a2b3c]">
            Executive Engineer Dashboard
          </h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">
            Welcome to your executive dashboard overview.
          </p>
        </div>
      </div>

      {/* Empty State Card */}
      <Card className="border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] bg-white">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#DFEEF9]/60 flex items-center justify-center text-[#136FB6] mb-4">
            <UserCheck size={32} />
          </div>
          <h2 className="text-[18px] font-bold text-[#1a2b3c]">
            Executive Workspace
          </h2>
          <p className="text-[13px] text-gray-500 max-w-md mt-2">
            Your dashboard metrics and executive management features are currently being configured. They will appear here once activated.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
