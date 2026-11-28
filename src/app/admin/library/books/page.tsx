"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { getLiveBooksAction } from "@/app/actions/live-data.actions";
import type { LibraryBook } from "@/types/domain";

export default function LibraryBooksListPage() {
  const [rows, setRows] = React.useState<LibraryBook[]>([]);
  React.useEffect(() => {
    let active = true;
    void getLiveBooksAction().then((data) => {
      if (active) setRows(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DataTablePage<LibraryBook>
      role="admin"
      title="Library Catalog & Book Inventory"
      subtitle="Indexed volumes tracked with barcode / RFID accession numbers"
      rows={rows}
      searchPlaceholder="Search title, author, ISBN, shelf..."
      primaryAction={{ label: "Add Book", href: "/admin/library/books/manage" }}
      secondaryActions={[
        { label: "Issue / Return", href: "/admin/library/circulation" },
        { label: "Members & Fines", href: "/admin/library/members" },
      ]}
      columns={[
        { id: "acc", header: "Acc No", accessor: (r) => r.accNo, href: () => "/admin/library/books/manage" },
        { id: "title", header: "Book Title", accessor: (r) => r.title },
        { id: "author", header: "Author", accessor: (r) => r.author },
        { id: "cat", header: "Category", accessor: (r) => r.category },
        { id: "shelf", header: "Shelf", accessor: (r) => r.shelf },
        { id: "stock", header: "Available", accessor: (r) => `${r.available} / ${r.total}` },
        {
          id: "status",
          header: "Status",
          accessor: (r) => r.status,
          badgeTone: (r) =>
            r.status === "Available" ? "success" : r.status === "Low Stock" ? "warning" : "danger",
        },
      ]}
    />
  );
}

