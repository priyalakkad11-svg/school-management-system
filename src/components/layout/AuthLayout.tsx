"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, CreditCard, MessageSquare } from "lucide-react";

const AUTH_HIGHLIGHTS = [
  { icon: CalendarDays, label: "Attendance & timetable" },
  { icon: CreditCard, label: "Fees & online payments" },
  { icon: MessageSquare, label: "Parent-teacher messaging" },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(pathname === "/login" ? "/" : "/login");
  };
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface text-ink">
      <aside className="bg-sidebar text-ink-on-dark lg:w-[40%] lg:min-w-[380px] lg:max-w-[560px] p-6 sm:p-10 lg:p-12 flex flex-col justify-between gap-8">
        <div className="flex flex-col gap-5">
          <Link href="/" className="self-start">
            <span className="inline-flex items-center rounded-full bg-surface text-brand px-3 py-1 text-xs font-semibold">
              EduCore School ERP v4.2
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-ink-on-dark">
            Greenwood International Academy
          </h1>
          <p className="text-sm text-ink-on-dark-muted max-w-sm leading-relaxed">
            Unified academic, administrative, finance, and parent communication platform.
          </p>
        </div>

        <ul className="hidden sm:flex flex-col gap-4 my-4">
          {AUTH_HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label} className="flex items-center gap-3.5">
                <span className="w-8 h-8 rounded-md bg-sidebar-hover text-accent inline-flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-ink-on-dark">{item.label}</span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-on-dark-muted">
          <span>© 2026 Greenwood International Academy • Secure SSO</span>
          <Link href="/" className="text-ink-on-dark hover:underline">
            Back to School Home
          </Link>
        </div>
      </aside>

      <main className="flex-1 bg-canvas flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-[480px] bg-surface border border-line rounded-xl shadow-modal p-6 sm:p-8 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-line">
            <button
              type="button"
              onClick={handleBack}
              className="min-h-11 px-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface text-xs font-semibold text-ink-secondary hover:bg-subtle hover:text-ink cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{pathname === "/login" ? "Back to Home" : "Back"}</span>
            </button>
            {pathname !== "/login" ? (
              <Link href="/login" className="text-xs font-semibold text-brand hover:underline">
                Sign In
              </Link>
            ) : null}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

