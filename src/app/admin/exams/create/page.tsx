"use client";

import { FormPage } from "@/components/templates/FormPage";

export default function CreateExamPage() {
  return (
    <FormPage
      role="admin"
      title="Create New Examination"
      subtitle="Define term exam dates, applicable grades, passing percentage, and marks locking window"
      sectionTitle="Examination Configuration"
      cancelHref="/admin/exams"
      submitLabel="Publish Examination"
      initialValues={{
        name: "Annual Final Examination 2027",
        type: "Summative Term",
        classes: "Grades 1–12",
        startDate: "2027-03-01",
        endDate: "2027-03-18",
        passingPct: "33",
      }}
      fields={[
        { name: "name", label: "Examination Title", type: "text", required: true },
        {
          name: "type",
          label: "Assessment Type",
          type: "select",
          options: [
            { label: "Summative Term", value: "Summative Term" },
            { label: "Unit Evaluation", value: "Unit Evaluation" },
            { label: "Board Practical", value: "Board Practical" },
          ],
        },
        { name: "classes", label: "Applicable Grades", type: "text", required: true },
        { name: "passingPct", label: "Passing Threshold (%)", type: "number", required: true },
        { name: "startDate", label: "Start Date", type: "date", required: true },
        { name: "endDate", label: "End Date", type: "date", required: true },
      ]}
    />
  );
}

