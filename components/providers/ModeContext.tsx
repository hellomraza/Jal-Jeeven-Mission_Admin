"use client";

import { UserRole, WorkOrderType } from "@/types/usertypes";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ModeContextType {
  mode: WorkOrderType;
  setMode: (mode: WorkOrderType) => void;
  isExecutiveEngineer: boolean;
  canSwitchMode: boolean;
  userRole: string | null;
}

const ModeContext = createContext<ModeContextType>({
  mode: WorkOrderType.SVS,
  setMode: () => {},
  isExecutiveEngineer: false,
  canSwitchMode: false,
  userRole: null,
});

export const useMode = () => useContext(ModeContext);

interface ModeProviderProps {
  children: React.ReactNode;
  initialMode?: WorkOrderType;
  initialRole?: string;
  initialIsExecutiveEngineer?: boolean;
}

export const ModeProvider: React.FC<ModeProviderProps> = ({
  children,
  initialMode = WorkOrderType.SVS,
  initialRole,
  initialIsExecutiveEngineer = false,
}) => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(initialRole || null);
  const [isExecutiveEngineer, setIsExecutiveEngineer] = useState<boolean>(
    initialIsExecutiveEngineer,
  );
  const [mode, setModeState] = useState<WorkOrderType>(initialMode);

  // Sync client profile state if not provided
  useEffect(() => {
    const storedRole = localStorage.getItem("admin_role");
    const storedMode = localStorage.getItem("app_work_order_mode") as WorkOrderType;
    if (storedRole) setUserRole(storedRole);
    if (storedMode && (storedMode === WorkOrderType.SVS || storedMode === WorkOrderType.BULK_VILLAGE)) {
      setModeState(storedMode);
    }
  }, []);

  const canSwitchMode =
    userRole === UserRole.HeadOfficer ||
    userRole === "HO" ||
    ((userRole === UserRole.DistrictOfficer || userRole === "DO") &&
      isExecutiveEngineer);

  // If user cannot switch mode, strictly enforce SVS mode
  useEffect(() => {
    if (userRole && !canSwitchMode && mode === WorkOrderType.BULK_VILLAGE) {
      setMode(WorkOrderType.SVS);
    }
  }, [userRole, canSwitchMode, mode]);

  const setMode = (newMode: WorkOrderType) => {
    if (!canSwitchMode && newMode === WorkOrderType.BULK_VILLAGE) {
      newMode = WorkOrderType.SVS;
    }
    setModeState(newMode);
    localStorage.setItem("app_work_order_mode", newMode);
    document.cookie = `app_work_order_mode=${newMode}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode,
        isExecutiveEngineer,
        canSwitchMode,
        userRole,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};
