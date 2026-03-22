"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell } from "lucide-react";

export default function Header() {
  const [userName, setUserName] = useState("District Officer");
  const [userRole, setUserRole] = useState("DO");

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const role = localStorage.getItem("user_role");
    if (name) setUserName(name);
    if (role) setUserRole(role);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4 h-20 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
      {/* Left side */}
      <div className="flex items-center">
        <h2 className="text-[14px] font-bold text-[#1a2b3c] tracking-wide ml-2 md:ml-4">
          Welcome {userName.toUpperCase()} ({userRole})
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6 md:gap-8">
        {/* Search */}
        <div className="hidden md:flex relative items-center">
          <Search className="absolute left-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="w-[280px] h-[38px] pl-10 pr-4 rounded-[8px] bg-[#FAFAFA] text-[13px] border border-gray-100 outline-none focus:border-[#136FB6]/30 transition-all text-gray-700"
          />
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-5">
          <Link href="/notifications" className="relative cursor-pointer">
            <Bell
              size={22}
              className="text-[#64748B] hover:text-[#136FB6] transition-colors"
            />
            <span className="absolute -top-1.5 -right-1.5 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#136FB6] text-[9px] font-bold text-white border-2 border-white">
              5
            </span>
          </Link>

          <div className="h-8 w-px bg-gray-200"></div>

          {/* User Profile */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-bold text-[#1a2b3c] group-hover:text-[#136FB6] transition-colors leading-none tracking-wide">
                {userName}
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide mt-1">
                {userRole}
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E2E8F0] text-[#475569] font-bold shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
