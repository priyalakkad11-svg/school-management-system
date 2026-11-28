import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SchoolMicrositeLayout } from "@/components/layout/SchoolMicrositeLayout";
import { Card } from "@/components/ui/primitives";
import { getPublicSchoolMicrosite } from "@/lib/school-microsite";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ school_code: string }>;
}): Promise<Metadata> {
  const { school_code } = await params;
  const school = await getPublicSchoolMicrosite(school_code);
  if (!school) return { title: "Contact" };
  return {
    title: `Contact Us | ${school.name}`,
    description: `Campus address, phone & official email for ${school.name}.`,
  };
}

export default async function SchoolMicrositeContactPage({
  params,
}: {
  params: Promise<{ school_code: string }>;
}) {
  const { school_code } = await params;
  const school = await getPublicSchoolMicrosite(school_code);
  if (!school) notFound();

  return (
    <SchoolMicrositeLayout school={school} activeSection="contact">
      <Card className="p-6 flex flex-col gap-3 max-w-2xl">
        <h1 className="text-2xl font-bold text-ink">Contact · {school.name}</h1>
        <p className="text-sm text-ink-secondary">
          <strong>Address:</strong> {school.address || "Campus Address Pending"}
        </p>
        <p className="text-sm text-ink-secondary">
          <strong>Email:</strong> {school.contactEmail || "office@educore.in"}
        </p>
        <p className="text-sm text-ink-secondary">
          <strong>Phone:</strong> {school.contactPhone || "Campus Desk"}
        </p>
      </Card>
    </SchoolMicrositeLayout>
  );
}
