"use client";

import React from "react";
import Link from "next/link";
import { DetailPage } from "@/components/templates/DetailPage";
import { Button, Card } from "@/components/ui/primitives";
import { getLiveTeachersAction } from "@/app/actions/live-data.actions";
import { formatInr } from "@/lib/utils";
import type { Teacher } from "@/types/domain";

const EMPTY_TEACHER: Teacher = {
  id: "loading",
  empId: "TCH-042",
  name: "Loading Faculty...",
  department: "General",
  designation: "Faculty",
  qualification: "B.Ed.",
  classesAssigned: "Active Classes",
  periodsPerWeek: 24,
  email: "—",
  phone: "—",
  salaryGross: 0,
  joinDate: "—",
  status: "Active",
};

export default function AdminTeacherProfilePage() {
  const [teacher, setTeacher] = React.useState<Teacher>(EMPTY_TEACHER);
  React.useEffect(() => {
    let active = true;
    void getLiveTeachersAction().then((rows) => {
      if (active && rows[0]) setTeacher(rows[0]);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DetailPage
      role="admin"
      title={`Faculty Profile — ${teacher.name}`}
      subtitle="Employment history, assigned workload, payroll details, and certifications"
      entityName={teacher.name}
      entityInitials="KN"
      entityMeta={`${teacher.empId} • ${teacher.designation} • ${teacher.department} • Joined ${teacher.joinDate}`}
      statusLabel={teacher.status}
      statusTone="success"
      backHref="/admin/teachers"
      headerActions={
        <Link href="/admin/staff/salary-slip">
          <Button variant="primary">View Salary Slip</Button>
        </Link>
      }
      quickMetrics={[
        { label: "Weekly Load", value: `${teacher.periodsPerWeek} Periods` },
        { label: "Class Teacher", value: "Class 10–A" },
        { label: "Gross Pay", value: formatInr(teacher.salaryGross) },
      ]}
      tabs={[
        {
          key: "overview",
          label: "Overview",
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 flex flex-col gap-3">
                <h3 className="text-base font-bold text-ink">Contact &amp; Credentials</h3>
                <ul className="flex flex-col gap-2 text-sm text-ink-secondary">
                  <li>Official Email: {teacher.email}</li>
                  <li>Phone: {teacher.phone}</li>
                  <li>Qualification: {teacher.qualification}</li>
                  <li>Classes Assigned: {teacher.classesAssigned}</li>
                </ul>
              </Card>
              <Card className="p-6 flex flex-col gap-3">
                <h3 className="text-base font-bold text-ink">Payroll &amp; Leave Balance</h3>
                <ul className="flex flex-col gap-2 text-sm text-ink-secondary">
                  <li>Net Monthly Disbursement: ₹68,400 (HDFC •••• 4910)</li>
                  <li>Leave Balance: 11 Days (6 Medical, 5 Casual)</li>
                </ul>
              </Card>
            </div>
          ),
        },
        {
          key: "timetable",
          label: "Teaching Allocation",
          content: (
            <Card className="p-6">
              <p className="text-sm text-ink-secondary">
                Assigned 26 periods/week across Class 10–A (Mathematics), Class 10–C (Mathematics),
                Class 9–B (Mathematics), and Class 12–Sci (Applied Calculus).
              </p>
            </Card>
          ),
        },
      ]}
    />
  );
}

