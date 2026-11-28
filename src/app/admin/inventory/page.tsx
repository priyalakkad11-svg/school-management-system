"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { Button, Input } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";
import { getLiveInventoryAction } from "@/app/actions/live-data.actions";
import { formatInr } from "@/lib/utils";
import type { InventoryAsset } from "@/types/domain";

export default function InventoryAssetsPage() {
  const { showToast } = useToast();
  const [assets, setAssets] = React.useState<InventoryAsset[]>([]);
  const [open, setOpen] = React.useState(false);
  const [tag, setTag] = React.useState("AST-IT-099");
  const [name, setName] = React.useState("");
  const [dept, setDept] = React.useState("CS Lab 1 & 2");

  React.useEffect(() => {
    let active = true;
    void getLiveInventoryAction().then((data) => {
      if (active) setAssets(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAssets((prev) => [
      { id: `ast-${Date.now()}`, tag, name: name.trim(), department: dept, quantity: 10, valueInr: 150000, condition: "Good" },
      ...prev,
    ]);
    setOpen(false);
    setName("");
    showToast("Asset registered in fixed asset ledger.");
  };

  return (
    <>
      <DataTablePage<InventoryAsset>
        role="admin"
        title="Campus Inventory & Fixed Assets"
        subtitle="IT hardware, laboratory equipment, projectors, and classroom furniture register"
        rows={assets}
        searchPlaceholder="Search asset tag, item name, department..."
        primaryAction={{ label: "Register Asset", onClick: () => setOpen(true) }}
        columns={[
          { id: "tag", header: "Asset Tag", accessor: (r) => r.tag },
          { id: "name", header: "Asset Name", accessor: (r) => r.name },
          { id: "dept", header: "Department", accessor: (r) => r.department },
          { id: "qty", header: "Quantity", accessor: (r) => r.quantity },
          { id: "val", header: "Valuation", accessor: (r) => formatInr(r.valueInr) },
          {
            id: "cond",
            header: "Condition",
            accessor: (r) => r.condition,
            badgeTone: (r) => (r.condition === "Good" ? "success" : "warning"),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Register Campus Asset">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <Input label="Asset Tag" value={tag} onChange={(e) => setTag(e.target.value)} />
          <Input label="Item Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Department / Lab" value={dept} onChange={(e) => setDept(e.target.value)} />
          <Button type="submit" variant="primary" className="w-full">
            Save Asset
          </Button>
        </form>
      </Modal>
    </>
  );
}

