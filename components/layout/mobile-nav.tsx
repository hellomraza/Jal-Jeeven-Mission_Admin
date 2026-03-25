"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ClipboardList, Globe, LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "../LogoutButtton";

export interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const getMenuItems = (userRole?: string): MobileNavItem[] => {
  const baseItems: MobileNavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      roles: ["Head Officer", "District Officer"],
    },
    {
      label: "Work Order",
      href: "/work-order",
      icon: <ClipboardList size={20} />,
    },
    { label: "Agreement", href: "/agreement", icon: <Globe size={20} /> },
  ];

  return baseItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole || "");
  });
};

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>();
  const pathname = usePathname();

  useEffect(() => {
    const role = localStorage.getItem("admin_role");
    setUserRole(role || undefined);
  }, []);

  const menuItems = getMenuItems(userRole);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={24} className="text-[#1a2b3c]" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-[16px] font-bold text-[#1a2b3c]">Menu</h2>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-1.5 p-4">
                {menuItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-lg text-[13px] w-full font-bold transition-colors ${
                        isActive
                          ? "bg-[#DFEEF9] text-[#136FB6]"
                          : "text-[#475569] hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={
                          isActive ? "text-[#136FB6]" : "text-[#64748B]"
                        }
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

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-100">
            <LogoutButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
