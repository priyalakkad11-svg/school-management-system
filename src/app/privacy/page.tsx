import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, StatusBadge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Student, parent, and faculty data protection standards for Greenwood International Academy & EduCore School ERP.",
};

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col gap-6">
        <span className="self-start">
          <StatusBadge tone="info">Data Protection</StatusBadge>
        </span>
        <h1 className="text-3xl font-bold text-ink">Privacy Policy</h1>
        <Card className="p-6 flex flex-col gap-4 text-sm text-ink-secondary leading-relaxed">
          <p>
            Greenwood International Academy safeguards all student academic, health, attendance,
            and fee records with strict role-based access control and audit logging inside EduCore.
          </p>
          <p>
            No student personal information is sold or shared with external advertisers. Guardians
            may request record updates via the School Administration office.
          </p>
        </Card>
      </section>
    </PublicLayout>
  );
}

