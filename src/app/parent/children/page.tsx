"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { cn } from "@/lib/utils";

const CHILDREN = [
  {
    id: "aarav",
    name: "Aarav Rajesh Sharma",
    meta: "Class 10–A • Roll #01 • ADM-2026-0142",
    stats: "96.5% Attendance • 91.6% Term 1 Avg • ₹18,500 Due Jan 10",
  },
  {
    id: "diya",
    name: "Diya Rajesh Sharma",
    meta: "Class 6–C • Roll #14 • ADM-2026-0618",
    stats: "98.2% Attendance • 94.0% Term 1 Avg • ₹14,200 Due Jan 10",
  },
];

export default function ParentChildrenPage() {
  const { showToast } = useToast();
  const [activeId, setActiveId] = React.useState("aarav");

  return (
    <AppShell
      role="parent"
      title="Switch Child Profile"
      subtitle="Select a student to view attendance, grades, homework, and fee details across portals"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CHILDREN.map((child) => {
          const selected = child.id === activeId;
          return (
            <Card
              key={child.id}
              className={cn(
                "p-6 flex flex-col justify-between gap-4 border-2 transition-colors",
                selected ? "border-brand" : "border-line",
              )}
            >
              <div className="flex flex-col gap-2">
                <span className="self-start">
                  <StatusBadge tone={selected ? "primary" : "neutral"}>
                    {selected ? "Currently Selected" : "Switch Profile"}
                  </StatusBadge>
                </span>
                <h2 className="text-xl font-bold text-ink pt-1">{child.name}</h2>
                <p className="text-sm text-ink-secondary">{child.meta}</p>
                <p className="text-xs font-semibold text-success">{child.stats}</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                {selected ? (
                  <Link href="/parent">
                    <Button variant="secondary">Active Dashboard</Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setActiveId(child.id);
                      showToast(`Switched active student profile to ${child.name}.`);
                    }}
                  >
                    Switch to {child.name.split(" ")[0]}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
