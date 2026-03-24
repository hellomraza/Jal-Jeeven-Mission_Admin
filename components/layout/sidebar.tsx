"use client";

import { ClipboardList, Globe, LayoutDashboard, ListTodo } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import LogoutButton from "../LogoutButtton";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const menuItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Work Order",
    href: "/work-order",
    icon: <ClipboardList size={20} />,
  },
  // { label: "GIS MAP", href: "/gis-map", icon: <Monitor size={20} /> },
  // { label: "Reports", href: "/reports", icon: <FileText size={20} /> },
  { label: "Agreement", href: "/agreement", icon: <Globe size={20} /> },
  // { label: "Pictures", href: "/pictures", icon: <ImageIcon size={20} /> },
  // { label: "Update", href: "/update", icon: <FileUp size={20} /> },
  { label: "Status", href: "/status", icon: <ListTodo size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 h-full  bg-white border-r border-gray-100 flex flex-col p-4">
      <div className="flex-1 h-full overflow-hidden">
        <ScrollArea className="h-full  flex-1">
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-[13px] mx-auto w-full font-bold transition-colors ${
                    isActive
                      ? "bg-[#DFEEF9] text-[#136FB6]"
                      : "text-[#475569] hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={isActive ? "text-[#136FB6]" : "text-[#64748B]"}
                  >
                    {item.icon}
                  </div>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <LogoutButton />
    </aside>
  );
}
