import { InboxView } from "@/components/templates/InboxView";
import type { MessageThread } from "@/types/domain";

const PARENT_THREADS: MessageThread[] = [
  {
    id: "pm-1",
    participant: "Mrs. Kavita Nair",
    roleLabel: "Class Teacher • 10–A Math",
    preview: "Noted Mr. Sharma! I have marked his academic duty leave request.",
    time: "10:15 AM",
    unread: false,
    messages: [
      {
        sender: "You",
        text: "Good morning Ma'am, Aarav will be attending the State Robotics Workshop next Friday.",
        time: "10:08 AM",
        self: true,
      },
      {
        sender: "Mrs. Kavita Nair",
        text: "Noted Mr. Sharma! I have marked his academic duty leave request for approval.",
        time: "10:15 AM",
        self: false,
      },
    ],
  },
  {
    id: "pm-2",
    participant: "Mr. Arjun Menon",
    roleLabel: "10–A Physics",
    preview: "Lab manual evaluation for Term 1 is completed.",
    time: "Yesterday",
    unread: false,
    messages: [
      {
        sender: "Mr. Arjun Menon",
        text: "Lab manual evaluation for Term 1 is completed.",
        time: "Yesterday",
        self: false,
      },
    ],
  },
  {
    id: "pm-3",
    participant: "Ms. Ritu Kapoor",
    roleLabel: "Class Teacher • 6–C",
    preview: "Diya won 1st place in Inter-House English Elocution!",
    time: "22 Nov",
    unread: true,
    messages: [
      {
        sender: "Ms. Ritu Kapoor",
        text: "Diya won 1st place in Inter-House English Elocution!",
        time: "22 Nov",
        self: false,
      },
    ],
  },
];

export default function ParentMessagesPage() {
  return (
    <InboxView
      role="parent"
      title="Message Class & Subject Teachers"
      subtitle="Direct communication channel with Aarav & Diya's homeroom and subject faculty"
      initialThreads={PARENT_THREADS}
    />
  );
}
