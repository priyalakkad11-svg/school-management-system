"use client";

import { FormPage } from "@/components/templates/FormPage";

export default function AddEditTeacherPage() {
  return (
    <FormPage
      role="admin"
      title="Add / Edit Faculty Member"
      subtitle="Onboard teaching faculty with qualification, department, and bank payroll details"
      sectionTitle="Faculty Employment & Academic Profile"
      cancelHref="/admin/teachers"
      submitLabel="Save Faculty Record"
      initialValues={{
        empId: "TCH-112",
        name: "Dr. Snehalata Kulkarni",
        department: "Chemistry",
        designation: "PGT Chemistry",
        qualification: "Ph.D. Organic Chemistry, B.Ed.",
        email: "snehalata.k@greenwood.edu",
        phone: "+91 98250 88120",
        salaryGross: "72000",
        classesAssigned: "Class 11–Sci, Class 12–Sci",
      }}
      fields={[
        { name: "empId", label: "Employee ID", type: "text", required: true },
        { name: "name", label: "Full Name", type: "text", required: true },
        {
          name: "department",
          label: "Department",
          type: "select",
          options: [
            { label: "Mathematics", value: "Mathematics" },
            { label: "Physics", value: "Physics" },
            { label: "Chemistry", value: "Chemistry" },
            { label: "English", value: "English" },
            { label: "Computer Science", value: "Computer Science" },
          ],
        },
        { name: "designation", label: "Designation", type: "text", required: true },
        { name: "qualification", label: "Academic Qualifications", type: "text" },
        { name: "email", label: "Official Email", type: "email", required: true },
        { name: "phone", label: "Mobile Number", type: "text", required: true },
        { name: "salaryGross", label: "Monthly Gross Salary (₹)", type: "number" },
        { name: "classesAssigned", label: "Classes Assigned", type: "text", colSpan: 2 },
      ]}
    />
  );
}

