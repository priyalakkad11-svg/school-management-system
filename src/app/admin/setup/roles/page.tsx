"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";

type PermAction = "view" | "create" | "edit" | "del" | "exp";

interface ModulePerm {
  id: string;
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  del: boolean;
  exp: boolean;
}

const INITIAL_PERMS: ModulePerm[] = [
  { id: "p1", module: "Fees & Receipts", view: true, create: true, edit: true, del: false, exp: true },
  { id: "p2", module: "Payroll & Salary Slips", view: true, create: true, edit: true, del: false, exp: true },
  { id: "p3", module: "Student Directory", view: true, create: false, edit: false, del: false, exp: true },
  { id: "p4", module: "Exams & Marks", view: false, create: false, edit: false, del: false, exp: false },
];

export default function RolesPermissionsPage() {
  const { showToast } = useToast();
  const [role, setRole] = React.useState("School Accountant (14 permissions)");
  const [matrix, setMatrix] = React.useState<ModulePerm[]>(INITIAL_PERMS);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [newRoleName, setNewRoleName] = React.useState("");

  const toggle = (id: string, key: PermAction) => {
    setMatrix((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: !r[key] } : r)));
  };

  return (
    <AppShell
      role="admin"
      title="Roles & RBAC Permissions Matrix"
      subtitle="Fine-grained module CRUD & export permissions per administrative staff role"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full sm:w-80">
          <Select
            label="Editing Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { label: "School Accountant (14 permissions)", value: "School Accountant (14 permissions)" },
              { label: "Exam Controller (18 permissions)", value: "Exam Controller (18 permissions)" },
              { label: "Head Librarian (9 permissions)", value: "Head Librarian (9 permissions)" },
            ]}
          />
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Create Custom Role
        </Button>
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            Module Permission Matrix — {role.split(" (")[0]}
          </h2>
          <span className="text-xs text-ink-muted">{matrix.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="RBAC permissions matrix">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Module</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">View</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Create</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Edit</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Delete</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {matrix.map((row) => (
                <tr key={row.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{row.module}</td>
                  {(["view", "create", "edit", "del", "exp"] as PermAction[]).map((col) => {
                    const allowed = row[col];
                    return (
                      <td key={`${row.id}-${col}`} className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => toggle(row.id, col)}
                          aria-label={`${row.module} ${col}: ${allowed ? "Yes" : "No"}`}
                          className="cursor-pointer rounded-full"
                        >
                          <StatusBadge tone={allowed ? "success" : "danger"}>
                            {allowed ? "✓ Yes" : "✕ No"}
                          </StatusBadge>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Custom Staff Role">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newRoleName.trim()) return;
            showToast(`Custom role "${newRoleName}" created.`);
            setModalOpen(false);
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Role Name"
            placeholder="e.g., Transport Supervisor"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <Button type="submit" variant="primary" className="w-full">
            Save Custom Role
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}

