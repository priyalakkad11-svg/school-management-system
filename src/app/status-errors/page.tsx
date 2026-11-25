import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";

const STATUS_CARDS = [
  {
    badge: "Error 404",
    tone: "info" as const,
    code: "404",
    title: "Page Not Found",
    description:
      "The requested student record or report URL does not exist or has been archived.",
    cta: "Return to Dashboard",
    href: "/admin",
  },
  {
    badge: "Error 403",
    tone: "danger" as const,
    code: "403",
    title: "Access Denied",
    description:
      "Your current role (Teacher) does not have permission to view Payroll & System Settings.",
    cta: "Request Access",
    href: "/help",
  },
  {
    badge: "Error 500",
    tone: "warning" as const,
    code: "500",
    title: "Temporary Server Error",
    description:
      "We encountered an unexpected error generating the PDF report. Please retry in a moment.",
    cta: "Retry Request",
    href: "/status-errors",
  },
];

export default function StatusErrorsShowcasePage() {
  return (
    <AppShell
      role="common"
      title="System Status & Error States"
      subtitle="Unified 404, 403, and 500 recovery templates used across all EduCore modules"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATUS_CARDS.map((card) => (
          <Card
            key={card.code}
            className="p-8 text-center flex flex-col items-center justify-between gap-4"
          >
            <div className="flex flex-col items-center gap-3">
              <StatusBadge tone={card.tone}>{card.badge}</StatusBadge>
              <div className="text-4xl font-bold text-ink">{card.code}</div>
              <h2 className="text-lg font-bold text-ink">{card.title}</h2>
              <p className="text-sm text-ink-secondary leading-relaxed">{card.description}</p>
            </div>
            <Link href={card.href} className="pt-2">
              <Button variant="primary">{card.cta}</Button>
            </Link>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

