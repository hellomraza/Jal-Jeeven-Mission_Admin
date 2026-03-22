import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  ClipboardList,
  FileText,
  FileUp,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  ListTodo,
  Monitor,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Work Order",
    href: "/work-order",
    icon: <ClipboardList size={20} />,
  },
  { label: "GIS MAP", href: "/gis-map", icon: <Monitor size={20} /> },
  { label: "Reports", href: "/reports", icon: <FileText size={20} /> },
  { label: "Agreement", href: "/agreement", icon: <Globe size={20} /> },
  { label: "Pictures", href: "/pictures", icon: <ImageIcon size={20} /> },
  { label: "Update", href: "/update", icon: <FileUp size={20} /> },
  { label: "Status", href: "/status", icon: <ListTodo size={20} /> },
];

export async function AppSidebar() {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  console.log("Current pathname in AppSidebar:", pathname);
  return (
    <Sidebar>
      <div className="w-full h-24" />
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            console.log(
              `Rendering menu item: ${pathname}, href: ${item.href}, isActive: ${isActive}`,
            );
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href} className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
