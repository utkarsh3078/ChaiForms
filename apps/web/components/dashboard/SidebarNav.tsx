"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconListDetails,
  IconChartBar,
  IconUsers,
  IconSettings,
  IconLayoutDashboard,
  IconInbox,
} from "@tabler/icons-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "~/components/ui/sidebar";

export function SidebarNav() {
  const pathname = usePathname();

  const items = [
    { title: "Dashboard", url: "/dashboard", icon: IconLayoutDashboard },
    { title: "Forms", url: "/dashboard/forms", icon: IconListDetails },
    { title: "Analytics", url: "/dashboard/analytics", icon: IconChartBar },
    { title: "Responses", url: "/dashboard/responses", icon: IconInbox },
    { title: "Templates", url: "/dashboard/templates", icon: IconUsers },
    { title: "Settings", url: "/dashboard/settings", icon: IconSettings },
  ];

  return (
    <nav aria-label="Main" className="px-2">
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
            >
              <Link href={item.url} className="flex items-center gap-3">
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}

export default SidebarNav;
