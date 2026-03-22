"use client";

import { toast } from "react-toastify";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Users,
  HardHat,
  Building2,
  MapPin,
  Search,
  FileEdit,
  FileText,
  Image as ImageIcon,
  FileBarChart,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import React from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  const [stats, setStats] = React.useState({
    totalDepartment: 0,
    totalWork: 0,
    totalContractor: 0,
    totalVillage: 0,
    totalAgreement: 0,
  });

  const [activeTab, setActiveTab] = React.useState("Districts");

  // Dummy data arrays representing what would be fetched
  const [districts, setDistricts] = React.useState<any[]>([
    { id: 1, name: "Balrampur", workOrders: 25 },
    { id: 2, name: "Ramanujganj", workOrders: 18 },
    { id: 3, name: "Wadrafnagar", workOrders: 32 },
    { id: 4, name: "Pratappur", workOrders: 12 },
  ]);

  const [agreements, setAgreements] = React.useState<any[]>([
    {
      id: 1,
      agreementNo: "204",
      contractor: "Om Shree Enterprises",
      date: "20/01/2023",
      division: "Balrampur",
    },
    {
      id: 2,
      agreementNo: "205",
      contractor: "R.K Constructions",
      date: "21/01/2023",
      division: "Wadrafnagar",
    },
  ]);

  const [workOrders, setWorkOrders] = React.useState<any[]>([
    {
      id: 1,
      workCode: "W467222300694",
      district: "Balrampur",
      block: "Balrampur",
      panchayat: "Kapildeopur",
      scheme: "SVS",
      amount: 48.14,
    },
    {
      id: 2,
      workCode: "W567222300712",
      district: "Ramanujganj",
      block: "Ramchandrapur",
      panchayat: "Sanawal",
      scheme: "MVS",
      amount: 125.6,
    },
  ]);

  React.useEffect(() => {
    const role = localStorage.getItem("user_role") || "Guest";
    setUserRole(role);
    setIsLoading(false);
  }, []);

  const summaryData = [
    {
      title: "Total Agreement",
      value: stats.totalAgreement.toLocaleString(),
      icon: <FileEdit className="text-[#105E9A]" size={24} />,
      bgColor: "bg-[#136FB6]/10",
      link: "/agreement",
    },
    {
      title: "Total Work Order",
      value: stats.totalWork.toLocaleString(),
      icon: <FileText className="text-[#105E9A]" size={24} />,
      bgColor: "bg-[#136FB6]/10",
      link: "/work-order",
    },
    {
      title: "Total Contractor",
      value: stats.totalContractor.toLocaleString(),
      icon: <Users className="text-[#105E9A]" size={24} />,
      bgColor: "bg-[#136FB6]/10",
      link: null,
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#136FB6] mx-auto"></div>
        </div>
      </DashboardLayout>
    );
  }

  const renderHeadOfficerTabs = () => {
    return (
      <div className="mt-8 space-y-6">
        <div className="flex gap-4 border-b border-gray-200">
          {["Districts", "Agreements", "Work Orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-semibold text-[14px] transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-[#136FB6] text-[#136FB6]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden bg-white">
          <CardContent className="p-0">
            {activeTab === "Districts" && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      District Name
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Total Work Orders
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {districts.map((district) => (
                    <TableRow
                      key={district.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                      onClick={() =>
                        router.push(`/work-order?district=${district.name}`)
                      }
                    >
                      <TableCell className="text-[12px] text-gray-900 py-4 font-bold">
                        {district.name}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4">
                        {district.workOrders}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <span className="text-[#136FB6] text-[12px] font-bold hover:underline">
                          View Work Orders
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "Agreements" && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Agreement No
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Contractor
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Division
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agreements.map((agreement) => (
                    <TableRow
                      key={agreement.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => router.push(`/agreement`)}
                    >
                      <TableCell className="text-[12px] text-gray-900 py-4 font-bold">
                        {agreement.agreementNo}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4">
                        {agreement.contractor}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4">
                        {agreement.division}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <span className="text-[#136FB6] text-[12px] font-bold hover:underline">
                          View Details
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "Work Orders" && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#DFEEF9] hover:bg-[#DFEEF9] border-none">
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Work Code
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      District
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12">
                      Scheme
                    </TableHead>
                    <TableHead className="font-bold text-[#1a2b3c] text-[12px] h-12 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((wo) => (
                    <TableRow
                      key={wo.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => router.push(`/work-order`)}
                    >
                      <TableCell className="text-[12px] text-gray-900 py-4 font-bold">
                        {wo.workCode}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4">
                        {wo.district}
                      </TableCell>
                      <TableCell className="text-[12px] text-gray-900 py-4">
                        {wo.scheme}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <span className="text-[#136FB6] text-[12px] font-bold hover:underline">
                          View Work Order
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaryData.map((item, index) => (
            <div
              key={index}
              onClick={() => item.link && router.push(item.link)}
              className={`bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all ${item.link ? "cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]" : ""}`}
            >
              <div>
                <p className="text-[12px] font-bold text-gray-500 mb-1 tracking-wide">
                  {item.title}
                </p>
                <h3 className="text-[26px] font-extrabold text-[#1a2b3c] leading-none tracking-tight">
                  {item.value}
                </h3>
              </div>
              <div
                className={`w-[48px] h-[48px] rounded-full flex items-center justify-center ${item.bgColor}`}
              >
                {item.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Role-Based Content */}
        {userRole === "Head Officer" ? (
          renderHeadOfficerTabs()
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div
              onClick={() => router.push("/agreement")}
              className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all"
            >
              <div className="text-[#136FB6] mb-4">
                <FileEdit size={26} strokeWidth={2.5} />
              </div>
              <h3 className="text-[#136FB6] font-extrabold text-[16px] mb-0.5 tracking-wide">
                Agreement
              </h3>
              <p className="text-gray-500 text-[11px] font-bold tracking-wide">
                Details
              </p>
            </div>

            <div
              onClick={() => router.push("/work-order")}
              className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all"
            >
              <div className="text-[#136FB6] mb-4">
                <FileText size={26} strokeWidth={2.5} />
              </div>
              <h3 className="text-[#136FB6] font-extrabold text-[16px] mb-0.5 tracking-wide">
                Physical Progress
              </h3>
              <p className="text-gray-500 text-[11px] font-bold tracking-wide">
                Details
              </p>
            </div>

            <div
              onClick={() => router.push("/pictures")}
              className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all"
            >
              <div className="text-[#136FB6] mb-4">
                <ImageIcon size={26} strokeWidth={2.5} />
              </div>
              <h3 className="text-[#136FB6] font-extrabold text-[16px] mb-0.5 tracking-wide">
                Pictures
              </h3>
              <p className="text-gray-500 text-[11px] font-bold tracking-wide">
                From GIS App
              </p>
            </div>

            <div
              onClick={() => router.push("/reports")}
              className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all"
            >
              <div className="text-[#136FB6] mb-4">
                <FileBarChart size={26} strokeWidth={2.5} />
              </div>
              <h3 className="text-[#136FB6] font-extrabold text-[16px] mb-0.5 tracking-wide">
                Report
              </h3>
              <p className="text-gray-500 text-[11px] font-bold tracking-wide">
                DO & Contractor Detail
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
