"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { Suspense, useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   const adminToken = localStorage.getItem("admin_token");
  //   setToken(adminToken);
  //   setIsLoading(false);

  //   if (!adminToken) {
  //     toast.error("Please login to access this page");
  //     router.push("/login");
  //   }
  // }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#136FB6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // if (!token) {
  //   return null; // Will redirect
  // }

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
