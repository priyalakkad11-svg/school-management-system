import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SchoolMicrositeLayout } from "@/components/layout/SchoolMicrositeLayout";
import { Card, Button, StatusBadge } from "@/components/ui/primitives";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicSchoolMicrosite } from "@/lib/school-microsite";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ school_code: string }>;
}): Promise<Metadata> {
  const { school_code } = await params;
  const school = await getPublicSchoolMicrosite(school_code);
  if (!school) return { title: "School Not Found" };
  return {
    title: `${school.name} (${school.schoolCode}) | Admissions & Portal`,
    description: `${school.name} (${school.board}, ${school.affiliationCode}). Official campus microsite, admissions, notices, events & portal sign in.`,
  };
}

export default async function SchoolMicrositeHomePage({
  params,
}: {
  params: Promise<{ school_code: string }>;
}) {
  const { school_code } = await params;
  const school = await getPublicSchoolMicrosite(school_code);
  if (!school) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenwood.edu";
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: school.name,
    url: `${siteUrl}/s/${school.schoolCode}`,
    email: school.contactEmail || undefined,
    telephone: school.contactPhone || undefined,
    address: school.address || undefined,
  };

  return (
    <SchoolMicrositeLayout school={school} activeSection="home">
      <JsonLd data={orgSchema} />

      <Card className="p-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="primary">{school.board}</StatusBadge>
          <StatusBadge tone="success">Admissions Open · AY {school.activeYearName}</StatusBadge>
        </div>
        <h1 className="text-3xl font-bold text-ink">{school.name}</h1>
        <p className="text-sm text-ink-secondary max-w-2xl">
          Led by {school.principalName}. Offering structured academics across {school.classesCount}{" "}
          grade levels with digital attendance, verified CBSE/ICSE report cards, fee portal & parent
          messaging.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href={`/s/${school.schoolCode}/admissions`}>
            <Button>Apply for Admissions</Button>
          </Link>
          <Link href={`/login?school=${encodeURIComponent(school.schoolCode)}`}>
            <Button variant="outline">Student / Parent / Staff Login</Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs text-ink-secondary">Principal</span>
          <strong className="block text-base text-ink mt-1">{school.principalName}</strong>
        </Card>
        <Card className="p-5">
          <span className="text-xs text-ink-secondary">Campus Contact</span>
          <strong className="block text-sm text-ink mt-1">{school.contactPhone || "Campus Office"}</strong>
          <span className="text-xs text-ink-muted">{school.contactEmail}</span>
        </Card>
        <Card className="p-5">
          <span className="text-xs text-ink-secondary">Active Grade Levels</span>
          <strong className="block text-base text-ink mt-1">{school.classesCount} Grades Configured</strong>
        </Card>
      </div>
    </SchoolMicrositeLayout>
  );
}
