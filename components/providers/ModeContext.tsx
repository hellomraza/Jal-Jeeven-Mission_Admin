"use client";

import { getUserInfo } from "@/services/userService";
import { UserRole, WorkOrderType } from "@/types/usertypes";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ModeContextType {
  mode: WorkOrderType;
  setMode: (mode: WorkOrderType) => void;
  isBulkOrderAllowed: boolean;
  setIsBulkOrderAllowed: (allowed: boolean) => void;
  canSwitchMode: boolean;
  userRole: string | null;
  setUserRole: (role: string | null) => void;
}

const ModeContext = createContext<ModeContextType>({
  mode: WorkOrderType.SVS,
  setMode: () => {},
  isBulkOrderAllowed: false,
  setIsBulkOrderAllowed: () => {},
  canSwitchMode: false,
  userRole: null,
  setUserRole: () => {},
});

export const useMode = () => useContext(ModeContext);

interface ModeProviderProps {
  children: React.ReactNode;
  initialMode?: WorkOrderType;
  initialRole?: string;
  initialIsBulkOrderAllowed?: boolean;
}

export const ModeProvider: React.FC<ModeProviderProps> = ({
  children,
  initialMode = WorkOrderType.SVS,
  initialRole,
  initialIsBulkOrderAllowed = false,
}) => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(initialRole || null);
  const [isBulkOrderAllowed, setIsBulkOrderAllowed] = useState<boolean>(
    initialIsBulkOrderAllowed,
  );
  const [mode, setModeState] = useState<WorkOrderType>(initialMode);

  // Sync client profile state and load profile from server
  useEffect(() => {
    const storedRole = localStorage.getItem("admin_role");
    const storedBulk = localStorage.getItem("admin_is_bulk_order_allowed");
    const storedMode = localStorage.getItem(
      "app_work_order_mode",
    ) as WorkOrderType;

    if (storedRole) setUserRole(storedRole);
    if (storedBulk !== null) {
      setIsBulkOrderAllowed(storedBulk === "true");
    }
    if (
      storedMode &&
      (storedMode === WorkOrderType.SVS ||
        storedMode === WorkOrderType.BULK_VILLAGE)
    ) {
      setModeState(storedMode);
    }

    // Always fetch latest user profile to keep isBulkOrderAllowed and role fresh
    getUserInfo()
      .then((user) => {
        if (user) {
          if (user.role) {
            setUserRole(user.role);
            localStorage.setItem("admin_role", user.role);
          }
          const isAllowed = Boolean(user.is_bulk_order_allowed);
          setIsBulkOrderAllowed(isAllowed);
          localStorage.setItem("admin_is_bulk_order_allowed", String(isAllowed));
        }
      })
      .catch((err) => {
        console.error("Failed to load user profile in ModeProvider:", err);
      });
  }, []);

  const canSwitchMode =
    userRole === UserRole.HeadOfficer ||
    userRole === "HO" ||
    ((userRole === UserRole.DistrictOfficer || userRole === "DO") &&
      Boolean(isBulkOrderAllowed));

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
        isBulkOrderAllowed,
        setIsBulkOrderAllowed,
        canSwitchMode,
        userRole,
        setUserRole,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};
