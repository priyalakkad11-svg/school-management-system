"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { cn } from "@/lib/utils";
import { getLiveStudentsAction } from "@/app/actions/live-data.actions";

interface ChildCard {
  id: string;
  name: string;
  meta: string;
  stats: string;
}

export default function ParentChildrenPage() {
  const { showToast } = useToast();
  const [children, setChildren] = React.useState<ChildCard[]>([]);
  const [activeId, setActiveId] = React.useState("");

  React.useEffect(() => {
    let active = true;
    void getLiveStudentsAction().then((students) => {
      if (!active) return;
      const stored = typeof window !== "undefined" ? window.localStorage.getItem("educore_active_child") : null;
      const cards: ChildCard[] = students.slice(0, 6).map((s) => ({
        id: s.id,
        name: s.name,
        meta: `${s.className}–${s.section} • Roll #${s.rollNo} • ${s.admissionId}`,
        stats: `${s.attendancePct}% Attendance • ${s.termAvgPct}% Term Avg • ₹${s.feeDueAmount.toLocaleString("en-IN")} Balance`,
      }));
      setChildren(cards);
      if (cards.length > 0) {
        setActiveId(stored && cards.some((c) => c.id === stored) ? stored : cards[0].id);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell
      role="parent"
      title="Switch Child Profile"
      subtitle="Select a student to view attendance, grades, homework, and fee details across portals"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child) => {
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
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem("educore_active_child", child.id);
                      }
                      showToast(`Switched active student profile to ${child.name}.`, "success");
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

