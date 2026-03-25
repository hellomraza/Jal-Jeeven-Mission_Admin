"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardStatsDto } from "@/services/dashboardService";
import { Pie, PieChart } from "recharts";

interface HODashboardProps {
  stats: DashboardStatsDto;
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
  employees: {
    label: "Employees",
    color: "#8b5cf6",
  },
  contractors: {
    label: "Contractors",
    color: "#ec4899",
  },
  districtOfficers: {
    label: "District Officers",
    color: "#f59e0b",
  },
  headOffice: {
    label: "Head Office",
    color: "#14b8a6",
  },
};

export default function HODashboard({ stats }: HODashboardProps) {
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
    {
      title: "Total Users",
      value: stats.users.total,
    },
    {
      title: "Total Agreements",
      value: stats.totalAgreements,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-[24px] font-bold text-[#1a2b3c]">Dashboard</h1>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Work Items Pie Chart */}
        <Card className="border border-gray-200 shadow-none bg-white">
          <CardHeader className="border-b border-gray-200 pb-2 pt-3 px-3">
            <CardTitle className="text-[14px] font-bold text-[#1a2b3c]">
              Work Items Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ChartContainer config={chartConfig} className="h-[250px]">
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
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                ></Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Users Pie Chart */}
        <Card className="border border-gray-200 shadow-none bg-white">
          <CardHeader className="border-b border-gray-200 pb-2 pt-3 px-3">
            <CardTitle className="text-[14px] font-bold text-[#1a2b3c]">
              Users Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ChartContainer config={chartConfig} className="h-[250px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={[
                    {
                      name: "Employees",
                      value: stats.users.employees,
                      fill: chartConfig.employees.color,
                    },
                    {
                      name: "Contractors",
                      value: stats.users.contractors,
                      fill: chartConfig.contractors.color,
                    },
                    {
                      name: "District Officers",
                      value: stats.users.districtOfficers,
                      fill: chartConfig.districtOfficers.color,
                    },
                    {
                      name: "Head Office",
                      value: stats.users.headOffice,
                      fill: chartConfig.headOffice.color,
                    },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                ></Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Stats Breakdown */}
      <Card className="border border-gray-200 shadow-none bg-white">
        <CardHeader className="border-b border-gray-200 pb-2 pt-3 px-3">
          <CardTitle className="text-[14px] font-bold text-[#1a2b3c]">
            Users
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-[11px] font-medium text-gray-600">Employees</p>
              <p className="text-[18px] font-bold text-[#1a2b3c] mt-0.5">
                {stats.users.employees}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-600">
                Contractors
              </p>
              <p className="text-[18px] font-bold text-[#1a2b3c] mt-0.5">
                {stats.users.contractors}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-600">Officers</p>
              <p className="text-[18px] font-bold text-[#1a2b3c] mt-0.5">
                {stats.users.districtOfficers}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-600">HQ</p>
              <p className="text-[18px] font-bold text-[#1a2b3c] mt-0.5">
                {stats.users.headOffice}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
