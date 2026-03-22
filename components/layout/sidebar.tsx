"use client";

import {
  ClipboardList,
  FileText,
  FileUp,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Monitor,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: SidebarItem[] = [
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
  { label: "GIS MAP", href: "/gis-map", icon: <Monitor size={20} /> },
  { label: "Reports", href: "/reports", icon: <FileText size={20} /> },
  { label: "Agreement", href: "/agreement", icon: <Globe size={20} /> },
  { label: "Pictures", href: "/pictures", icon: <ImageIcon size={20} /> },
  { label: "Update", href: "/update", icon: <FileUp size={20} /> },
  { label: "Status", href: "/status", icon: <ListTodo size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("mock_user"); // Cleanup just in case
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_role");
      document.cookie = "admin_token=; path=/; max-age=0; SameSite=Lax";
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-50 flex flex-col">
      {/* Logo */}
      <div className="flex-none">
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-8">
          <div className="relative w-[60px] h-[60px]">
            <Image
              src="/logo.png"
              alt="Jal Jeevan Mission Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-[14px] font-bold text-[#1a2b3c] text-center tracking-wide leading-tight mt-1">
            Jal Jeevan Mission
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="space-y-1.5 pt-2">
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

      {/* Bottom Section: Logout */}
      <div className="flex-none p-4 pb-6 bg-white mt-auto">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="gap-3 flex justify-start w-full text-[#64748B] hover:text-[#136FB6] hover:bg-[#DFEEF9] rounded-lg font-bold text-[13px] py-6"
        >
          <LogOut size={20} />
          Logout
        </Button>
      </div>
    </aside>
  );
}
