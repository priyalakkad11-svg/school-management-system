"use client";

import { FormPage } from "@/components/templates/FormPage";

export default function AdminTimetableBuilderPage() {
  return (
    <FormPage
      role="admin"
      title="Create / Edit Timetable Slot"
      subtitle="Assign period timing, subject, teacher, and classroom with clash detection"
      sectionTitle="Timetable Slot Builder"
      cancelHref="/admin/timetable/classes"
      submitLabel="Publish Timetable Slot"
      initialValues={{
        section: "Class 10–A",
        day: "Monday",
        period: "Period 1 (08:30 – 09:15)",
        subject: "Mathematics (MATH-041)",
        teacher: "Mrs. Kavita Nair",
        room: "Room 204",
      }}
      fields={[
        {
          name: "section",
          label: "Class & Section",
          type: "select",
          options: [
            { label: "Class 10–A", value: "Class 10–A" },
            { label: "Class 9–B", value: "Class 9–B" },
          ],
        },
        {
          name: "day",
          label: "Weekday",
          type: "select",
          options: [
            { label: "Monday", value: "Monday" },
            { label: "Tuesday", value: "Tuesday" },
            { label: "Wednesday", value: "Wednesday" },
            { label: "Thursday", value: "Thursday" },
            { label: "Friday", value: "Friday" },
          ],
        },
        { name: "period", label: "Period Window", type: "text", required: true },
        { name: "subject", label: "Subject", type: "text", required: true },
        { name: "teacher", label: "Assigned Teacher", type: "text", required: true },
        { name: "room", label: "Classroom / Lab", type: "text", required: true },
      ]}
    />
  );
}

