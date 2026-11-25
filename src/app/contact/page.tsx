import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, StatusBadge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Contact Greenwood International Academy",
  description:
    "Get campus directions, phone numbers, admissions office timings, and official EduCore IT support contact details.",
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="self-start">
            <StatusBadge tone="info">Helpdesk &amp; Directions</StatusBadge>
          </span>
          <h1 className="text-3xl font-bold text-ink">Contact Us</h1>
          <p className="text-sm text-ink-secondary">
            Reach our Admissions Counselor, Principal Secretariat, or Transport Control Desk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col gap-2">
            <h2 className="text-base font-bold text-ink">Campus Address</h2>
            <p className="text-sm text-ink-secondary">
              42 Knowledge Park Boulevard, Baner Annexe, Pune, Maharashtra 411045
            </p>
          </Card>
          <Card className="p-6 flex flex-col gap-2">
            <h2 className="text-base font-bold text-ink">Phone &amp; Timings</h2>
            <p className="text-sm text-ink-secondary">
              +91 20 6789 4200 • Mon–Sat, 08:00 AM to 04:30 PM IST
            </p>
          </Card>
          <Card className="p-6 flex flex-col gap-2">
            <h2 className="text-base font-bold text-ink">Email Channels</h2>
            <p className="text-sm text-ink-secondary">
              admissions@greenwood.edu • support@greenwood.edu
            </p>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}

