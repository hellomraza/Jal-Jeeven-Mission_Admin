import { createServerApiClient } from "@/lib/server-api-client";
import { Bell, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import HeaderMenu from "../HeaderMenu";
import MobileNav from "./mobile-nav";

export default async function Header() {
  const apiClient = await createServerApiClient();
  let user = null;
  try {
    const response = await apiClient.get("/users/my-profile");
    user = response.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
  }
  const userName = user?.name || "User";
  const userRole = user?.role || "Role";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 py-2 md:py-4 h-16 md:h-24 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
      {/* Left side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Logo and welcome text - responsive */}
        <div className="flex md:flex-col items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2">
          <div className="relative w-10 h-10 md:w-13.5 md:h-13.5">
            <Image
              src="/logo.png"
              alt="Jal Jeevan Mission Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="hidden md:block text-[14px] font-bold text-[#1a2b3c] text-center tracking-wide leading-tight">
            Jal Jeevan Mission
          </h1>
        </div>
        <h2 className="hidden md:block text-[14px] font-bold text-[#1a2b3c] tracking-wide">
          Welcome {userName.toUpperCase()} ({userRole})
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 md:gap-6 lg:gap-8">
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
        <div className="flex items-center gap-3 md:gap-5">
          <Link href="/notifications" className="relative cursor-pointer">
            <Bell
              size={20}
              className="md:w-6 md:h-6 text-[#64748B] hover:text-[#136FB6] transition-colors"
            />
            <span className="absolute -top-1.5 -right-1.5 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#136FB6] text-[9px] font-bold text-white border-2 border-white">
              5
            </span>
          </Link>

          <div className="hidden md:block h-8 w-px bg-gray-200"></div>

          {/* User Profile */}
          <HeaderMenu userName={userName} userRole={userRole} />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
