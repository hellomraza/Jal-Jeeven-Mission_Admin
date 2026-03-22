"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { handleLogout } from "@/utils/helper";
import { ChevronDown, LogOut } from "lucide-react";

type HeaderMenuProps = {
  userName: string;
  userRole: string;
};

const HeaderMenu = ({ userName, userRole }: HeaderMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 cursor-pointer group outline-none"
        >
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
          <ChevronDown
            size={16}
            className="text-[#94A3B8] group-hover:text-[#136FB6] transition-colors"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-[12px]">
          {userName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-[#475569] cursor-pointer"
        >
          <LogOut size={16} />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderMenu;
