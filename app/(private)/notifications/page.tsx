"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  BellRing,
  Info,
  CheckCircle,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const [dummyNotifications, setDummyNotifications] = useState([
    {
      id: 1,
      type: "info",
      title: "New Project Assigned",
      message:
        "You have been assigned to the New Jal Project in Balrampur region.",
      time: "10 mins ago",
      read: false,
    },
    {
      id: 2,
      type: "success",
      title: "Status Update",
      message:
        "Contractor Om Shree Enterprises has updated their physical progress.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "alert",
      title: "Urgent Attention Needed",
      message: "Dispute at village level reported for Work Code W467222300694.",
      time: "Yesterday",
      read: true,
    },
    {
      id: 4,
      type: "info",
      title: "Agreement Finalized",
      message: "Agreement No 204 has been successfully finalized.",
      time: "Yesterday",
      read: true,
    },
    {
      id: 5,
      type: "success",
      title: "File Uploaded",
      message:
        "Site verification pictures uploaded for Chilomakhurd panchayat.",
      time: "2 days ago",
      read: true,
    },
  ]);

  const handleMarkAllAsRead = () => {
    setDummyNotifications(
      dummyNotifications.map((notif) => ({ ...notif, read: true })),
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-emerald-500" size={20} />;
      case "alert":
        return <AlertTriangle className="text-amber-500" size={20} />;
      default:
        return <Info className="text-[#136FB6]" size={20} />;
    }
  };

  const getBgColor = (read: boolean) => {
    return read ? "bg-white" : "bg-[#DFEEF9]/30";
  };

  const filteredNotifications = dummyNotifications.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-[#DFEEF9] p-2 rounded-lg">
              <BellRing className="text-[#136FB6]" size={20} />
            </div>
            <h2 className="text-[16px] font-bold text-[#1a2b3c]">
              Notifications
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            <div className="relative flex-1 sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-[280px] bg-[#F9FAFB] border-gray-100 text-[13px] h-10 shadow-none focus-visible:ring-1 focus-visible:ring-[#136FB6]/30"
              />
            </div>

            <Button
              onClick={handleMarkAllAsRead}
              className="bg-white border hover:bg-gray-50 text-[#64748B] border-gray-200 h-10 px-4 rounded-lg text-[12px] font-bold shadow-sm whitespace-nowrap hidden sm:flex items-center gap-2"
            >
              <Check size={16} />
              Mark all read
            </Button>

            {/* Mobile icon-only button */}
            <Button
              onClick={handleMarkAllAsRead}
              className="bg-white border hover:bg-gray-50 text-[#64748B] border-gray-200 h-10 w-10 p-0 rounded-lg shadow-sm sm:hidden"
            >
              <Check size={18} />
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden bg-transparent">
          <CardContent className="p-0 space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`${getBgColor(notif.read)} rounded-[16px] p-5 border border-gray-100/50 hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-start`}
                >
                  <div className="mt-1 bg-white p-2 rounded-full shadow-sm">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-[14px] font-bold text-[#1a2b3c] leading-none mb-1.5">
                        {notif.title}
                      </h4>
                      <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="h-2 w-2 rounded-full bg-[#136FB6] mt-2 self-start animate-pulse"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[16px] p-10 text-center border border-gray-100/50">
                <BellRing className="mx-auto text-gray-300 mb-3" size={32} />
                <h3 className="text-[15px] font-bold text-gray-800">
                  No notifications found
                </h3>
                <p className="text-[13px] text-gray-400 font-medium mt-1">
                  We couldn&apos;t find any matches for your search.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
