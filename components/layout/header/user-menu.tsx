'use client'

import { BadgeCheck, Bell, ChevronRightIcon, CreditCard, LogOut, Sparkles, UserCircle2Icon, PaletteIcon, MonitorIcon } from "lucide-react";

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
import Link from "next/link";
import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';

export default function UserMenu() {
  const router = useRouter();
  const { user, loading } = useUser();

  // Debug user data
  React.useEffect(() => {
    if (user) {
      console.log('User data in header:', user);
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
      <Avatar>
        <AvatarFallback className="rounded-lg">...</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage
            src={user?.user_metadata?.avatar_url || `https://bundui-images.netlify.app/avatars/01.png`}
            alt="NCAT SaaS"
          />
          <AvatarFallback className="rounded-lg">{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60" align="end">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar>
              <AvatarImage
                src={user?.user_metadata?.avatar_url || `https://bundui-images.netlify.app/avatars/01.png`}
                alt="NCAT SaaS"
              />
              <AvatarFallback className="rounded-lg">{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</span>
              <span className="text-muted-foreground truncate text-xs">{user?.email || 'No email'}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles /> Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
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
        <div className="bg-muted mt-1.5 rounded-md border">
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Credits</h4>
              <div className="text-muted-foreground flex cursor-pointer items-center text-sm">
                <span>5 left</span>
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </div>
            </div>
            <Progress value={40} indicatorColor="bg-primary" />
            <div className="text-muted-foreground flex items-center text-sm">
              Daily credits used first
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
