import { AppShell } from "@/components/layout/AppShell";
import { Card, StatusBadge } from "@/components/ui/primitives";

const DELIVERY_LOGS = [
  { id: "dl-1", time: "25 Nov 10:18 AM", channel: "WhatsApp Cloud", recipient: "Rajesh Sharma (+91 98250 11223)", template: "Fee Receipt RCP-2026-4410", status: "Delivered" },
  { id: "dl-2", time: "25 Nov 09:05 AM", channel: "SMS Gateway", recipient: "142 Guardians (Pending Dues)", template: "Term 3 Fee Reminder", status: "Delivered" },
  { id: "dl-3", time: "24 Nov 06:30 PM", channel: "Email SMTP", recipient: "All Grades 1–12 Parents", template: "Mid-Term Date Sheet PDF", status: "Delivered" },
  { id: "dl-4", time: "24 Nov 08:42 AM", channel: "SMS Gateway", recipient: "Kiran Patel (+91 98250 33445)", template: "Daily Absent Alert (10-A)", status: "Queued" },
];

export default function NotificationsLogPage() {
  return (
    <AppShell
      role="admin"
      title="SMS / Email / WhatsApp Dispatch Log"
      subtitle="Audit outbound transactional notifications across Meta WhatsApp, SMS, and SMTP gateways"
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Notification gateway log">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Timestamp</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Channel</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Recipient</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Template</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {DELIVERY_LOGS.map((log) => (
                <tr key={log.id}>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{log.time}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone="primary">{log.channel}</StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 text-sm font-medium text-ink">{log.recipient}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{log.template}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={log.status === "Delivered" ? "success" : "warning"}>
                      {log.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

