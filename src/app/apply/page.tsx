"use client";

import React from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, Input, Select, StatusBadge, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const GRADE_OPTIONS = [
  { label: "Nursery / Kindergarten", value: "KG" },
  { label: "Primary (Grades 1–5)", value: "Grade 3" },
  { label: "Middle School (Grades 6–8)", value: "Grade 7" },
  { label: "High School (Grades 9–11)", value: "Grade 9" },
];

export default function ApplyAdmissionPage() {
  const { showToast } = useToast();
  const [childName, setChildName] = React.useState("");
  const [grade, setGrade] = React.useState("Grade 7");
  const [parentName, setParentName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [submittedRef, setSubmittedRef] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !parentName.trim() || !phone.trim()) {
      showToast("Please complete child name, parent name, and phone.", "warning");
      return;
    }
    const ref = `ENQ-${Math.floor(1000 + Math.random() * 8999)}`;
    setSubmittedRef(ref);
    showToast(`Admission enquiry ${ref} submitted!`);
  };

  return (
    <PublicLayout>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="self-start">
            <StatusBadge tone="primary">Academic Year 2026–27</StatusBadge>
          </span>
          <h1 className="text-3xl font-bold text-ink">Online Admission Enquiry</h1>
          <p className="text-sm text-ink-secondary">
            Complete the enquiry form below and our Admissions Desk will schedule your campus tour.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {submittedRef ? (
            <div className="flex flex-col items-start gap-4">
              <StatusBadge tone="success">Enquiry Received • {submittedRef}</StatusBadge>
              <h2 className="text-xl font-bold text-ink">Thank you, {parentName}!</h2>
              <p className="text-sm text-ink-secondary">
                Your application for {childName} ({grade}) is logged under reference {submittedRef}.
                Our Admissions Counselor will contact {phone} within 1 business day.
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setSubmittedRef(null)}>
                  Submit Another Enquiry
                </Button>
                <Link href="/">
                  <Button variant="primary">Back to Home</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student Full Name"
                placeholder="e.g., Naina Kulkarni"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
              />
              <Select
                label="Applying Grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                options={GRADE_OPTIONS}
              />
              <Input
                label="Parent / Guardian Name"
                placeholder="e.g., Mrs. Sneha Kulkarni"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
              />
              <Input
                label="Mobile Number"
                placeholder="+91 98200 11223"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Previous School / Transport Requirement (Optional)"
                  placeholder="Specify transport stop or sibling details if any..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2 pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                  Submit Admission Enquiry
                </Button>
              </div>
            </form>
          )}
        </Card>
      </section>
    </PublicLayout>
  );
}

