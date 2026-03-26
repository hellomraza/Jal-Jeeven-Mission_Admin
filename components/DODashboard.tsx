"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DistrictDashboardDto } from "@/services/dashboardService";
import { Pie, PieChart } from "recharts";

interface DODashboardProps {
  stats: DistrictDashboardDto;
}

const chartConfig = {
  pending: {
    label: "Pending",
    color: "#fbbf24",
  },
  inProgress: {
    label: "In Progress",
    color: "#3b82f6",
  },
  completed: {
    label: "Completed",
    color: "#10b981",
  },
};

export default function DODashboard({ stats }: DODashboardProps) {
  const statsCards = [
    {
      title: "Total Work Items",
      value: stats.workItems.total,
    },
    {
      title: "Pending",
      value: stats.workItems.pending,
    },
    {
      title: "In Progress",
      value: stats.workItems.inProgress,
    },
    {
      title: "Completed",
      value: stats.workItems.completed,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-[24px] font-bold text-[#1a2b3c]">
          {stats.districtName}
        </h1>
      </div>

      {/* Stats Cards and Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats Cards */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {statsCards.map((card, index) => (
            <Card
              key={index}
              className="border border-gray-200 shadow-none bg-white"
            >
              <CardContent className="p-3">
                <p className="text-[11px] font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-[24px] font-bold text-[#1a2b3c] mt-1">
                  {card.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Work Items Pie Chart */}
        <Card className="border border-blue-200 shadow-none bg-blue-50">
          <CardHeader className="border-b border-gray-200 pb-2 pt-3 px-3">
            <CardTitle className="text-[14px] font-bold text-[#1a2b3c]">
              Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ChartContainer config={chartConfig} className="h-[220px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={[
                    {
                      name: "Pending",
                      value: stats.workItems.pending,
                      fill: chartConfig.pending.color,
                    },
                    {
                      name: "In Progress",
                      value: stats.workItems.inProgress,
                      fill: chartConfig.inProgress.color,
                    },
                    {
                      name: "Completed",
                      value: stats.workItems.completed,
                      fill: chartConfig.completed.color,
                    },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, value }) => `${name}: ${value}`}
                ></Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Work Items List */}
      <Card className="border border-gray-200 shadow-none bg-white">
        <CardHeader className="border-b border-gray-200 pb-2 pt-3 px-3">
          <CardTitle className="text-[14px] font-bold text-[#1a2b3c]">
            Work Items
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="text-[11px] font-bold text-[#1a2b3c] px-3 py-2">
                    Code
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-green-700 px-3 py-2">
                    Title
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-green-700 px-3 py-2">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-green-700 px-3 py-2">
                    Progress
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.workItemsList.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-gray-100 hover:bg-gray-50"
                  >
                    <TableCell className="text-[12px] font-medium text-[#1a2b3c] px-3 py-2">
                      {item.work_code}
                    </TableCell>
                    <TableCell className="text-[12px] text-gray-600 px-3 py-2">
                      {item.title}
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded h-1.5">
                          <div
                            className="bg-[#136FB6] h-1.5 rounded"
                            style={{ width: `${item.progress_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-medium text-gray-600 w-8">
                          {item.progress_percentage}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
