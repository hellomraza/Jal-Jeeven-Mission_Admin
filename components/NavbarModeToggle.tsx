"use client";

import { switchAppModeAction } from "@/actions/modeAction";
import { useAppMode } from "@/components/mode-context";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/usertypes";
import { ArrowLeftRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarModeToggleProps {
  userRole?: string;
  isExecutiveEngineer?: boolean;
}

export default function NavbarModeToggle({
  userRole,
  isExecutiveEngineer,
}: NavbarModeToggleProps) {
  const { mode, setMode } = useAppMode();
  const router = useRouter();

  const handleModeChange = async (newMode: any) => {
    setMode(newMode);
    try {
      await switchAppModeAction(newMode);
    } catch {
      // continue to reload
    }
    window.location.reload();
  };

  if (userRole === UserRole.HeadOfficer) {
    const isTpi = mode === "tpi";
    return (
      <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-sm">
        <button
          type="button"
          onClick={() => handleModeChange("svs")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
            !isTpi
              ? "bg-[#136FB6] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>SVS Mode</span>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("tpi")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
            isTpi
              ? "bg-[#0284C7] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ShieldCheck size={14} />
          <span>TPI Mode</span>
          <Badge className="bg-amber-400 text-amber-950 text-[10px] px-1 py-0 font-bold ml-1">
            New
          </Badge>
        </button>
      </div>
    );
  }

  if (userRole === UserRole.DistrictOfficer && isExecutiveEngineer) {
    const isEE = mode === "ee";
    return (
      <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-sm">
        <button
          type="button"
          onClick={() => handleModeChange("do")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
            !isEE
              ? "bg-[#136FB6] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>DO Mode</span>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("ee")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
            isEE
              ? "bg-purple-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ShieldCheck size={14} />
          <span>Executive Engineer</span>
          <Badge className="bg-purple-200 text-purple-900 text-[10px] px-1 py-0 font-bold ml-1">
            EE
          </Badge>
        </button>
      </div>
    );
  }

  return null;
}
