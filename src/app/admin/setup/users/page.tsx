"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { Button, Input, Select } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";
import { MOCK_ADMIN_USERS } from "@/mocks/school.data";
import type { AdminUser } from "@/types/domain";

export default function AdminUsersManagementPage() {
  const { showToast } = useToast();
  const [users, setUsers] = React.useState<AdminUser[]>(MOCK_ADMIN_USERS);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("Accountant");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setUsers((prev) => [
      {
        id: `au-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role,
        lastLogin: "Invited just now",
        twoFactor: false,
        status: "Active",
      },
      ...prev,
    ]);
    setInviteOpen(false);
    setName("");
    setEmail("");
    showToast("Administrative portal invite email dispatched.");
  };

  return (
    <>
      <DataTablePage<AdminUser>
        role="admin"
        title="Admin Users & Access Management"
        subtitle="Administrative Portal Users (14) with 2FA enforcement and last-login audit"
        rows={users}
        searchPlaceholder="Name or email..."
        primaryAction={{ label: "Invite Admin User", onClick: () => setInviteOpen(true) }}
        filters={[
          {
            key: "role",
            label: "Role Filter",
            options: [
              { label: "Super Admin", value: "Super Admin" },
              { label: "Accountant", value: "Accountant" },
              { label: "Exam Controller", value: "Exam Controller" },
              { label: "Librarian", value: "Librarian" },
            ],
            predicate: (row, val) => row.role === val,
          },
        ]}
        columns={[
          { id: "name", header: "Name", accessor: (r) => r.name },
          { id: "email", header: "Email", accessor: (r) => r.email },
          {
            id: "role",
            header: "Assigned Role",
            accessor: (r) => r.role,
            badgeTone: (r) =>
              r.role === "Super Admin"
                ? "primary"
                : r.role === "Accountant"
                  ? "info"
                  : r.role === "Exam Controller"
                    ? "warning"
                    : "neutral",
          },
          { id: "lastLogin", header: "Last Login", accessor: (r) => r.lastLogin },
          { id: "twoFactor", header: "2FA", accessor: (r) => (r.twoFactor ? "Enabled" : "Pending") },
          {
            id: "status",
            header: "Status",
            accessor: (r) => r.status,
            badgeTone: (r) => (r.status === "Active" ? "success" : "danger"),
          },
        ]}
      />

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Admin User">
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Official Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select
            label="Assigned Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { label: "Accountant", value: "Accountant" },
              { label: "Exam Controller", value: "Exam Controller" },
              { label: "Librarian", value: "Librarian" },
            ]}
          />
          <Button type="submit" variant="primary" className="w-full">
            Send Setup Invitation
          </Button>
        </form>
      </Modal>
    </>
  );
}

