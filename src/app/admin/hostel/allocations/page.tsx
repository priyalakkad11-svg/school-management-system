"use client";

import { FormPage } from "@/components/templates/FormPage";

export default function HostelRoomAllocationPage() {
  return (
    <FormPage
      role="admin"
      title="Hostel Bed & Room Allocation"
      subtitle="Assign residential students to open hostel beds and trigger mess billing"
      sectionTitle="Assign Student to Hostel Room"
      cancelHref="/admin/hostel/rooms"
      submitLabel="Confirm Room Allocation"
      initialValues={{
        student: "Devansh Patel (ADM-2026-0144 • Class 10–A)",
        room: "EB-102 • Boys Wing — Emerald Bhavan (1 Bed Open)",
        messPlan: "Full Board (Breakfast + Lunch + Dinner)",
        moveInDate: "2026-12-01",
      }}
      fields={[
        {
          name: "student",
          label: "Student",
          type: "select",
          options: [
            { label: "Devansh Patel (ADM-2026-0144 • Class 10–A)", value: "Devansh Patel (ADM-2026-0144 • Class 10–A)" },
            { label: "Kabir Joshi (ADM-2026-0146 • Class 10–B)", value: "Kabir Joshi (ADM-2026-0146 • Class 10–B)" },
          ],
        },
        {
          name: "room",
          label: "Available Room",
          type: "select",
          options: [
            { label: "EB-102 • Boys Wing — Emerald Bhavan (1 Bed Open)", value: "EB-102 • Boys Wing — Emerald Bhavan (1 Bed Open)" },
            { label: "EB-204 • Boys Wing — Emerald Bhavan (1 Bed Open)", value: "EB-204 • Boys Wing — Emerald Bhavan (1 Bed Open)" },
          ],
        },
        {
          name: "messPlan",
          label: "Dining / Mess Plan",
          type: "select",
          options: [
            { label: "Full Board (Breakfast + Lunch + Dinner)", value: "Full Board (Breakfast + Lunch + Dinner)" },
            { label: "Weekday Resident Plan", value: "Weekday Resident Plan" },
          ],
        },
        { name: "moveInDate", label: "Check-in Date", type: "date", required: true },
      ]}
    />
  );
}

