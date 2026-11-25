"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  Skeleton,
  StatusBadge,
} from "@/components/ui/primitives";
import {
  MOCK_BOOKS,
  MOCK_FEE_TRANSACTIONS,
  MOCK_NOTICES,
  MOCK_STUDENTS,
} from "@/mocks/school.data";
import { formatInr } from "@/lib/utils";

const CATEGORIES = [
  { label: "All Modules (Global)", value: "all" },
  { label: "Students", value: "students" },
  { label: "Fee Invoices & Receipts", value: "fees" },
  { label: "Library & Notices", value: "library" },
];

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "Aarav";
  const [query, setQuery] = React.useState(initialQuery);
  const [category, setCategory] = React.useState("all");

  const q = query.trim().toLowerCase();

  const studentMatches = React.useMemo(
    () =>
      MOCK_STUDENTS.filter(
        (s) =>
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.admissionId.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q),
      ),
    [q],
  );

  const feeMatches = React.useMemo(
    () =>
      MOCK_FEE_TRANSACTIONS.filter(
        (f) =>
          !q ||
          f.studentName.toLowerCase().includes(q) ||
          f.receiptNo.toLowerCase().includes(q) ||
          f.feeHead.toLowerCase().includes(q),
      ),
    [q],
  );

  const resourceMatches = React.useMemo(() => {
    const books = MOCK_BOOKS.filter(
      (b) => !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q),
    ).map((b) => ({
      id: b.id,
      title: `Library Book: ${b.title}`,
      meta: `${b.author} • Shelf ${b.shelf} • ${b.available}/${b.total} available`,
      status: b.status,
      tone: b.status === "Available" ? ("info" as const) : ("warning" as const),
      href: "/admin/library/books",
    }));

    const notices = MOCK_NOTICES.filter(
      (n) => !q || n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q),
    ).map((n) => ({
      id: n.id,
      title: `Notice: ${n.title}`,
      meta: `${n.category} • ${n.date} • Audience: ${n.audience}`,
      status: n.status,
      tone: "primary" as const,
      href: "/admin/communication/notices",
    }));

    return [...books, ...notices];
  }, [q]);

  const showStudents = category === "all" || category === "students";
  const showFees = category === "all" || category === "fees";
  const showLibrary = category === "all" || category === "library";
  const totalCount =
    (showStudents ? studentMatches.length : 0) +
    (showFees ? feeMatches.length : 0) +
    (showLibrary ? resourceMatches.length : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-7">
            <Input
              label="Search across Students, Teachers, Fees, Books & Notices"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Aarav, RCP-4410, Mathematics..."
            />
          </div>
          <div className="md:col-span-3">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={CATEGORIES}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" variant="primary" className="w-full">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {totalCount === 0 ? (
        <EmptyState
          title="No matches found"
          description={`Nothing matched "${query}". Try searching for Aarav, Science, or RCP.`}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              Show All Records
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {showStudents && studentMatches.length > 0 ? (
            <Card className="p-5 flex flex-col gap-3">
              <h2 className="text-base font-bold text-ink">
                Students ({studentMatches.length} {studentMatches.length === 1 ? "match" : "matches"})
              </h2>
              <div className="divide-y divide-line">
                {studentMatches.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/students/profile?id=${s.admissionId}`}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-subtle/60 px-2 rounded-md"
                  >
                    <div>
                      <div className="text-sm font-bold text-ink">
                        {s.name} • {s.admissionId}
                      </div>
                      <div className="text-xs text-ink-secondary">
                        Class {s.className}-{s.section} • Roll #{s.rollNo} • Parent: {s.parentName}
                      </div>
                    </div>
                    <StatusBadge tone={s.status === "Active" ? "success" : "neutral"}>
                      {s.status}
                    </StatusBadge>
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

          {showFees && feeMatches.length > 0 ? (
            <Card className="p-5 flex flex-col gap-3">
              <h2 className="text-base font-bold text-ink">
                Fee Invoices &amp; Receipts ({feeMatches.length}{" "}
                {feeMatches.length === 1 ? "match" : "matches"})
              </h2>
              <div className="divide-y divide-line">
                {feeMatches.map((f) => (
                  <Link
                    key={f.id}
                    href={`/admin/fees/receipt`}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-subtle/60 px-2 rounded-md"
                  >
                    <div>
                      <div className="text-sm font-bold text-ink">
                        {f.receiptNo} • {f.studentName}
                      </div>
                      <div className="text-xs text-ink-secondary">
                        {f.feeHead} • {formatInr(f.netPaid || f.amount)} • {f.mode} on {f.date}
                      </div>
                    </div>
                    <StatusBadge
                      tone={
                        f.status === "Paid"
                          ? "success"
                          : f.status === "Due"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {f.status}
                    </StatusBadge>
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

          {showLibrary && resourceMatches.length > 0 ? (
            <Card className="p-5 flex flex-col gap-3">
              <h2 className="text-base font-bold text-ink">
                Library &amp; Notices ({resourceMatches.length}{" "}
                {resourceMatches.length === 1 ? "match" : "matches"})
              </h2>
              <div className="divide-y divide-line">
                {resourceMatches.map((r) => (
                  <Link
                    key={r.id}
                    href={r.href}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-subtle/60 px-2 rounded-md"
                  >
                    <div>
                      <div className="text-sm font-bold text-ink">{r.title}</div>
                      <div className="text-xs text-ink-secondary">{r.meta}</div>
                    </div>
                    <StatusBadge tone={r.tone}>{r.status}</StatusBadge>
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function GlobalSearchPage() {
  return (
    <AppShell
      role="common"
      title="Global Search Results"
      subtitle="Unified search across students, fee invoices, library books, and school notices"
    >
      <React.Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <SearchResultsContent />
      </React.Suspense>
    </AppShell>
  );
}

