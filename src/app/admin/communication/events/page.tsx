import { CalendarView } from "@/components/templates/CalendarView";

export default function AdminEventsCalendarPage() {
  return (
    <CalendarView
      role="admin"
      title="Campus Events & Academic Calendar"
      subtitle="Manage school-wide assemblies, STEM expos, PTMs, and exam milestones"
      categories={[
        { key: "all", label: "All Events" },
        { key: "Event", label: "Event" },
        { key: "Exam", label: "Exam" },
        { key: "PTM", label: "PTM" },
      ]}
      items={[
        { id: "ev-1", dayOrDate: "05 Dec 2026", timeRange: "09:00 – 01:00", title: "Term 1 Parent-Teacher Meeting", location: "All Classrooms", tag: "PTM", tone: "primary" },
        { id: "ev-2", dayOrDate: "08 Dec 2026", timeRange: "09:00 – 12:00", title: "Mid-Term Exams Begin (Grades 6–12)", location: "Hall A & Labs", tag: "Exam", tone: "info" },
        { id: "ev-3", dayOrDate: "12 Dec 2026", timeRange: "10:00 – 04:00", title: "Annual Science & Robotics Expo", location: "Main Auditorium", tag: "Event", tone: "success" },
      ]}
    />
  );
}

