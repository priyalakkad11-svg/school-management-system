"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Bus,
  Calendar,
  CheckSquare,
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  User,
  Users,
} from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { DEMO_USERS } from "@/lib/auth";
import { getNavForRole, type NavItemConfig } from "@/lib/navigation";
import { Avatar } from "@/components/ui/primitives";
import { Drawer } from "@/components/ui/overlays";
import { cn } from "@/lib/utils";
import type { PortalRole } from "@/lib/routes";

const ICONS: Record<NavItemConfig["iconName"], React.ComponentType<{ className?: string }>> = {
  home: Home,
  settings: Settings,
  users: Users,
  briefcase: Briefcase,
  checkSquare: CheckSquare,
  calendar: Calendar,
  award: Award,
  creditCard: CreditCard,
  book: BookOpen,
  bus: Bus,
  building: Building2,
  mail: Mail,
  fileText: FileText,
  user: User,
  bell: Bell,
  help: HelpCircle,
};

const PORTAL_BRANDING: Record<
  "admin" | "teacher" | "student" | "parent",
  { code: string; title: string; badgeTone: string }
> = {
  admin: { code: "EC", title: "EduCore Admin", badgeTone: "bg-brand text-ink-on-dark" },
  teacher: { code: "TP", title: "Teacher Portal", badgeTone: "bg-accent text-ink-on-dark" },
  student: { code: "SP", title: "Student Portal", badgeTone: "bg-brand text-ink-on-dark" },
  parent: { code: "PP", title: "Parent Portal", badgeTone: "bg-brand text-ink-on-dark" },
};

export interface AppShellProps {
  role: PortalRole;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const subscribeNoop = () => () => {};

export function AppShell({ role, title, subtitle, actions, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const shellRole: "admin" | "teacher" | "student" | "parent" =
    role === "teacher" || role === "student" || role === "parent" ? role : "admin";

  const user = React.useSyncExternalStore(
    subscribeNoop,
    AuthService.getCurrentClientUser,
    () => DEMO_USERS[shellRole],
  );

  const navItems = React.useMemo(() => getNavForRole(role), [role]);
  const branding = PORTAL_BRANDING[shellRole];
  const mobileBottomItems = navItems.slice(0, 4);

  const isNavActive = (href: string) => {
    if (href === "/admin" || href === "/teacher" || href === "/student" || href === "/parent") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const handleLogout = () => {
    AuthService.signOut();
    router.push("/login");
  };

  const renderNavLinks = (onNavigate?: () => void) => (
    <nav aria-label="Portal sidebar" className="flex flex-col gap-1 flex-1">
      {navItems.map((item) => {
        const active = isNavActive(item.href);
        const Icon = ICONS[item.iconName];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "min-h-11 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors",
              active
                ? "bg-brand text-ink-on-dark font-semibold"
                : "text-ink-on-dark-muted hover:bg-sidebar-hover hover:text-ink-on-dark",
            )}
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const sidebarHeader = (
    <div className="flex flex-col gap-3 pb-4">
      <Link href={navItems[0]?.href ?? "/admin"} className="flex items-center gap-3 px-1">
        <span
          className={cn(
            "w-8 h-8 rounded-md font-bold text-xs inline-flex items-center justify-center shrink-0",
            branding.badgeTone,
          )}
        >
          {branding.code}
        </span>
        <span className="font-bold text-base text-ink-on-dark truncate">{branding.title}</span>
      </Link>

      {shellRole === "parent" ? (
        <Link
          href="/parent/children"
          className="rounded-md bg-success-soft text-success px-3 py-2 flex flex-col gap-0.5 hover:opacity-95 transition-opacity"
        >
          <span className="text-xs font-semibold">Viewing: Aarav Sharma</span>
          <span className="text-[11px] text-ink-secondary">Class 10-A • Roll #01</span>
        </Link>
      ) : null}
    </div>
  );

  const sidebarFooter = (
    <div className="pt-4 mt-4 border-t border-sidebar-hover flex flex-col gap-1">
      <Link
        href="/help"
        className="min-h-11 px-3 py-2 rounded-md text-xs font-medium text-ink-on-dark-muted hover:bg-sidebar-hover hover:text-ink-on-dark flex items-center gap-3"
      >
        <HelpCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Help &amp; Support</span>
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="min-h-11 px-3 py-2 rounded-md text-xs font-medium text-ink-on-dark-muted hover:bg-sidebar-hover hover:text-ink-on-dark flex items-center gap-3 text-left cursor-pointer"
      >
        <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Sign Out / Switch Role</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-canvas text-ink">
      <aside className="hidden lg:flex w-[260px] shrink-0 bg-sidebar text-ink-on-dark flex-col p-4 sticky top-0 h-screen overflow-y-auto">
        {sidebarHeader}
        {renderNavLinks()}
        {sidebarFooter}
      </aside>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={branding.title}>
        <div className="flex flex-col h-full">
          {shellRole === "parent" ? (
            <div className="mb-3 rounded-md bg-success-soft text-success px-3 py-2 flex flex-col gap-0.5">
              <span className="text-xs font-semibold">Viewing: Aarav Sharma</span>
              <span className="text-[11px] text-ink-secondary">Class 10-A • Roll #01</span>
            </div>
          ) : null}
          {renderNavLinks(() => setDrawerOpen(false))}
          {sidebarFooter}
        </div>
      </Drawer>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-surface border-b border-line h-[68px] px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-md border border-line text-ink hover:bg-subtle cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-ink truncate">{title}</h1>
              {subtitle ? (
                <p className="hidden sm:block text-xs text-ink-secondary truncate">{subtitle}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
              <Search
                className="w-4 h-4 text-ink-muted absolute left-3 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Search students, classes, fees"
                placeholder="Search students, classes, fees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-h-10 w-56 xl:w-64 rounded-full bg-subtle border border-line pl-9 pr-3 text-xs text-ink placeholder:text-ink-muted focus:outline-2 focus:outline-offset-0 focus:outline-line-focus"
              />
            </form>

            <span className="hidden sm:inline-flex items-center rounded-full bg-brand-soft text-brand px-3 py-1.5 text-xs font-semibold whitespace-nowrap">
              AY 2026–27
            </span>

            <Link
              href="/notifications"
              aria-label="Notifications"
              className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full text-ink-secondary hover:bg-subtle hover:text-ink relative"
            >
              <Bell className="w-5 h-5" />
              <span
                className="w-2 h-2 rounded-full bg-brand absolute top-2.5 right-2.5"
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/account"
              className="min-h-11 px-2 rounded-full inline-flex items-center gap-2 hover:bg-subtle transition-colors"
            >
              <Avatar initials={user.initials} size="sm" />
              <span className="hidden xl:inline text-xs font-semibold text-ink max-w-[140px] truncate">
                {user.name}
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-8 flex flex-col gap-6 max-w-[1400px] w-full mx-auto">
          {actions ? (
            <div className="flex flex-wrap items-center justify-end gap-3">{actions}</div>
          ) : null}
          {children}
        </main>

        <nav
          aria-label="Mobile quick navigation"
          className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-surface border-t border-line flex items-center justify-around px-1 py-1"
        >
          {mobileBottomItems.map((item) => {
            const active = isNavActive(item.href);
            const Icon = ICONS[item.iconName];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "min-h-11 min-w-11 px-2 py-1 rounded-md flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-brand font-semibold" : "text-ink-secondary",
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="truncate max-w-[64px]">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="min-h-11 min-w-11 px-2 py-1 rounded-md flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-ink-secondary cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
