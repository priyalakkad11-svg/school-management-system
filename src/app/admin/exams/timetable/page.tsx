import { CalendarView } from "@/components/templates/CalendarView";

export default function AdminExamTimetablePage() {
  return (
    <CalendarView
      role="admin"
      title="Mid-Term Examination Date Sheet"
      subtitle="Room allocations, invigilation schedules, and subject paper timings (Dec 2026)"
      categories={[
        { key: "all", label: "All Papers" },
        { key: "Science", label: "Science" },
        { key: "Core", label: "Core" },
      ]}
      items={[
        { id: "et-1", dayOrDate: "08 Dec 2026", timeRange: "09:00 – 12:00", title: "Mathematics (041) — Grades 9 & 10", location: "Hall A & B • Invig: Mrs. Nair", tag: "Core", tone: "primary" },
        { id: "et-2", dayOrDate: "10 Dec 2026", timeRange: "09:00 – 12:00", title: "Physics / Integrated Science", location: "Hall A • Invig: Mr. Menon", tag: "Science", tone: "info" },
        { id: "et-3", dayOrDate: "12 Dec 2026", timeRange: "09:00 – 12:00", title: "English Language & Literature", location: "Rooms 201–208", tag: "Core", tone: "success" },
        { id: "et-4", dayOrDate: "15 Dec 2026", timeRange: "09:00 – 12:00", title: "Social Science & Economics", location: "Hall B", tag: "Core", tone: "warning" },
        { id: "et-5", dayOrDate: "17 Dec 2026", timeRange: "09:00 – 11:30", title: "Computer Science Practical", location: "CS Lab 1 & 2", tag: "Science", tone: "info" },
      ]}
    />
  );
}

