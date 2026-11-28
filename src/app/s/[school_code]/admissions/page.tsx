import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SchoolMicrositeLayout } from "@/components/layout/SchoolMicrositeLayout";
import { Button, Card } from "@/components/ui/primitives";
import { getPublicSchoolMicrosite } from "@/lib/school-microsite";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ school_code: string }>;
}): Promise<Metadata> {
  const { school_code } = await params;
  const school = await getPublicSchoolMicrosite(school_code);
  if (!school) return { title: "Admissions" };
  return {
    title: `Admissions | ${school.name}`,
    description: `Admissions information & enquiry for ${school.name} (${school.schoolCode}) for academic year ${school.activeYearName}.`,
  };
}

export default async function SchoolMicrositeAdmissionsPage({
  params,
}: {
  params: Promise<{ school_code: string }>;
}) {
  const { school_code } = await params;
  const school = await getPublicSchoolMicrosite(school_code);
  if (!school) notFound();

  return (
    <SchoolMicrositeLayout school={school} activeSection="admissions">
      <Card className="p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-ink">Admissions · {school.name}</h1>
        <p className="text-sm text-ink-secondary">
          Applications are open for Academic Year {school.activeYearName} ({school.board}). Submit
          an online enquiry to schedule your campus interaction &amp; document verification.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/apply?school=${encodeURIComponent(school.schoolCode)}`}>
            <Button>Submit Admission Enquiry</Button>
          </Link>
          <Link href={`/s/${school.schoolCode}/contact`}>
            <Button variant="outline">Contact Admissions Office</Button>
          </Link>
        </div>
      </Card>
    </SchoolMicrositeLayout>
  );
}
