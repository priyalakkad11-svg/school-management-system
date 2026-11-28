"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { StatCard } from "@/components/ui/primitives";
import { getLiveEnquiriesAction } from "@/app/actions/live-data.actions";
import type { AdmissionEnquiry } from "@/types/domain";

export default function AdmissionEnquiriesPage() {
  const [rows, setRows] = React.useState<AdmissionEnquiry[]>([]);
  React.useEffect(() => {
    let active = true;
    void getLiveEnquiriesAction().then((data) => {
      if (active) setRows(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DataTablePage<AdmissionEnquiry>
      role="admin"
      title="Admission Enquiries CRM"
      subtitle="Recent Admission Leads for Academic Year 2026–27"
      rows={rows}
      searchPlaceholder="Search enquiry ID, child, parent phone..."
      primaryAction={{ label: "Review Applications", href: "/admin/students/applications" }}
      topSummary={
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Enquiries" value="312" delta="AY 2026–27 Cycle" />
          <StatCard title="Campus Tours Booked" value="48" delta="This week" />
          <StatCard title="Applications Submitted" value="184" delta="59% conversion" />
          <StatCard title="Seats Available" value="88" delta="Across Grades 1–11" />
        </div>
      }
      filters={[
        {
          key: "stage",
          label: "Stage",
          options: [
            { label: "Tour Scheduled", value: "Tour Scheduled" },
            { label: "Form Submitted", value: "Form Submitted" },
            { label: "Follow-up Due", value: "Follow-up Due" },
            { label: "Enrolled", value: "Enrolled" },
          ],
          predicate: (row, val) => row.stage === val,
        },
      ]}
      columns={[
        {
          id: "enqNo",
          header: "Enquiry ID",
          accessor: (r) => r.enquiryNo,
          href: () => "/admin/students/applications",
        },
        { id: "child", header: "Child Name", accessor: (r) => r.childName },
        { id: "class", header: "Applying Class", accessor: (r) => r.applyingClass },
        { id: "contact", header: "Parent Contact", accessor: (r) => r.parentPhone },
        { id: "source", header: "Source", accessor: (r) => r.source },
        {
          id: "stage",
          header: "Stage",
          accessor: (r) => r.stage,
          badgeTone: (r) =>
            r.stage === "Enrolled"
              ? "success"
              : r.stage === "Follow-up Due"
                ? "warning"
                : r.stage === "Form Submitted"
                  ? "primary"
                  : "info",
        },
      ]}
    />
  );
}

