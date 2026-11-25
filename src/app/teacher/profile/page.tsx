import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { StaffService } from "@/services/school.service";
import { formatInr } from "@/lib/utils";

export default async function TeacherProfilePage() {
  const teacher = await StaffService.getTeacher();

  return (
    <AppShell
      role="teacher"
      title="My Faculty Profile"
      subtitle="Employment details, certified subjects, and verified payroll summary"
    >
      <Card className="p-6 flex flex-col gap-2">
        <span className="self-start">
          <StatusBadge tone="success">
            {teacher.empId} • {teacher.designation}
          </StatusBadge>
        </span>
        <h2 className="text-2xl font-bold text-ink pt-1">{teacher.name}</h2>
        <p className="text-sm text-ink-secondary">
          {teacher.qualification} • 11 Years Experience • Joined {teacher.joinDate}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col gap-3">
          <h3 className="text-base font-bold text-ink">Contact &amp; Employment Details</h3>
          <ul className="flex flex-col gap-2.5 text-sm text-ink-secondary">
            <li>Official Email: {teacher.email}</li>
            <li>Phone: {teacher.phone}</li>
            <li>Department: {teacher.department}</li>
            <li>Classes Assigned: {teacher.classesAssigned}</li>
          </ul>
        </Card>

        <Card className="p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-bold text-ink">Payroll &amp; Qualifications Summary</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-ink-secondary">
              <li>
                Latest Salary Slip: November 2026 — Paid ({formatInr(teacher.salaryGross)})
              </li>
              <li>Subjects Certified: Mathematics, Calculus, Statistics</li>
              <li>Bank Account: HDFC •••• 4910 (Verified)</li>
            </ul>
          </div>
          <Link href="/account">
            <Button variant="outline">Manage Account Settings</Button>
          </Link>
        </Card>
      </div>
    </AppShell>
  );
}

