"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, StatusBadge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/overlays";
import { getLiveBooksAction } from "@/app/actions/live-data.actions";
import type { LibraryBook } from "@/types/domain";

const ISSUED_BOOKS = [
  { id: "b1", title: "Concepts of Physics Vol. 2", author: "H.C. Verma", accNo: "LIB-4421", issueDate: "18 Nov 2026", dueDate: "02 Dec 2026", status: "Issued (7d left)", tone: "info" as const },
  { id: "b2", title: "R.D. Sharma Class 10 Reference", author: "R.D. Sharma", accNo: "LIB-1189", issueDate: "10 Nov 2026", dueDate: "24 Nov 2026", status: "1 Day Overdue (₹10)", tone: "danger" as const },
  { id: "b3", title: "To Kill a Mockingbird", author: "Harper Lee", accNo: "LIB-0923", issueDate: "01 Oct 2026", dueDate: "15 Oct 2026", status: "Returned", tone: "success" as const },
];

export default function StudentLibraryPage() {
  const [catalogOpen, setCatalogOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [books, setBooks] = React.useState<LibraryBook[]>([]);

  React.useEffect(() => {
    let active = true;
    void getLiveBooksAction().then((data) => {
      if (active) setBooks(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredCatalog = books.filter(
    (b) =>
      !search.trim() ||
      b.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      b.author.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <AppShell
      role="student"
      title="Library — My Issued Books"
      subtitle="Track active book loans, due dates, and search the campus digital catalog"
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Currently Issued Books &amp; Return History</h2>
          <span className="text-xs text-ink-muted">{ISSUED_BOOKS.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Issued books list">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Book Title</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Author</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">ISBN / Acc No</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Issue Date</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Due Date</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ISSUED_BOOKS.map((book) => (
                <tr key={book.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{book.title}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{book.author}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{book.accNo}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{book.issueDate}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{book.dueDate}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={book.tone}>{book.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div>
        <Button variant="outline" onClick={() => setCatalogOpen(true)}>
          Search School Library Catalog (14,200+ Books)
        </Button>
      </div>

      <Modal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        title="School Library Catalog"
      >
        <div className="flex flex-col gap-3">
          <Input
            label="Search Title or Author"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="divide-y divide-line">
            {filteredCatalog.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-ink">{b.title}</div>
                  <div className="text-xs text-ink-secondary">
                    {b.author} • Shelf {b.shelf}
                  </div>
                </div>
                <StatusBadge tone={b.available > 0 ? "success" : "warning"}>
                  {b.available}/{b.total} avail
                </StatusBadge>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

