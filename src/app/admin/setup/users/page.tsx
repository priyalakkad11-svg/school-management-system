"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { Button, Input, Select } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";
import { SetupService } from "@/services/setup.service";
import type { TableQueryParams } from "@/lib/query";
import type { AdminUser } from "@/types/domain";

export default function AdminUsersManagementPage() {
  const { showToast } = useToast();
  const [query, setQuery] = React.useState<TableQueryParams>({ page: 1, pageSize: 8 });
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviting, setInviting] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [roleLabel, setRoleLabel] = React.useState("Accountant");
  const [portalRole, setPortalRole] = React.useState<"admin" | "staff" | "teacher">("staff");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["setup-portal-users", query],
    queryFn: () => SetupService.listPortalUsers(query),
  });

  const users = data?.ok && data.data ? data.data.rows : [];
  const total = data?.ok && data.data ? data.data.total : 0;
  const errorMsg = data && !data.ok ? (data.error ?? "Unable to load portal users.") : null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setInviting(true);
    try {
      const res = await SetupService.invitePortalUser({
        fullName: name.trim(),
        email: email.trim(),
        roleLabel,
        portalRole,
      });
      if (!res.ok || !res.data) {
        showToast(res.error ?? "Unable to create user.", "warning");
        return;
      }
      setInviteOpen(false);
      setName("");
      setEmail("");
      showToast(`Invited ${res.data.user.email} (Temp password: ${res.data.tempPassword})`);
      await refetch();
    } finally {
      setInviting(false);
    }
  };

  const handleToggleStatus = async (row: AdminUser) => {
    const nextStatus = row.status === "Active" ? "Suspended" : "Active";
    const res = await SetupService.togglePortalUserStatus({ userId: row.id, nextStatus });
    if (!res.ok) {
      showToast(res.error ?? "Unable to update status.", "warning");
      return;
    }
    showToast(`${row.name} marked ${nextStatus}.`);
    await refetch();
  };

  return (
    <>
      <DataTablePage<AdminUser>
        role="admin"
        title="Admin Users & Access Management"
        subtitle="Administrative & Portal Users with role status control and last-login audit"
        rows={users}
        searchPlaceholder="Name, email or code..."
        primaryAction={{ label: "Invite Admin User", onClick: () => setInviteOpen(true) }}
        serverSide={{
          total,
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 8,
          loading: isLoading,
          error: errorMsg,
          onRetry: () => void refetch(),
          onQueryChange: setQuery,
        }}
        filters={[
          {
            key: "role",
            label: "Portal Role",
            options: [
              { label: "Admin", value: "admin" },
              { label: "Staff", value: "staff" },
              { label: "Teacher", value: "teacher" },
              { label: "Student", value: "student" },
              { label: "Parent", value: "parent" },
            ],
            predicate: () => true,
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
              r.role.includes("Admin")
                ? "primary"
                : r.role.includes("Account") || r.role.includes("Teacher")
                  ? "info"
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
        rowActions={(r) => (
          <Button size="sm" variant="outline" onClick={() => void handleToggleStatus(r)}>
            {r.status === "Active" ? "Suspend" : "Activate"}
          </Button>
        )}
      />

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Admin / Staff User">
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Official Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select
            label="Portal Access Role"
            value={portalRole}
            onChange={(e) => setPortalRole(e.target.value as "admin" | "staff" | "teacher")}
            options={[
              { label: "Operations Staff", value: "staff" },
              { label: "Administrator", value: "admin" },
              { label: "Teacher", value: "teacher" },
            ]}
          />
          <Select
            label="Designation / Job Role"
            value={roleLabel}
            onChange={(e) => setRoleLabel(e.target.value)}
            options={[
              { label: "Accountant", value: "Accountant" },
              { label: "Exam Controller", value: "Exam Controller" },
              { label: "Head Librarian", value: "Head Librarian" },
              { label: "Sub-Admin", value: "Sub-Admin" },
            ]}
          />
          <Button type="submit" variant="primary" className="w-full" disabled={inviting}>
            {inviting ? "Creating Account..." : "Create Account & Issue Temp Password"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
