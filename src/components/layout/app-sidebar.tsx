"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Gamepad2,
  Flame,
  MessagesSquare,
  Trophy,
  Bell,
  UserCircle2,
  ShieldCheck,
  Building2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Role, isAdminRole } from "@/types";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const employeeNav: Item[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/challenges", label: "Challenges", icon: Flame },
  { href: "/rooms", label: "Rooms", icon: MessagesSquare },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
];

const adminNav: Item[] = [
  { href: "/admin", label: "Analytics", icon: ShieldCheck },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/challenges", label: "Challenges", icon: Flame },
  { href: "/admin/company", label: "Company", icon: Building2 },
];

export function AppSidebar({ role }: { role: Role }) {
  const path = usePathname();
  const showAdmin = isAdminRole(role);

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card/40 px-4 py-6 md:flex md:flex-col">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2 font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--grad-from)),hsl(var(--grad-via)),hsl(var(--grad-to)))] shadow-lg shadow-primary/30">
          <Sparkles className="h-4 w-4 text-white" />
        </span>
        Sparkle
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        <p className="px-3 pb-2 text-xs uppercase tracking-wide text-muted-foreground">Employee</p>
        {employeeNav.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(path, item.href)} />
        ))}

        {showAdmin && (
          <>
            <p className="mt-6 px-3 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Admin
            </p>
            {adminNav.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(path, item.href)} />
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}

function isActive(path: string, href: string) {
  if (href === "/dashboard") return path === href;
  if (href === "/admin") return path === "/admin";
  return path.startsWith(href);
}

function NavLink({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary/10 text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}
