"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
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
import { getShellTenantContextAction } from "@/app/actions/auth.actions";
import { endSupportSessionAction } from "@/app/actions/platform.actions";
import { DEMO_USERS } from "@/lib/auth";
import { getNavForRole, type NavItemConfig } from "@/lib/navigation";
import { Avatar, Button } from "@/components/ui/primitives";
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
  "admin" | "teacher" | "student" | "parent" | "super_admin",
  { code: string; title: string; badgeTone: string }
> = {
  super_admin: { code: "SA", title: "EduCore Platform", badgeTone: "bg-brand text-ink-on-dark" },
  admin: { code: "EC", title: "EduCore Admin", badgeTone: "bg-brand text-ink-on-dark" },
  teacher: { code: "TP", title: "Teacher Portal", badgeTone: "bg-accent text-ink-on-dark" },
  student: { code: "SP", title: "Student Portal", badgeTone: "bg-brand text-ink-on-dark" },
  parent: { code: "PP", title: "Parent Portal", badgeTone: "bg-brand text-ink-on-dark" },
};

const PORTAL_ROOTS = new Set(["/platform", "/admin", "/teacher", "/student", "/parent"]);

function getFallbackBackHref(
  pathname: string,
  shellRole: "admin" | "teacher" | "student" | "parent" | "super_admin",
): string {
  if (pathname.startsWith("/platform/")) return "/platform";
  if (pathname.startsWith("/admin/setup/classes/")) return "/admin/setup/classes";
  if (pathname.startsWith("/admin/setup/") && pathname !== "/admin/setup/school-profile") {
    return "/admin/setup/school-profile";
  }
  if (pathname.startsWith("/admin/students/")) return "/admin/students";
  if (pathname.startsWith("/admin/teachers/")) return "/admin/teachers";
  if (pathname === "/admin/staff/salary-slip") return "/admin/staff/payroll";
  if (pathname.startsWith("/admin/staff/")) return "/admin/staff";
  if (pathname.startsWith("/admin/attendance/") && pathname !== "/admin/attendance/students") {
    return "/admin/attendance/students";
  }
  if (pathname.startsWith("/admin/timetable/") && pathname !== "/admin/timetable/classes") {
    return "/admin/timetable/classes";
  }
  if (pathname === "/admin/exams/report-card") return "/admin/exams/results";
  if (pathname.startsWith("/admin/exams/")) return "/admin/exams";
  if (pathname === "/admin/fees/receipt") return "/admin/fees/collect";
  if (pathname.startsWith("/admin/fees/") && pathname !== "/admin/fees/structure") {
    return "/admin/fees/structure";
  }
  if (pathname.startsWith("/admin/library/") && pathname !== "/admin/library/books") {
    return "/admin/library/books";
  }
  if (pathname.startsWith("/admin/transport/") && pathname !== "/admin/transport/routes") {
    return "/admin/transport/routes";
  }
  if (pathname.startsWith("/admin/hostel/") && pathname !== "/admin/hostel/rooms") {
    return "/admin/hostel/rooms";
  }
  if (pathname.startsWith("/admin/communication/") && pathname !== "/admin/communication/notices") {
    return "/admin/communication/notices";
  }
  if (pathname.startsWith("/admin/")) return "/admin";
  if (pathname.startsWith("/teacher/")) return "/teacher";
  if (pathname.startsWith("/student/")) return "/student";
  if (pathname.startsWith("/parent/")) return "/parent";
  return `/${shellRole}`;
}

export interface AppShellProps {
  role: PortalRole;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hideBack?: boolean;
  children: React.ReactNode;
}

export function AppShell({ role, title, subtitle, actions, hideBack = false, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [tenantCtx, setTenantCtx] = React.useState<Awaited<
    ReturnType<typeof getShellTenantContextAction>
  >>(null);
  const [endingSupport, setEndingSupport] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    void getShellTenantContextAction().then((ctx) => {
      if (active && ctx) setTenantCtx(ctx);
    });
    return () => {
      active = false;
    };
  }, [pathname]);

  const fallbackShellRole: "admin" | "teacher" | "student" | "parent" | "super_admin" =
    role === "super_admin" || role === "teacher" || role === "student" || role === "parent"
      ? role
      : "admin";

  const user = React.useSyncExternalStore(
    AuthService.subscribe,
    AuthService.getCurrentClientUser,
    () =>
      fallbackShellRole === "super_admin"
        ? {
            id: "PLATFORM-01",
            name: "Priya Lakkad",
            email: "superadmin@educore.in",
            role: "super_admin" as const,
            initials: "PL",
            subtitle: "Platform Owner",
          }
        : DEMO_USERS[fallbackShellRole],
  );

  const shellRole: "admin" | "teacher" | "student" | "parent" | "super_admin" =
    role === "common"
      ? user.role === "super_admin"
        ? "super_admin"
        : user.role === "teacher" || user.role === "student" || user.role === "parent"
          ? user.role
          : "admin"
      : fallbackShellRole;

  const navRole: PortalRole | "staff" | "super_admin" =
    role === "common"
      ? user.role === "super_admin" ||
        user.role === "teacher" ||
        user.role === "student" ||
        user.role === "parent" ||
        user.role === "staff"
        ? user.role
        : "admin"
      : role;

  const rawNavItems = getNavForRole(navRole);
  const enabledModules = tenantCtx?.school?.enabledModules;
  const navItems =
    enabledModules && navRole === "admin"
      ? rawNavItems.filter((item) => !item.moduleKey || enabledModules.includes(item.moduleKey))
      : rawNavItems;

  const baseBranding = PORTAL_BRANDING[shellRole];
  const branding =
    shellRole !== "super_admin" &&
    tenantCtx?.school?.schoolCode &&
    tenantCtx.school.schoolCode !== "GIA01"
      ? {
          ...baseBranding,
          code: tenantCtx.school.schoolCode.slice(0, 3),
          title: tenantCtx.school.name,
        }
      : baseBranding;

  const mobileBottomItems = navItems.slice(0, 4);

  const isNavActive = (href: string) => {
    if (
      href === "/platform" ||
      href === "/admin" ||
      href === "/teacher" ||
      href === "/student" ||
      href === "/parent"
    ) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleEndSupport = async () => {
    setEndingSupport(true);
    try {
      await endSupportSessionAction();
      router.push("/platform");
      router.refresh();
    } finally {
      setEndingSupport(false);
    }
  };

  const isPortalRoot = PORTAL_ROOTS.has(pathname);
  const fallbackBackHref = React.useMemo(
    () => getFallbackBackHref(pathname, shellRole),
    [pathname, shellRole],
  );

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackBackHref);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const handleLogout = async () => {
    await AuthService.signOut();
    router.push("/login");
    router.refresh();
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
    <div className="min-h-screen flex bg-canvas text-ink overflow-x-hidden">
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
        <header className="sticky top-0 z-20 bg-surface border-b border-line h-[68px] px-4 sm:px-6 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-md border border-line text-ink hover:bg-subtle cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            {!isPortalRoot && !hideBack ? (
              <button
                type="button"
                onClick={handleBack}
                aria-label="Back"
                title="Go back"
                className="min-h-11 min-w-11 lg:px-3 inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-surface text-ink-secondary hover:bg-subtle hover:text-ink cursor-pointer shrink-0 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden lg:inline">Back</span>
              </button>
            ) : null}
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

        <main className="flex-1 min-w-0 p-4 sm:p-6 pb-24 lg:pb-8 flex flex-col gap-6 max-w-[1400px] w-full mx-auto">
          {tenantCtx?.supportSession ? (
            <div
              role="status"
              className="rounded-lg border border-warning bg-warning-soft px-4 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-ink">
                  Audited Support Access Active — Viewing {tenantCtx.supportSession.schoolName} ({tenantCtx.supportSession.schoolCode})
                </span>
                <span className="text-xs text-ink-secondary">
                  Mode: {tenantCtx.supportSession.readOnly ? "Read-Only" : "Support Write"} · Reason: {tenantCtx.supportSession.reason}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEndSupport}
                disabled={endingSupport}
              >
                {endingSupport ? "Ending..." : "End Support Session"}
              </Button>
            </div>
          ) : null}

          {tenantCtx?.school &&
          (tenantCtx.school.status === "read_only" || tenantCtx.school.status === "past_due") &&
          shellRole !== "super_admin" ? (
            <div
              role="alert"
              className="rounded-lg border border-danger bg-danger-soft px-4 py-3 text-xs font-medium text-danger"
            >
              {tenantCtx.school.status === "read_only"
                ? `${tenantCtx.school.name} is currently in Read-Only Mode due to billing overdue. Contact EduCore support to restore updates.`
                : `${tenantCtx.school.name} renewal is past due. Settle invoice via EduCore Support to avoid read-only lock.`}
            </div>
          ) : null}

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
