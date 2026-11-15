"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  ActivityIcon,
  ArchiveRestoreIcon,
  BadgeDollarSignIcon,
  BookOpenIcon,
  BrainCircuitIcon,
  BrainIcon,
  Building2Icon,
  CalendarIcon,
  ChartBarDecreasingIcon,
  ChartPieIcon,
  ChevronRight,
  ClapperboardIcon,
  ClipboardCheckIcon,
  ClipboardMinusIcon,
  ComponentIcon,
  CookieIcon,
  DatabaseIcon,
  FingerprintIcon,
  FolderDotIcon,
  FolderIcon,
  FrameIcon,
  GaugeIcon,
  GraduationCapIcon,
  ImagesIcon,
  KeyIcon,
  LayoutTemplateIcon,
  MailIcon,
  MessageSquareIcon,
  ProportionsIcon,
  SettingsIcon,
  ShoppingBagIcon,
  SquareCheckIcon,
  SquareKanbanIcon,
  StickyNoteIcon,
  UserCircle2Icon,
  UsersIcon,
  VideoIcon,
  WalletMinimalIcon,
  type LucideIcon,
  GithubIcon,
  RedoDotIcon,
  BrushCleaningIcon,
  CreditCardIcon,
  WorkflowIcon,
  BadgeCheck,
  Bell,
  PaletteIcon,
  MonitorIcon,
  ScissorsIcon,
  FilmIcon,
  CameraIcon,
  LibraryIcon,
  SparklesIcon
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { isUserAdmin } from "@/lib/admin";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceConversations, type Conversation } from "@/hooks/use-workspace-conversations";
import { useMemo } from "react";

type NavGroup = {
  title: string;
  items: NavItem;
};

type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  items?: NavItem;
}[];

export const navItems: NavGroup[] = [
  {
    title: "Workspace",
    items: [
      {
        title: "File Manager",
        href: "/workspace",
        icon: FolderIcon
      },
      {
        title: "Files",
        href: "/workspace/files",
        icon: ArchiveRestoreIcon
      },
      {
        title: "Media Tools",
        href: "/workspace/media-tools",
        icon: WorkflowIcon
      },
      {
        title: "Workflows",
        href: "/workspace/workflows",
        icon: ComponentIcon
      },
      {
        title: "Jobs",
        href: "/workspace/jobs",
        icon: ClipboardCheckIcon
      }
    ]
  },
  {
    title: "AI",
    items: [
      { title: "AI Chat", href: "/workspace/ai-chat", icon: SparklesIcon },
      {
        title: "Image Generator",
        href: "/workspace/ai-image-generator",
        icon: ImagesIcon
      }
    ]
  },
  {
    title: "Video Generation",
    items: [
      {
        title: "Stories",
        href: "/workspace/video-generation/stories",
        icon: BookOpenIcon
      },
      {
        title: "Scenes",
        href: "/workspace/video-generation/scenes",
        icon: FilmIcon
      },
      {
        title: "Shots",
        href: "/workspace/video-generation/shots",
        icon: CameraIcon
      },
      {
        title: "Story Types",
        href: "/workspace/video-generation/story-types",
        icon: LayoutTemplateIcon
      }
    ]
  },
  {
    title: "Content Clips",
    items: [
      {
        title: "Videos",
        href: "/workspace/content-clips/videos",
        icon: VideoIcon
      },
      {
        title: "Clips",
        href: "/workspace/content-clips/clips",
        icon: ScissorsIcon
      }
    ]
  },
  {
    title: "K.E.D.B",
    items: [
      {
        title: "Content",
        href: "/workspace/kedb/content",
        icon: LibraryIcon
      },
      {
        title: "AI Chat",
        href: "/workspace/kedb/ai-chat",
        icon: BrainCircuitIcon
      }
    ]
  },
  {
    title: "Team",
    items: [
      {
        title: "Members",
        href: "/workspace/members",
        icon: UsersIcon
      },
      {
        title: "Chat",
        href: "/workspace/chat",
        icon: MessageSquareIcon
        // isDataBadge will be set dynamically in NavMain component
      }
    ]
  },
  {
    title: "Billing",
    items: [
      {
        title: "Billing",
        href: "/billing",
        icon: CreditCardIcon
      }
    ]
  },
  {
    title: "Admin",
    items: [
      {
        title: "Users List",
        href: "/admin/users",
        icon: UserCircle2Icon
      },
      { title: "Api Keys", href: "/admin/api-keys", icon: KeyIcon },
      {
        title: "Admin Panel",
        href: "/admin",
        icon: SettingsIcon
      }
    ]
  }
];

export function NavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  // Use React Query for admin status check (no race conditions, automatic caching)
  const { data: isAdmin = false } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: isUserAdmin,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // Get all conversations and calculate total unread count
  const { conversations } = useWorkspaceConversations();
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total: number, conv: Conversation) => total + (conv.unread_count || 0), 0);
  }, [conversations]);

  // Update navItems with dynamic unread count
  const dynamicNavItems = useMemo(() => {
    return navItems.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.title === "Chat") {
          return {
            ...item,
            isDataBadge: totalUnreadCount > 0 ? String(totalUnreadCount) : undefined
          };
        }
        return item;
      })
    }));
  }, [totalUnreadCount]);

  // Filter out admin section for non-admin users
  const filteredNavItems = dynamicNavItems.filter((nav) => {
    if (nav.title === "Admin" && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <>
      {filteredNavItems.map((nav, groupIndex) => (
        <div key={nav.title}>
          <SidebarGroup className="mb-1">
            <SidebarGroupLabel className="text-xs font-semibold tracking-wider uppercase opacity-70 mb-2">
              {nav.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-1.5">
            <SidebarMenu>
              {nav.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {Array.isArray(item.items) && item.items.length > 0 ? (
                    <>
                      <div className="hidden group-data-[collapsible=icon]:block">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton tooltip={item.title}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side={isMobile ? "bottom" : "right"}
                            align={isMobile ? "end" : "start"}
                            className="min-w-48 rounded-lg"
                          >
                            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                            {item.items?.map((item) => (
                              <DropdownMenuItem
                                className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                                asChild
                                key={item.title}
                              >
                                <a href={item.href}>{item.title}</a>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Collapsible className="group/collapsible block group-data-[collapsible=icon]:hidden">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                            tooltip={item.title}
                          >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item?.items?.map((subItem, key) => (
                              <SidebarMenuSubItem key={key}>
                                <SidebarMenuSubButton
                                  className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                  isActive={pathname === subItem.href}
                                  asChild
                                >
                                  <Link href={subItem.href} target={subItem.newTab ? "_blank" : ""}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  ) : (
                    <SidebarMenuButton
                      className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      asChild
                    >
                      <Link href={item.href} target={item.newTab ? "_blank" : ""}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                  {!!item.isComing && (
                    <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
                      Coming
                    </SidebarMenuBadge>
                  )}
                  {!!item.isNew && (
                    <SidebarMenuBadge className="border border-green-400 text-green-600 peer-hover/menu-button:text-green-600">
                      New
                    </SidebarMenuBadge>
                  )}
                  {!!item.isDataBadge && (
                    <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
                      {item.isDataBadge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Add separator after major sections */}
        {(nav.title === "Workspace" ||
          nav.title === "Video Generation" ||
          nav.title === "Team") &&
          groupIndex < filteredNavItems.length - 1 && (
          <Separator className="my-3 opacity-50" />
        )}
      </div>
      ))}
    </>
  );
}
