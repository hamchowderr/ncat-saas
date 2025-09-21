"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { Bell, CreditCard, LogOut, UserCircle2Icon, MonitorIcon, PaletteIcon, BadgeCheck } from "lucide-react";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';

const userData = {
  name: "Toby Belhome",
  email: "hello@tobybelhome.com",
  avatar: "https://bundui-images.netlify.app/avatars/01.png"
};

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { user, loading } = useUser();

  // Debug user data
  React.useEffect(() => {
    if (user) {
      console.log('User data in sidebar:', user);
      console.log('Avatar URL:', user.user_metadata?.avatar_url);
      console.log('User metadata:', user.user_metadata);
    }
  }, [user]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="rounded-full">
                <AvatarImage src={user?.user_metadata?.avatar_url || userData.avatar} alt={user?.user_metadata?.full_name || user?.email} />
                <AvatarFallback className="rounded-lg">{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</span>
                <span className="text-muted-foreground truncate text-xs">{user?.email || 'No email'}</span>
              </div>
              <DotsVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.user_metadata?.avatar_url || userData.avatar} alt={user?.user_metadata?.full_name || user?.email} />
                  <AvatarFallback className="rounded-lg">{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</span>
                  <span className="text-muted-foreground truncate text-xs">{user?.email || 'No email'}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">
                  <UserCircle2Icon />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/account">
                  <BadgeCheck />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/appearance">
                  <PaletteIcon />
                  Appearance
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/notifications">
                  <Bell />
                  Notifications
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/display">
                  <MonitorIcon />
                  Display
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
