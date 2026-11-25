import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, StatusBadge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ)",
  description:
    "Answers to common questions about Greenwood International Academy admissions, fee payment receipts, transport routes, and EduCore portals.",
};

const FAQS = [
  {
    q: "How do parents log into the EduCore Parent Portal?",
    a: "Use Portal Login, select the Parent role, and sign in with your registered email or mobile number and temporary password provided during admission.",
  },
  {
    q: "Are digital fee receipts and transfer certificates official?",
    a: "Yes. Every receipt and certificate generated inside EduCore carries a verifiable reference ID accepted for tax reimbursement and board transfers.",
  },
  {
    q: "How does GPS school bus tracking notify parents?",
    a: "Parents receive instant notifications when a student scans their RFID card at school gates or boards an assigned route.",
  },
];

export default function FaqPage() {
  return (
    <PublicLayout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="self-start">
            <StatusBadge tone="primary">Knowledge Base</StatusBadge>
          </span>
          <h1 className="text-3xl font-bold text-ink">Frequently Asked Questions</h1>
        </div>
        <div className="flex flex-col gap-4">
          {FAQS.map((item) => (
            <Card key={item.q} className="p-6 flex flex-col gap-2">
              <h2 className="text-base font-bold text-ink">{item.q}</h2>
              <p className="text-sm text-ink-secondary">{item.a}</p>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

