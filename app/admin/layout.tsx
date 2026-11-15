"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { isUserAdmin } from "@/lib/admin";

export default function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  // Use React Query to check admin status
  const {
    data: isAdmin = false,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      try {
        const adminStatus = await isUserAdmin();
        return adminStatus;
      } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // Redirect non-admin users
  React.useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isLoading, isAdmin, router]);

  // Loading state with Skeleton
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="mx-auto h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  // If not admin, don't render anything (redirect is happening)
  if (!isAdmin || isError) {
    return null;
  }

  // Admin user - render the layout
  return (
    <SidebarProvider
      defaultOpen={true}
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
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
