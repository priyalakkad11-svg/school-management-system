"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  issueOrReturnLibraryBookAction,
  listP1OperationsDataAction,
} from "@/app/actions/academics-finance.actions";
import { getLiveStudentsAction } from "@/app/actions/live-data.actions";

interface LoanRow {
  id: string;
  bookId: string;
  accNo: string;
  book: string;
  member: string;
  due: string;
  status: string;
}

export default function LibraryCirculationPage() {
  const { showToast } = useToast();
  const [issues, setIssues] = React.useState<LoanRow[]>([]);
  const [bookOptions, setBookOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [memberOptions, setMemberOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [selectedMemberId, setSelectedMemberId] = React.useState("");
  const [selectedBookId, setSelectedBookId] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(async () => {
    const [ops, students] = await Promise.all([listP1OperationsDataAction(), getLiveStudentsAction()]);
    if (ops.ok && ops.data) {
      const books = ops.data.books.map((b) => ({
        label: `${b.accession_no} — ${b.title} (${b.available_copies} avail)`,
        value: b.id,
      }));
      setBookOptions(books);
      setSelectedBookId((prev) => prev || (books[0]?.value ?? ""));
      setIssues(
        ops.data.issues
          .filter((i) => i.status !== "Returned")
          .map((i) => {
            const b = Array.isArray(i.library_books) ? i.library_books[0] : i.library_books;
            return {
              id: i.id,
              bookId: i.book_id,
              accNo: b?.accession_no ?? "LIB",
              book: b?.title ?? "Book",
              member: i.member_name,
              due: i.due_on,
              status: new Date(i.due_on).getTime() < Date.now() ? "Overdue" : i.status,
            };
          }),
      );
    }
    const members = students.map((s) => ({
      label: `${s.admissionId} — ${s.name} (${s.className})`,
      value: s.id,
    }));
    setMemberOptions(members);
    setSelectedMemberId((prev) => prev || (members[0]?.value ?? ""));
  }, []);

  React.useEffect(() => {
    let active = true;
    void Promise.all([listP1OperationsDataAction(), getLiveStudentsAction()]).then(([ops, students]) => {
      if (!active) return;
      if (ops.ok && ops.data) {
        const books = ops.data.books.map((b) => ({
          label: `${b.accession_no} — ${b.title} (${b.available_copies} avail)`,
          value: b.id,
        }));
        setBookOptions(books);
        if (books[0]) setSelectedBookId(books[0].value);
        setIssues(
          ops.data.issues
            .filter((i) => i.status !== "Returned")
            .map((i) => {
              const b = Array.isArray(i.library_books) ? i.library_books[0] : i.library_books;
              return {
                id: i.id,
                bookId: i.book_id,
                accNo: b?.accession_no ?? "LIB",
                book: b?.title ?? "Book",
                member: i.member_name,
                due: i.due_on,
                status: new Date(i.due_on).getTime() < Date.now() ? "Overdue" : i.status,
              };
            }),
        );
      }
      const members = students.map((s) => ({
        label: `${s.admissionId} — ${s.name} (${s.className})`,
        value: s.id,
      }));
      setMemberOptions(members);
      if (members[0]) setSelectedMemberId(members[0].value);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) {
      showToast("Select a book to issue.", "warning");
      return;
    }
    setBusy(true);
    const memberLabel = memberOptions.find((m) => m.value === selectedMemberId)?.label ?? "Student Member";
    const res = await issueOrReturnLibraryBookAction({
      mode: "issue",
      bookId: selectedBookId,
      memberId: selectedMemberId || undefined,
      memberName: memberLabel,
    });
    setBusy(false);
    if (!res.ok) {
      showToast(res.error ?? "Unable to issue book.", "warning");
      return;
    }
    showToast(`Issued book to ${memberLabel}.`, "success");
    await reload();
  };

  return (
    <AppShell
      role="admin"
      title="Issue / Return Desk (Circulation)"
      subtitle="Scan student RFID cards and book barcodes for instant 14-day loan checkout"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-5 p-6">
          <form onSubmit={handleIssue} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink">Issue New Book</h2>
            <Select
              label="Student Member"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              options={memberOptions.length ? memberOptions : [{ label: "Loading students...", value: "" }]}
            />
            <Select
              label="Library Book"
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              options={bookOptions.length ? bookOptions : [{ label: "Loading catalog...", value: "" }]}
            />
            <Button type="submit" variant="primary" size="lg" disabled={busy || !selectedBookId} className="w-full">
              {busy ? "Issuing..." : "Confirm Issue (14 Days)"}
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-7 p-5 flex flex-col gap-4">
          <h2 className="text-base font-bold text-ink">Active Book Loans</h2>
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Active book loans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle border-b border-line">
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Acc No</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Book Title</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Member</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Due</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-ink-muted">
                      No active book loans currently issued.
                    </td>
                  </tr>
                ) : (
                  issues.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 px-3 text-sm font-bold text-ink">{row.accNo}</td>
                      <td className="py-3 px-3 text-sm text-ink">{row.book}</td>
                      <td className="py-3 px-3 text-sm text-ink-secondary">{row.member}</td>
                      <td className="py-3 px-3">
                        <StatusBadge tone={row.status.includes("Overdue") ? "danger" : "info"}>
                          {row.due}
                        </StatusBadge>
                      </td>
                      <td className="py-3 px-3">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true);
                            const res = await issueOrReturnLibraryBookAction({
                              mode: "return",
                              bookId: row.bookId,
                              issueId: row.id,
                            });
                            setBusy(false);
                            if (!res.ok) {
                              showToast(res.error ?? "Unable to mark returned.", "warning");
                              return;
                            }
                            showToast(`Returned ${row.accNo}.`, "success");
                            await reload();
                          }}
                        >
                          Mark Returned
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

