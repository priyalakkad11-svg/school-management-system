import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, StatusBadge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Terms of Portal Use",
  description:
    "Acceptable use terms and role responsibilities for Greenwood International Academy EduCore portals.",
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col gap-6">
        <span className="self-start">
          <StatusBadge tone="info">Compliance</StatusBadge>
        </span>
        <h1 className="text-3xl font-bold text-ink">Terms of Portal Use</h1>
        <Card className="p-6 flex flex-col gap-4 text-sm text-ink-secondary leading-relaxed">
          <p>
            Access to Admin, Teacher, Student, Parent, and Staff portals is restricted to
            authorized members of Greenwood International Academy. Credentials must remain
            confidential and protected with 2-step verification where enabled.
          </p>
          <p>
            All mark entries, fee transactions, and certificate downloads are recorded in system
            audit logs.
          </p>
        </Card>
      </section>
    </PublicLayout>
  );
}

