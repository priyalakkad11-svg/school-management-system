import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Admissions 2026–27 | Fee Matrix & Eligibility",
  description:
    "View admission eligibility, required documents, campus visit hours, and annual fee structure for Nursery to Grade 12 at Greenwood International Academy.",
};

const FEE_TIERS = [
  { wing: "Pre-Primary (Nursery – KG)", tuition: "₹14,500 / Term", seats: "42 Seats Open" },
  { wing: "Primary (Grades 1 – 5)", tuition: "₹16,500 / Term", seats: "36 Seats Open" },
  { wing: "Middle School (Grades 6 – 8)", tuition: "₹17,500 / Term", seats: "24 Seats Open" },
  { wing: "Secondary & Senior (Grades 9 – 12)", tuition: "₹18,500 / Term", seats: "18 Seats Open" },
];

export default function AdmissionsPage() {
  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col gap-8">
        <div className="max-w-3xl flex flex-col gap-3">
          <span className="self-start">
            <StatusBadge tone="success">Admissions Open 2026–27</StatusBadge>
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink">
            Admissions Guide, Eligibility &amp; Fee Structure
          </h1>
          <p className="text-base text-ink-secondary">
            Transparent digital admissions with guided campus tours every Tuesday through Saturday.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEE_TIERS.map((tier) => (
            <Card key={tier.wing} className="p-5 flex flex-col gap-2">
              <StatusBadge tone="info">{tier.seats}</StatusBadge>
              <h2 className="text-base font-bold text-ink pt-1">{tier.wing}</h2>
              <p className="text-sm font-semibold text-brand">{tier.tuition}</p>
            </Card>
          ))}
        </div>

        <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Ready to submit an admission enquiry?</h2>
            <p className="text-sm text-ink-secondary">
              Takes under 3 minutes. Track application &amp; interview slot online.
            </p>
          </div>
          <Link href="/apply">
            <Button variant="primary" size="lg">
              Start Online Enquiry
            </Button>
          </Link>
        </Card>
      </section>
    </PublicLayout>
  );
}

