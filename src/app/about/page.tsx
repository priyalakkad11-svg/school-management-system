import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "About Greenwood International Academy",
  description:
    "Discover our K-12 mission, CBSE & IB academic leadership, 14-acre smart campus in Pune, and EduCore digital parent-school ecosystem.",
};

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col gap-8">
        <div className="max-w-3xl flex flex-col gap-3">
          <span className="self-start">
            <StatusBadge tone="primary">Est. 2004 • ISO 21001:2018</StatusBadge>
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink">
            About Greenwood International Academy
          </h1>
          <p className="text-base text-ink-secondary leading-relaxed">
            Serving 2,480+ K–12 learners with a 1:14 faculty ratio, modern STEM maker labs, and
            transparent EduCore digital communication between teachers and families.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col gap-2">
            <h2 className="text-lg font-bold text-ink">Vision &amp; Values</h2>
            <p className="text-sm text-ink-secondary">
              Cultivating scientific curiosity, ethical leadership, and bilingual fluency across
              Nursery through Grade 12.
            </p>
          </Card>
          <Card className="p-6 flex flex-col gap-2">
            <h2 className="text-lg font-bold text-ink">Accreditation</h2>
            <p className="text-sm text-ink-secondary">
              CBSE Affiliation No. 2730841 &amp; IB Diploma Pathway with 99.4% board distinction
              track record.
            </p>
          </Card>
          <Card className="p-6 flex flex-col gap-2">
            <h2 className="text-lg font-bold text-ink">Digital Transparency</h2>
            <p className="text-sm text-ink-secondary">
              Live RFID attendance, online fee receipts, digital report cards, and GPS transport
              alerts on EduCore.
            </p>
          </Card>
        </div>

        <div>
          <Link href="/admissions">
            <Button variant="primary">Explore Admissions 2026–27</Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

