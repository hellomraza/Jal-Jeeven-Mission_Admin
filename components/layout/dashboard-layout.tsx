import type React from "react";
import Header from "./header";
import Sidebar from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen  flex flex-col w-full">
      <div>
        <Header />
      </div>

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 h-[calc(100vh-6rem)] overflow-y-scroll bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
