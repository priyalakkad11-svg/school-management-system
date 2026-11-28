import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Admission Enquiry (AY 2026–27)",
  description:
    "Submit an online student admission enquiry for Nursery to Grade 11 at Greenwood International Academy and schedule a guided campus tour.",
  alternates: {
    canonical: "/apply",
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
