"use client";

import { FormPage } from "@/components/templates/FormPage";

export default function AddStudentFormPage() {
  return (
    <FormPage
      role="admin"
      title="New Student Admission Form"
      subtitle="Student Admission Registration — AY 2026–27"
      sectionTitle="Student Admission Registration — AY 2026–27"
      submitLabel="Submit & Generate Admission ID"
      cancelHref="/admin/students"
      initialValues={{
        name: "Riya Rajesh Malhotra",
        dob: "2012-08-12",
        gender: "Female",
        classSection: "Class 9 — Section A",
        fatherName: "Rajesh Malhotra",
        mobile: "+91 98220 66778",
        email: "rajesh.m@gmail.com",
        transport: "Bus Route #04",
        address: "14 Palm Grove Society, Wakad, Pune",
        previousSchool: "St. Mary's High • TC-88412",
      }}
      fields={[
        { name: "name", label: "Full Name", type: "text", required: true },
        { name: "dob", label: "Date of Birth", type: "date", required: true },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          options: [
            { label: "Female", value: "Female" },
            { label: "Male", value: "Male" },
            { label: "Other", value: "Other" },
          ],
        },
        {
          name: "classSection",
          label: "Admission Class & Section",
          type: "select",
          options: [
            { label: "Class 9 — Section A", value: "Class 9 — Section A" },
            { label: "Class 10 — Section A", value: "Class 10 — Section A" },
            { label: "Class 6 — Section B", value: "Class 6 — Section B" },
          ],
        },
        { name: "fatherName", label: "Father / Guardian Name", type: "text", required: true },
        { name: "mobile", label: "Guardian Mobile", type: "text", required: true },
        { name: "email", label: "Guardian Email", type: "email", required: true },
        {
          name: "transport",
          label: "Transport / Hostel",
          type: "select",
          options: [
            { label: "Bus Route #04", value: "Bus Route #04" },
            { label: "Self / Walker", value: "Self / Walker" },
            { label: "Hostel Wing B", value: "Hostel Wing B" },
          ],
        },
        { name: "address", label: "Residential Address", type: "text", colSpan: 2 },
        { name: "previousSchool", label: "Previous School & TC No.", type: "text", colSpan: 2 },
      ]}
    />
  );
}

