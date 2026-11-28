"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { listEnquiriesAction, updateEnquiryStatusAction } from "@/app/actions/students-staff.actions";

export default function AdmissionApplicationReviewPage() {
  const { showToast } = useToast();
  const [enquiryId, setEnquiryId] = React.useState<string | null>(null);
  const [decision, setDecision] = React.useState<"Pending Review" | "Approved" | "Test Scheduled" | "Rejected">("Pending Review");
  const [score, setScore] = React.useState("88 / 100 (Math + English)");
  const [panelStatus, setPanelStatus] = React.useState("Recommended by Principal");
  const [remarks, setRemarks] = React.useState(
    "Strong academic background; sibling discount eligible.",
  );

  React.useEffect(() => {
    let active = true;
    void listEnquiriesAction().then((res) => {
      if (active && res.ok && res.data?.[0]) {
        setEnquiryId(res.data[0].id);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const persistDecision = async (
    uiState: "Approved" | "Test Scheduled" | "Rejected",
    dbStatus: "Approved" | "Assessment Scheduled" | "Rejected",
    toastMsg: string,
    tone?: "warning",
  ) => {
    setDecision(uiState);
    if (enquiryId) {
      await updateEnquiryStatusAction({ enquiryId, status: dbStatus });
    }
    showToast(toastMsg, tone);
  };

  return (
    <AppShell
      role="admin"
      title="Admission Application Review"
      subtitle="Inspect verified documents, committee remarks, and issue admission offer letters"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-7 p-6 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusBadge tone="info">APP-2026-448 • Applying for Class 6–B</StatusBadge>
            <StatusBadge
              tone={
                decision === "Approved"
                  ? "success"
                  : decision === "Rejected"
                    ? "danger"
                    : "primary"
              }
            >
              {decision}
            </StatusBadge>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-ink">Naina Siddharth Kulkarni</h2>
            <p className="text-sm text-ink-secondary pt-1">
              DOB: 04 Mar 2015 • Previous School: Vidya Niketan (92% in Class 5)
            </p>
          </div>

          <ul className="flex flex-col gap-2 text-sm text-ink">
            <li>✓ Birth Certificate — Uploaded &amp; Verified</li>
            <li>✓ Class 5 Progress Report — Uploaded</li>
            <li>✓ Transfer Certificate — Pending Final Issuance</li>
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() =>
                void persistDecision(
                  "Approved",
                  "Approved",
                  "Offer letter issued and admission status updated in Supabase.",
                )
              }
            >
              Approve &amp; Issue Offer Letter
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                void persistDecision(
                  "Test Scheduled",
                  "Assessment Scheduled",
                  "Entrance assessment slot scheduled.",
                )
              }
            >
              Schedule Entrance Test
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                void persistDecision("Rejected", "Rejected", "Application marked rejected.", "warning")
              }
            >
              Reject Application
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-5 p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-ink">Admission Committee Review</h2>
          <Input
            label="Entrance Assessment Score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          <Select
            label="Interview Panel Status"
            value={panelStatus}
            onChange={(e) => setPanelStatus(e.target.value)}
            options={[
              { label: "Recommended by Principal", value: "Recommended by Principal" },
              { label: "Waitlisted — Seat Quota", value: "Waitlisted — Seat Quota" },
            ]}
          />
          <Textarea
            label="Committee Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Card>
      </div>
    </AppShell>
  );
}

