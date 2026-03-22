"use client";

import type React from "react";
import { Suspense } from "react";
import Header from "./header";
import Sidebar from "./sidebar";

/**
 * DashboardLayout - Protected by middleware
 *
 * SECURITY NOTES:
 * - Route protection happens in middleware.ts (server-side)
 * - No client-side localStorage checks needed
 * - Middleware redirects unauthenticated users BEFORE this component renders
 * - This provides protection even if JavaScript is disabled
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Sidebar (fixed) */}
      <Suspense fallback={<div className="w-64 bg-white border-r h-full" />}>
        <Sidebar />
      </Suspense>

      {/* Content */}
      <div className="flex flex-col min-h-screen md:ml-64">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
