import { createServerApiClient } from "@/lib/server-api-client";
import { Bell, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import HeaderMenu from "../HeaderMenu";

export default async function Header() {
  const apiClient = await createServerApiClient();
  const response = await apiClient.get("/users/my-profile");
  const userName = response.data.name || "User";
  const userRole = response.data.role || "Role";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4 h-24 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
      {/* Left side */}
      <div className="flex items-center">
        <div className="flex flex-col w-3xs items-center justify-center gap-2 px-4 py-2">
          <div className="relative w-13.5 h-13.5">
            <Image
              src="/logo.png"
              alt="Jal Jeevan Mission Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-[14px] font-bold text-[#1a2b3c] text-center tracking-wide leading-tight">
            Jal Jeevan Mission
          </h1>
        </div>
        <h2 className="text-[14px] font-bold text-[#1a2b3c] tracking-wide">
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
          <HeaderMenu userName={userName} userRole={userRole} />
        </div>
      </div>
    </header>
  );
}
