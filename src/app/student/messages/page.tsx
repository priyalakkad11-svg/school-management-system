import { InboxView } from "@/components/templates/InboxView";
import type { MessageThread } from "@/types/domain";

const STUDENT_THREADS: MessageThread[] = [
  {
    id: "st-msg-1",
    participant: "Mrs. Kavita Nair",
    roleLabel: "Mathematics • Class Teacher",
    preview: "Great work Aarav! Step 3 had a minor sign slip; I added a comment.",
    time: "10:15 AM",
    unread: true,
    messages: [
      {
        sender: "Aarav Sharma",
        text: "Ma'am, I submitted the Coordinate Geometry extra sheet. Could you review question #8?",
        time: "10:10 AM",
        self: true,
      },
      {
        sender: "Mrs. Kavita Nair",
        text: "Great work Aarav! Step 3 had a minor sign slip; I added a comment on your submission.",
        time: "10:15 AM",
        self: false,
      },
    ],
  },
  {
    id: "st-msg-2",
    participant: "Mr. Arjun Menon",
    roleLabel: "Physics Lab Doubts",
    preview: "Bring your optics observation notebook tomorrow before 9 AM.",
    time: "Yesterday",
    unread: false,
    messages: [
      {
        sender: "Mr. Arjun Menon",
        text: "Bring your optics observation notebook tomorrow before 9 AM.",
        time: "Yesterday",
        self: false,
      },
    ],
  },
  {
    id: "st-msg-3",
    participant: "Mr. Vikram Rao",
    roleLabel: "Computer Science Project",
    preview: "SQL schema review approved for Expo presentation.",
    time: "22 Nov",
    unread: false,
    messages: [
      {
        sender: "Mr. Vikram Rao",
        text: "SQL schema review approved for Expo presentation.",
        time: "22 Nov",
        self: false,
      },
    ],
  },
];

export default function StudentMessagesPage() {
  return (
    <InboxView
      role="student"
      title="Messages with Teachers"
      subtitle="Subject doubt resolution and assignment feedback with faculty"
      initialThreads={STUDENT_THREADS}
    />
  );
}

