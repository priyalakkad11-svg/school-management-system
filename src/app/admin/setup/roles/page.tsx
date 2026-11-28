"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, ErrorState, Input, Select, Skeleton, StatusBadge } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";
import { SetupService } from "@/services/setup.service";
import type { RbacPermissionDto } from "@/app/actions/setup.actions";

type PermAction = "view" | "create" | "edit" | "del" | "exp";

export default function RolesPermissionsPage() {
  const { showToast } = useToast();
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");
  const [draftOverrides, setDraftOverrides] = React.useState<Record<string, RbacPermissionDto[]>>({});
  const [saving, setSaving] = React.useState(false);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [newRoleName, setNewRoleName] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["setup-rbac-roles"],
    queryFn: () => SetupService.listRbacRoles(),
  });

  const roles = data?.ok && data.data ? data.data : [];
  const activeRoleId =
    selectedRoleId && roles.some((r) => r.id === selectedRoleId)
      ? selectedRoleId
      : roles[0]?.id ?? "";
  const currentRole = roles.find((r) => r.id === activeRoleId);
  const matrix: RbacPermissionDto[] =
    (activeRoleId && draftOverrides[activeRoleId]) || currentRole?.permissions || [];

  const toggle = (moduleName: string, key: PermAction) => {
    if (!activeRoleId) return;
    const next = matrix.map((p) => (p.module === moduleName ? { ...p, [key]: !p[key] } : p));
    setDraftOverrides((prev) => ({ ...prev, [activeRoleId]: next }));
  };

  const handleSaveMatrix = async () => {
    if (!currentRole) return;
    setSaving(true);
    try {
      const res = await SetupService.saveRolePermissions({
        roleId: currentRole.id,
        permissions: matrix,
      });
      if (!res.ok) {
        showToast(res.error ?? "Unable to save RBAC permissions.", "warning");
        return;
      }
      showToast(`Saved permissions matrix for ${currentRole.name}.`);
      setDraftOverrides((prev) => {
        const copy = { ...prev };
        delete copy[currentRole.id];
        return copy;
      });
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setCreating(true);
    try {
      const res = await SetupService.createCustomRole({ name: newRoleName.trim() });
      if (!res.ok || !res.data) {
        showToast(res.error ?? "Unable to create custom role.", "warning");
        return;
      }
      setSelectedRoleId(res.data.id);
      setNewRoleName("");
      setModalOpen(false);
      showToast(`Custom role "${res.data.name}" created.`);
      await refetch();
    } finally {
      setCreating(false);
    }
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
            value={activeRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            options={roles.map((r) => ({ label: r.name, value: r.id }))}
          />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" disabled={saving || !currentRole} onClick={() => void handleSaveMatrix()}>
            {saving ? "Saving..." : "Save Permissions"}
          </Button>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            + Create Custom Role
          </Button>
        </div>
      </div>

      <Card className="p-5 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            Module Permission Matrix — {currentRole?.name ?? "Select Role"}
          </h2>
          <span className="text-xs text-ink-muted">{matrix.length} entries</span>
        </div>

        {isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : !data?.ok ? (
          <ErrorState
            description={data?.error ?? "Unable to load RBAC roles."}
            onRetry={() => void refetch()}
          />
        ) : (
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
                  <tr key={row.module} className="hover:bg-subtle/60">
                    <td className="py-3.5 px-4 text-sm font-semibold text-ink">{row.module}</td>
                    {(["view", "create", "edit", "del", "exp"] as PermAction[]).map((col) => {
                      const allowed = row[col];
                      return (
                        <td key={`${row.module}-${col}`} className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => toggle(row.module, col)}
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
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Custom Staff Role">
        <form onSubmit={handleCreateRole} className="flex flex-col gap-4">
          <Input
            label="Role Name"
            placeholder="e.g., Transport Supervisor"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <Button type="submit" variant="primary" className="w-full" disabled={creating}>
            {creating ? "Saving Role..." : "Save Custom Role"}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
