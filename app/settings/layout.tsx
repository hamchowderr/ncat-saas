import React from "react";
import { cookies } from "next/headers";
import { SidebarNav } from "./sidebar-nav";
import { generateMeta } from "@/lib/utils";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import { SettingsHeader } from "./settings-header";

export async function generateMetadata() {
  return generateMeta({
    title: "Settings Page",
    description:
      "Example of settings page and form created using react-hook-form and Zod validator. Built with Tailwind CSS and React.",
    canonical: "/pages/settings"
  });
}

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/profile"
  },
  {
    title: "Account",
    href: "/settings/account"
  },
  {
    title: "Billing",
    href: "/billing"
  },
  {
    title: "Appearance",
    href: "/settings/appearance"
  },
  {
    title: "Display",
    href: "/settings/display"
  }
];

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen =
    cookieStore.get("sidebar_state")?.value === "true" ||
    cookieStore.get("sidebar_state") === undefined;

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)"
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main p-4 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
            <SettingsHeader />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-6">
              <div className="flex-1 lg:max-w-2xl">{children}</div>
              <aside className="lg:w-1/5">
                <SidebarNav items={sidebarNavItems} />
              </aside>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
