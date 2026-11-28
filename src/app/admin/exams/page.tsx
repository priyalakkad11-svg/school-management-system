"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { getLiveExamsAction } from "@/app/actions/live-data.actions";
import type { ExamItem } from "@/types/domain";

export default function ExamScheduleListPage() {
  const [rows, setRows] = React.useState<ExamItem[]>([]);
  React.useEffect(() => {
    let active = true;
    void getLiveExamsAction().then((data) => {
      if (active) setRows(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DataTablePage<ExamItem>
      role="admin"
      title="Examinations & Assessment Schedules"
      subtitle="Create terms, lock marks registers, publish digital report cards, and track exam readiness"
      rows={rows}
      searchPlaceholder="Search exam title, term, classes..."
      primaryAction={{ label: "Create Exam", href: "/admin/exams/create" }}
      secondaryActions={[
        { label: "Marks Entry", href: "/admin/exams/marks-entry" },
        { label: "Result Analytics", href: "/admin/exams/analytics" },
      ]}
      columns={[
        {
          id: "name",
          header: "Examination Name",
          accessor: (r) => r.name,
          href: () => "/admin/exams/timetable",
        },
        { id: "type", header: "Category", accessor: (r) => r.type },
        { id: "classes", header: "Applicable Grades", accessor: (r) => r.classes },
        { id: "window", header: "Date Window", accessor: (r) => r.dateWindow },
        { id: "locked", header: "Marks Locked", accessor: (r) => r.marksLocked },
        {
          id: "status",
          header: "Status",
          accessor: (r) => r.status,
          badgeTone: (r) =>
            r.status === "Results Live" ? "success" : r.status === "Published" ? "info" : "warning",
        },
      ]}
    />
  );
}

