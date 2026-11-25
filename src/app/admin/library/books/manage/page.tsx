"use client";

import { FormPage } from "@/components/templates/FormPage";

export default function ManageBookPage() {
  return (
    <FormPage
      role="admin"
      title="Add / Edit Library Book"
      subtitle="Register new ISBN acquisitions, rack locations, and barcode accession tags"
      sectionTitle="Catalog Entry"
      cancelHref="/admin/library/books"
      submitLabel="Save Book to Catalog"
      initialValues={{
        accNo: "LIB-6120",
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        isbn: "978-0262046305",
        category: "Computer Sci.",
        shelf: "CS D-04",
        copies: "6",
      }}
      fields={[
        { name: "accNo", label: "Accession No", type: "text", required: true },
        { name: "isbn", label: "ISBN-13", type: "text", required: true },
        { name: "title", label: "Book Title", type: "text", required: true },
        { name: "author", label: "Author", type: "text", required: true },
        {
          name: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Computer Sci.", value: "Computer Sci." },
            { label: "Physics", value: "Physics" },
            { label: "Mathematics", value: "Mathematics" },
            { label: "Literature", value: "Literature" },
          ],
        },
        { name: "shelf", label: "Shelf / Rack Code", type: "text" },
        { name: "copies", label: "Total Copies", type: "number" },
      ]}
    />
  );
}

