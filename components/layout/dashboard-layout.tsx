import type React from "react";
import Header from "./header";
import Sidebar from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <div>
        <Header />
      </div>

      <div className="flex flex-1">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 h-[calc(100vh-6rem)] overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
