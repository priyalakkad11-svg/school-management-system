"use client";

import React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/primitives";

const PUBLIC_NAV = [
  { label: "Academics", href: "/#academics" },
  { label: "Admissions", href: "/#admissions" },
  { label: "Campus Life", href: "/#campus-life" },
  { label: "Notices", href: "/#notices" },
  { label: "Contact", href: "/#contact" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-30 bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-md bg-brand text-ink-on-dark font-bold text-sm inline-flex items-center justify-center shrink-0">
              EC
            </span>
            <span className="font-bold text-base sm:text-lg text-ink truncate">
              Greenwood International Academy
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink-secondary hover:text-ink transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link href="/apply">
              <Button variant="outline" size="md">
                Admission Enquiry
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="md">
                Portal Login
              </Button>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="sm:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-md border border-line text-ink hover:bg-subtle cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="lg:hidden border-t border-line bg-surface px-4 py-4 flex flex-col gap-2">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="min-h-11 px-3 flex items-center rounded-md text-sm font-medium text-ink-secondary hover:bg-subtle hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col sm:hidden gap-2">
              <Link href="/apply" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">
                  Admission Enquiry
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" className="w-full">
                  Portal Login
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-sidebar text-ink-on-dark border-t border-sidebar-hover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-md bg-brand text-ink-on-dark font-bold text-xs inline-flex items-center justify-center">
                EC
              </span>
              <span className="font-bold text-base">Greenwood International</span>
            </div>
            <p className="text-xs text-ink-on-dark-muted leading-relaxed">
              CBSE &amp; IB K-12 campus powered by EduCore ERP — connecting students, parents,
              faculty, and school leadership.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <h3 className="font-semibold text-sm text-ink-on-dark mb-1">Academics &amp; Campus</h3>
            <Link href="/academics" className="text-ink-on-dark-muted hover:text-ink-on-dark">
              Curriculum &amp; Programs
            </Link>
            <Link href="/admissions" className="text-ink-on-dark-muted hover:text-ink-on-dark">
              Admissions 2026–27
            </Link>
            <Link href="/campus-life" className="text-ink-on-dark-muted hover:text-ink-on-dark">
              Campus Life &amp; Labs
            </Link>
            <Link href="/events" className="text-ink-on-dark-muted hover:text-ink-on-dark">
              Academic Calendar &amp; Events
            </Link>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <h3 className="font-semibold text-sm text-ink-on-dark mb-1">Portals &amp; Notices</h3>
            <Link href="/login" className="text-ink-on-dark-muted hover:text-ink-on-dark">
              Unified Role Login
            </Link>
            <Link href="/notices" className="text-ink-on-dark-muted hover:text-ink-on-dark">
              Circulars &amp; Notice Board
            </Link>
            <Link href="/faq" className="text-ink-on-dark-muted hover:text-ink-on-dark">
              Admissions &amp; ERP FAQs
            </Link>
            <Link href="/contact" className="text-ink-on-dark-muted hover:text-ink-on-dark">
              Contact Helpdesk
            </Link>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <h3 className="font-semibold text-sm text-ink-on-dark mb-1">Compliance</h3>
            <Link href="/about" className="text-ink-on-dark-muted hover:text-ink-on-dark">
              About Greenwood Academy
            </Link>
            <Link href="/privacy" className="text-ink-on-dark-muted hover:text-ink-on-dark">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-ink-on-dark-muted hover:text-ink-on-dark">
              Terms of Portal Use
            </Link>
            <span className="text-ink-on-dark-muted pt-1">Affiliation No: 2730841 • Pune</span>
          </div>
        </div>
        <div className="border-t border-sidebar-hover">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-on-dark-muted">
            <span>© 2026 Greenwood International Academy. Powered by EduCore ERP v4.2.</span>
            <span>CBSE Affiliation • ISO 21001:2018 Certified Campus</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

