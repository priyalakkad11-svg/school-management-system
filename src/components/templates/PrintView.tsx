"use client";

import React from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card } from "@/components/ui/primitives";
import type { PortalRole } from "@/lib/routes";

export function PrintView({
  role,
  title,
  subtitle,
  documentHeading,
  documentSubheading = "Greenwood International Academy • Affiliation No: 2730841",
  backHref,
  children,
}: {
  role: PortalRole;
  title: string;
  subtitle?: string;
  documentHeading: string;
  documentSubheading?: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  return (
    <AppShell
      role={role}
      title={title}
      subtitle={subtitle}
      actions={
        <div className="flex items-center gap-2.5 print:hidden">
          {backHref ? (
            <Link href={backHref}>
              <Button variant="outline">Back</Button>
            </Link>
          ) : null}
          <Button variant="primary" onClick={() => window.print()}>
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Print / Save PDF</span>
          </Button>
        </div>
      }
    >
      <Card className="max-w-3xl w-full min-w-0 mx-auto p-6 sm:p-10 flex flex-col gap-6 print:border-0 print:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-md bg-brand text-ink-on-dark font-bold text-base inline-flex items-center justify-center">
              EC
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">{documentHeading}</h2>
              <p className="text-xs text-ink-secondary">{documentSubheading}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-brand bg-brand-soft px-3 py-1.5 rounded-full self-start sm:self-auto">
            Academic Year 2026–27
          </span>
        </div>
        {children}
      </Card>
    </AppShell>
  );
}

