"use client";

import * as React from "react";
import { useEffect } from "react";
import { ChevronsUpDown, ShoppingBagIcon, UserCircle2Icon, Check, Lock } from "lucide-react";
import { PlusIcon } from "@radix-ui/react-icons";
import { usePathname, useRouter } from "next/navigation";
import { useIsTablet } from "@/hooks/use-mobile";
import { useWorkspace } from "@/hooks/use-workspace";
import { useWorkspaceContext } from "@/lib/workspace-context";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "@/components/layout/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useIsTablet();
  const { data: workspace, isLoading } = useWorkspace();
  const {
    workspaceList,
    activeWorkspaceId,
    setActiveWorkspace,
    isAppAdmin,
    isImpersonating,
    loading: contextLoading
  } = useWorkspaceContext();

  const handleWorkspaceSwitch = (workspaceId: string) => {
    setActiveWorkspace(workspaceId); // Updates context + sessionStorage
    router.refresh(); // Refresh all queries
  };

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);

  useEffect(() => {
    setOpen(!isTablet);
  }, [isTablet]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="hover:text-foreground h-10 group-data-[collapsible=icon]:px-0! hover:bg-[var(--primary)]/5">
                  <Logo />
                  <span className="font-semibold">NCAT SaaS</span>
                  <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="mt-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel>
                  {isAppAdmin ? "All Workspaces (Admin)" : "Your Workspaces"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {contextLoading || isLoading ? (
                  <DropdownMenuItem className="flex items-center gap-3">
                    <UserCircle2Icon className="text-muted-foreground size-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Loading...</span>
                      <span className="text-muted-foreground text-xs">Please wait</span>
                    </div>
                  </DropdownMenuItem>
                ) : workspaceList.length > 0 ? (
                  <>
                    {workspaceList.map((ws) => {
                      const isActive = activeWorkspaceId === ws.id;
                      // Check if admin is viewing a workspace they're not a member of
                      const isImpersonatingThis = isAppAdmin && workspace?.id !== ws.id && activeWorkspaceId !== ws.id;

                      return (
                        <DropdownMenuItem
                          key={ws.id}
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleWorkspaceSwitch(ws.id)}
                        >
                          {isImpersonatingThis ? (
                            <Lock className="text-yellow-600 size-3" />
                          ) : (
                            <UserCircle2Icon className="text-muted-foreground size-4" />
                          )}
                          <div className="flex flex-col flex-1">
                            <span className="text-sm font-medium">{ws.name}</span>
                            {isActive && isImpersonating && (
                              <span className="text-yellow-600 text-xs">🔐 Viewing</span>
                            )}
                          </div>
                          {isActive && <Check className="size-4 text-primary" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                ) : (
                  <DropdownMenuItem className="flex items-center gap-3">
                    <UserCircle2Icon className="text-muted-foreground size-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">No Organization</span>
                      <span className="text-muted-foreground text-xs">Setup required</span>
                    </div>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
