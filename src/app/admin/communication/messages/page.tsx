import { InboxView } from "@/components/templates/InboxView";
import { CommunicationService } from "@/services/school.service";

export default async function AdminMessagesInboxPage() {
  const threads = await CommunicationService.listMessages();

  return (
    <InboxView
      role="admin"
      title="Admin Messages & Communication Desk"
      subtitle="Respond directly to parent escalations, faculty heads, and transport supervisors"
      initialThreads={threads}
    />
  );
}

