"use client";

import { useMode } from "@/components/providers/ModeContext";
import { WorkOrderType } from "@/types/usertypes";
import { Building2, Home } from "lucide-react";
import { useEffect } from "react";

export default function ModeSwitch({
  serverCanSwitch,
  serverIsExecutiveEngineer,
  serverRole,
}: {
  serverCanSwitch?: boolean;
  serverIsExecutiveEngineer?: boolean;
  serverRole?: string;
}) {
  const {
    mode,
    setMode,
    canSwitchMode,
    userRole,
    setIsExecutiveEngineer,
    setUserRole,
  } = useMode();

  // Sync server props from Header to ModeContext if provided
  useEffect(() => {
    if (serverIsExecutiveEngineer !== undefined) {
      setIsExecutiveEngineer(serverIsExecutiveEngineer);
      localStorage.setItem(
        "admin_is_executive_engineer",
        String(serverIsExecutiveEngineer),
      );
    }
    if (serverRole !== undefined) {
      setUserRole(serverRole);
      localStorage.setItem("admin_role", serverRole);
    }
  }, [serverIsExecutiveEngineer, serverRole, setIsExecutiveEngineer, setUserRole]);

  const isVisible =
    canSwitchMode ||
    serverCanSwitch ||
    serverRole === "HO" ||
    (serverRole === "DO" && serverIsExecutiveEngineer);

  if (!isVisible) return null;

  return (
    <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-gray-200/80 shadow-xs">
      <button
        type="button"
        onClick={() => setMode(WorkOrderType.SVS)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-extrabold transition-all duration-200 ${
          mode === WorkOrderType.SVS
            ? "bg-white text-[#136FB6] shadow-xs"
            : "text-gray-500 hover:text-gray-800"
        }`}
      >
        <Home
          size={14}
          className={
            mode === WorkOrderType.SVS ? "text-[#136FB6]" : "text-gray-400"
          }
        />
        <span>SVS</span>
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(WorkOrderType.BULK_VILLAGE);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-extrabold transition-all duration-200 ${
          mode === WorkOrderType.BULK_VILLAGE
            ? "bg-[#136FB6] text-white shadow-xs"
            : "text-gray-500 hover:text-gray-800"
        }`}
      >
        <Building2
          size={14}
          className={
            mode === WorkOrderType.BULK_VILLAGE ? "text-white" : "text-gray-400"
          }
        />
        <span>Bulk Village</span>
      </button>
    </div>
  );
}
