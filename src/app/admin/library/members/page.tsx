"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const MEMBERS = [
  { id: "lm-1", card: "LIB-MEM-0142", name: "Aarav Sharma (10–A)", issued: "2 / 3", overdueFine: "₹10", status: "Active" },
  { id: "lm-2", card: "LIB-MEM-0143", name: "Ananya Verma (10–A)", issued: "1 / 3", overdueFine: "₹0", status: "Active" },
  { id: "lm-3", card: "LIB-FAC-0042", name: "Mrs. Kavita Nair (Faculty)", issued: "4 / 8", overdueFine: "₹0", status: "Faculty Priority" },
];

export default function LibraryMembersFinesPage() {
  const { showToast } = useToast();

  return (
    <AppShell
      role="admin"
      title="Library Members & Overdue Fines"
      subtitle="Active student & faculty borrowing quotas and late-return fine ledger"
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Library members table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Card ID</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Member Name</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Books Issued</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Fine Due</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {MEMBERS.map((m) => (
                <tr key={m.id}>
                  <td className="py-3.5 px-4 text-sm font-bold text-ink">{m.card}</td>
                  <td className="py-3.5 px-4 text-sm text-ink">{m.name}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{m.issued}</td>
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{m.overdueFine}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={m.overdueFine === "₹0" ? "success" : "warning"}>
                      {m.status}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => showToast(`Settled library account for ${m.name}.`)}
                    >
                      Collect / Waive
                    </Button>
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

