import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/primitives";
import type { PublicSchoolMicrositeData } from "@/lib/school-microsite";

export function SchoolMicrositeLayout({
  school,
  activeSection,
  children,
}: {
  school: PublicSchoolMicrositeData;
  activeSection: "home" | "admissions" | "notices" | "events" | "contact";
  children: React.ReactNode;
}) {
  const base = `/s/${school.schoolCode}`;
  const nav = [
    { key: "home", label: "Overview", href: base },
    { key: "admissions", label: "Admissions", href: `${base}/admissions` },
    { key: "notices", label: "Notices", href: `${base}/notices` },
    { key: "events", label: "Events", href: `${base}/events` },
    { key: "contact", label: "Contact", href: `${base}/contact` },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-30 bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <Link href={base} className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-md bg-brand text-ink-on-dark font-bold text-xs inline-flex items-center justify-center shrink-0">
              {school.schoolCode.slice(0, 3)}
            </span>
            <div className="min-w-0">
              <span className="font-bold text-sm sm:text-base text-ink block truncate">{school.name}</span>
              <span className="text-[11px] text-ink-secondary block truncate">
                {school.board} · Affiliation {school.affiliationCode}
              </span>
            </div>
          </Link>

          <nav aria-label="School microsite navigation" className="hidden md:flex items-center gap-6">
            {nav.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={
                  activeSection === item.key
                    ? "text-sm font-bold text-brand"
                    : "text-sm font-medium text-ink-secondary hover:text-ink"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/login?school=${encodeURIComponent(school.schoolCode)}`}>
              <Button size="sm">Portal Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {children}
      </main>

      <footer className="bg-surface border-t border-line py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-secondary">
          <span>{school.name} ({school.schoolCode}) · Powered by EduCore Multi-School SaaS</span>
          <span>Academic Session {school.activeYearName}</span>
        </div>
      </footer>
    </div>
  );
}
