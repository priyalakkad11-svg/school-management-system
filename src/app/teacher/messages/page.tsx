import { InboxView } from "@/components/templates/InboxView";
import { CommunicationService } from "@/services/school.service";

export default async function TeacherMessagesPage() {
  const threads = await CommunicationService.listMessages();

  return (
    <InboxView
      role="teacher"
      title="Messages & Campus Notices"
      subtitle="Communicate directly with parents, Principal office, and Examination Cell"
      initialThreads={threads}
    />
  );
}

