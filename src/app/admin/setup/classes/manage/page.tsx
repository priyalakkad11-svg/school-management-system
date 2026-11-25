"use client";

import { FormPage } from "@/components/templates/FormPage";

export default function ManageClassSectionPage() {
  return (
    <FormPage
      role="admin"
      title="Add / Edit Class & Section"
      subtitle="Configure section labels, room wings, max seat capacity, and homeroom faculty"
      sectionTitle="Class & Section Configuration"
      cancelHref="/admin/setup/classes"
      submitLabel="Save Class & Sections"
      initialValues={{
        className: "Class 10",
        gradeOrder: "10",
        wing: "Secondary (Grades 9–10)",
        sections: "A, B, C, D",
        capacity: "40",
        roomBlock: "Senior Academic Block — Floor 2",
        teacherA: "Mrs. Kavita Nair",
        teacherB: "Mr. Rohan Deshmukh",
      }}
      fields={[
        { name: "className", label: "Class Name", type: "text", required: true },
        { name: "gradeOrder", label: "Numeric Order / Grade", type: "number", required: true },
        {
          name: "wing",
          label: "Academic Wing",
          type: "select",
          options: [
            { label: "Secondary (Grades 9–10)", value: "Secondary (Grades 9–10)" },
            { label: "Senior Secondary (Grades 11–12)", value: "Senior Secondary (Grades 11–12)" },
            { label: "Middle Wing (Grades 6–8)", value: "Middle Wing (Grades 6–8)" },
          ],
        },
        { name: "sections", label: "Sections (Comma-separated)", type: "text", required: true },
        { name: "capacity", label: "Max Capacity per Section", type: "number", required: true },
        { name: "roomBlock", label: "Default Room Block", type: "text" },
        {
          name: "teacherA",
          label: "Section A Class Teacher",
          type: "select",
          options: [
            { label: "Mrs. Kavita Nair", value: "Mrs. Kavita Nair" },
            { label: "Mr. Arjun Menon", value: "Mr. Arjun Menon" },
          ],
        },
        {
          name: "teacherB",
          label: "Section B Class Teacher",
          type: "select",
          options: [
            { label: "Mr. Rohan Deshmukh", value: "Mr. Rohan Deshmukh" },
            { label: "Ms. Clara D'Souza", value: "Ms. Clara D'Souza" },
          ],
        },
      ]}
    />
  );
}

