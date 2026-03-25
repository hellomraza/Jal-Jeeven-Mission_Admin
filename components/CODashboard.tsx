"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ContractorDashboardDto } from "@/services/dashboardService";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface CODashboardProps {
  stats: ContractorDashboardDto;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "text-yellow-600";
    case "IN_PROGRESS":
      return "text-blue-600";
    case "COMPLETED":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PENDING":
      return <AlertCircle className="w-4 h-4" />;
    case "IN_PROGRESS":
      return <Clock className="w-4 h-4" />;
    case "COMPLETED":
      return <CheckCircle2 className="w-4 h-4" />;
    default:
      return null;
  }
};

export default function CODashboard({ stats }: CODashboardProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-[24px] font-bold text-[#1a2b3c]">My Work Items</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          <span className="font-bold text-[#1a2b3c]">
            {stats.totalWorkItems}
          </span>{" "}
          work items assigned
        </p>
      </div>

      {/* Work Items Cards Grid */}
      {stats.workItems.length === 0 ? (
        <Card className="border border-gray-200 shadow-none bg-white">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <p className="text-[13px] text-gray-500 font-medium">
              No work items assigned yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.workItems.map((item) => (
            <Card
              key={item.id}
              className="border border-gray-200 shadow-none bg-white hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4 space-y-3">
                {/* Code and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      Code
                    </p>
                    <p className="text-[13px] font-bold text-[#1a2b3c] mt-0.5">
                      {item.work_code}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${getStatusColor(item.status)} bg-gray-100`}
                  >
                    {getStatusIcon(item.status)}
                    {item.status}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Title
                  </p>
                  <p className="text-[12px] text-gray-700 mt-0.5 line-clamp-2">
                    {item.title}
                  </p>
                </div>

                {/* Component Stats */}
                <div className="bg-gray-50 rounded p-2.5 space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                    Components
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-bold text-[#1a2b3c] ml-1">
                        {item.componentStats.pending}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">In Progress:</span>
                      <span className="font-bold text-[#1a2b3c] ml-1">
                        {item.componentStats.inProgress}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Approved:</span>
                      <span className="font-bold text-[#1a2b3c] ml-1">
                        {item.componentStats.approved}
                      </span>
                    </div>
                    {item.componentStats.rejected > 0 && (
                      <div>
                        <span className="text-gray-600">Rejected:</span>
                        <span className="font-bold text-[#1a2b3c] ml-1">
                          {item.componentStats.rejected}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Employees */}
                <div className="border-t border-gray-200 pt-2">
                  <p className="text-[11px] font-bold text-gray-700">
                    👥{" "}
                    <span className="font-bold text-[#1a2b3c]">
                      {item.assignedEmployees}
                    </span>{" "}
                    employees assigned
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
