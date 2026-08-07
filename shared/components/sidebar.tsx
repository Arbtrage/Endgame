"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Monitor,
  Settings,
  Swords,
  TrendingUp,
  Users,
} from "lucide-react";
import { signOut, useSession } from "@/shared/auth/auth-client";
import { APP_NAME } from "@/shared/constants/brand";
import { useUIStore } from "@/shared/hooks/use-ui-store";
import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Home",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Play",
    items: [
      { href: "/play/computer", label: "Vs villains", icon: Monitor },
      { href: "/play/ai", label: "Vs heroes", icon: Swords },
      { href: "/play/coach", label: "Coach mode", icon: GraduationCap },
      { href: "/play/pvp", label: "Vs friend", icon: Users },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/analyze", label: "Analyze", icon: BarChart3 },
      { href: "/train", label: "Train", icon: GraduationCap },
      { href: "/progress", label: "Progress", icon: TrendingUp },
      { href: "/coach", label: "Coach chat", icon: MessageCircle },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

function NavLink({
  href,
  label,
  icon: Icon,
  collapsed,
}: NavItem & { collapsed: boolean }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      {active ? (
        <span className="absolute bottom-1 left-0 top-1 w-0.5 rounded-full bg-primary" />
      ) : null}
      <Icon className="size-4 shrink-0" />
      {!collapsed ? <span>{label}</span> : null}
    </Link>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const { data: session } = useSession();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const user = session?.user;
  const initials =
    user?.name?.slice(0, 2).toUpperCase() ??
    user?.email?.slice(0, 2).toUpperCase() ??
    "U";

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border/60 bg-sidebar transition-[width] duration-200",
        sidebarCollapsed ? "w-18" : "w-60",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center",
          sidebarCollapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {!sidebarCollapsed ? (
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="text-sm font-bold text-primary"
            title={APP_NAME}
          >
            E
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn("hidden lg:inline-flex", sidebarCollapsed && "mx-auto")}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleSidebarCollapsed}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!sidebarCollapsed ? (
              <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} {...item} collapsed={sidebarCollapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/60 p-2">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name ?? "Player"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
          </div>
        )}
        <div className={cn("mt-2 flex gap-2", sidebarCollapsed && "justify-center")}>
          {!sidebarCollapsed ? (
            <Link
              href="/settings"
              className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-border/60 bg-background px-2.5 text-sm transition-colors hover:bg-muted/40"
            >
              Settings
            </Link>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Sign out"
            onClick={() =>
              signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = "/";
                  },
                },
              })
            }
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function sidebarWidth(collapsed: boolean) {
  return collapsed ? "4.5rem" : "15rem";
}
