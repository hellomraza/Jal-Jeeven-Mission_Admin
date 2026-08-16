"use client";

import { switchAppModeAction } from "@/actions/modeAction";
import React, { createContext, useContext, useEffect, useState } from "react";

export type AppMode = "svs" | "tpi" | "do" | "ee";

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: (role?: string) => void;
  isTpiMode: boolean; // true if HO is in 'tpi' mode or DO is in 'ee' mode
  isEeMode: boolean; // true if DO is in 'ee' mode
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("svs");

  useEffect(() => {
    const saved = localStorage.getItem("admin_app_mode") as AppMode;
    if (saved && ["svs", "tpi", "do", "ee"].includes(saved)) {
      setModeState(saved);
      document.cookie = `admin_app_mode=${saved}; path=/; max-age=31536000`;
    }
  }, []);

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem("admin_app_mode", newMode);
    document.cookie = `admin_app_mode=${newMode}; path=/; max-age=31536000`;
    // Dispatch storage event for other components
    window.dispatchEvent(new Event("admin_app_mode_changed"));
    switchAppModeAction(newMode).catch(() => {});
  };

  const toggleMode = (role?: string) => {
    if (role === "HO") {
      setMode(mode === "tpi" ? "svs" : "tpi");
    } else if (role === "DO") {
      setMode(mode === "ee" ? "do" : "ee");
    }
  };

  const isTpiMode = mode === "tpi" || mode === "ee";
  const isEeMode = mode === "ee";

  return (
    <ModeContext.Provider
      value={{ mode, setMode, toggleMode, isTpiMode, isEeMode }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(ModeContext);
  if (!context) {
    // Fallback if not wrapped
    return {
      mode: "svs" as AppMode,
      setMode: () => {},
      toggleMode: () => {},
      isTpiMode: false,
      isEeMode: false,
    };
  }
  return context;
}
