"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "../LogoutButtton";
import { menuItems } from "./sidebar";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
