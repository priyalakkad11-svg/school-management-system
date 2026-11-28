"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Checkbox, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  getOnboardingChecklistAction,
  toggleOnboardingStepAction,
  type OnboardingChecklistDto,
} from "@/app/actions/onboarding.actions";

export default function SchoolOnboardingPage() {
  const { showToast } = useToast();
  const [data, setData] = React.useState<OnboardingChecklistDto | null>(null);

  React.useEffect(() => {
    let active = true;
    void getOnboardingChecklistAction().then((res) => {
      if (!active) return;
      if (res.ok && res.data) setData(res.data);
      else showToast(res.error ?? "Unable to load onboarding progress.", "warning");
    });
    return () => {
      active = false;
    };
  }, [showToast]);

  const items: Array<{
    key:
      | "profile_done"
      | "academic_year_done"
      | "classes_sections_done"
      | "subjects_done"
      | "fee_structure_done"
      | "teachers_imported_done"
      | "students_imported_done"
      | "parents_invited_done";
    title: string;
    detail: string;
    href: string;
    done: boolean;
  }> = data
    ? [
        {
          key: "profile_done",
          title: "1. Complete School Profile & Branding",
          detail: "Affiliation board, logo, principal contact & timezone (Asia/Kolkata)",
          href: "/admin/setup/school-profile",
          done: data.profileDone,
        },
        {
          key: "academic_year_done",
          title: "2. Configure Active Academic Year",
          detail: `${data.liveCounts.academicYears} session(s) configured`,
          href: "/admin/setup/academic-years",
          done: data.academicYearDone,
        },
        {
          key: "classes_sections_done",
          title: "3. Set Up Classes, Nursery–12 & Sections",
          detail: `${data.liveCounts.classes} class level(s) ready`,
          href: "/admin/setup/classes",
          done: data.classesSectionsDone,
        },
        {
          key: "subjects_done",
          title: "4. Configure Subjects & Curriculum Mapping",
          detail: `${data.liveCounts.subjects} subject(s) active`,
          href: "/admin/setup/subjects",
          done: data.subjectsDone,
        },
        {
          key: "fee_structure_done",
          title: "5. Define Fee Heads & Class Fee Structures",
          detail: "Tuition, transport & installment rules",
          href: "/admin/fees/structure",
          done: data.feeStructureDone,
        },
        {
          key: "teachers_imported_done",
          title: "6. Import Teachers & Non-Teaching Staff",
          detail: `${data.liveCounts.teachers} teacher(s) in school`,
          href: "/admin/students/bulk-import",
          done: data.teachersImportedDone,
        },
        {
          key: "students_imported_done",
          title: "7. Bulk Import Students & Sections",
          detail: `${data.liveCounts.students} student(s) enrolled`,
          href: "/admin/students/bulk-import",
          done: data.studentsImportedDone,
        },
        {
          key: "parents_invited_done",
          title: "8. Link Guardians & Generate Portal Credentials",
          detail: `${data.liveCounts.guardians} guardian(s) linked`,
          href: "/admin/setup/credentials",
          done: data.parentsInvitedDone,
        },
      ]
    : [];

  return (
    <AppShell
      role="admin"
      title="First-Login School Onboarding Checklist"
      subtitle="Track persisted campus setup milestones before school-wide launch"
      actions={
        <Link href="/admin/setup/credentials">
          <Button size="sm">Bulk Credentials Generator</Button>
        </Link>
      }
    >
      <Card className="p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-ink">{data?.schoolName ?? "Loading..."} ({data?.schoolCode ?? "—"})</h2>
          <p className="text-xs text-ink-secondary">Persisted setup progress automatically syncs as you import data.</p>
        </div>
        <StatusBadge tone={data?.completionPct === 100 ? "success" : "primary"}>
          {data ? `${data.completionPct}% Complete` : "Loading..."}
        </StatusBadge>
      </Card>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <Card key={item.key} className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Checkbox
                label=""
                ariaLabel={`Mark ${item.title}`}
                checked={item.done}
                onChange={async (checked) => {
                  const res = await toggleOnboardingStepAction({ stepKey: item.key, done: checked });
                  if (!res.ok) {
                    showToast(res.error ?? "Update failed.", "warning");
                    return;
                  }
                  const fresh = await getOnboardingChecklistAction();
                  if (fresh.ok && fresh.data) setData(fresh.data);
                  showToast(`Updated ${item.title}.`);
                }}
              />
              <div>
                <strong className="text-sm text-ink block">{item.title}</strong>
                <span className="text-xs text-ink-secondary">{item.detail}</span>
              </div>
            </div>
            <Link href={item.href}>
              <Button variant="outline" size="sm">Open Step</Button>
            </Link>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
