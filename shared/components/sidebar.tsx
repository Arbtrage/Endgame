"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Monitor,
  Settings,
  Swords,
  TrendingUp,
} from "lucide-react";
import { signOut, useSession } from "@/shared/auth/auth-client";
import { APP_NAME } from "@/shared/constants/brand";
import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/play/computer", label: "vs Villains", icon: Monitor },
  { href: "/play/ai", label: "vs Heroes", icon: Swords },
  { href: "/play/coach", label: "Coach Mode", icon: GraduationCap },
  { href: "/analyze", label: "Analyze", icon: BarChart3 },
  { href: "/train", label: "Train", icon: GraduationCap },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/coach", label: "Coach Chat", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const { data: session } = useSession();
  const user = session?.user;
  const initials =
    user?.name?.slice(0, 2).toUpperCase() ??
    user?.email?.slice(0, 2).toUpperCase() ??
    "U";

  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r border-border bg-card/50",
        className,
      )}
    >
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          {APP_NAME}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.slice(0, 1).map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        <div className="px-3 pt-4 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Play
        </div>
        {navItems.slice(1, 4).map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        <Separator className="my-3" />
        {navItems.slice(4, 7).map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        <Separator className="my-3" />
        {navItems.slice(7).map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="size-8">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? "Player"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="mt-2 flex gap-2 px-2">
          <Link
            href="/settings"
            className="inline-flex h-7 flex-1 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm hover:bg-muted"
          >
            Settings
          </Link>
          <Button
            variant="ghost"
            size="sm"
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
