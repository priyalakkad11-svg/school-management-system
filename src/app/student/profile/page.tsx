"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

export default function StudentProfilePage() {
  const { showToast } = useToast();

  return (
    <AppShell
      role="student"
      title="My Student Profile"
      subtitle="Verified admission record, guardian contacts, and digital RFID identity"
    >
      <Card className="p-6 flex flex-col gap-2">
        <span className="self-start">
          <StatusBadge tone="primary">ADM-2026-0142 • Class 10–A • Roll #01</StatusBadge>
        </span>
        <h2 className="text-2xl font-bold text-ink pt-1">Aarav Rajesh Sharma</h2>
        <p className="text-sm text-ink-secondary">
          House: Emerald • DOB: 14 May 2011 • Blood Group: O+ • Bus Route #04 (Oakridge Stop)
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col gap-3">
          <h3 className="text-base font-bold text-ink">Guardian &amp; Contact Info</h3>
          <ul className="flex flex-col gap-2.5 text-sm text-ink-secondary">
            <li>Father: Mr. Rajesh Sharma (+91 98250 11223)</li>
            <li>Mother: Mrs. Sunita Sharma (+91 98250 11224)</li>
            <li>Address: 42 Rosewood Residency, Sector 14, Pune</li>
            <li>Email: aarav.sharma@student.greenwood.edu</li>
          </ul>
        </Card>

        <Card className="p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-bold text-ink">Academic &amp; ID Documents</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-ink-secondary">
              <li>Class Teacher: Mrs. Kavita Nair</li>
              <li>Admission Date: 01 Apr 2020</li>
              <li>Digital ID Card: Active (Valid Mar 2027)</li>
            </ul>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => {
                showToast("Preparing Digital ID Card for print/download.");
                window.print();
              }}
            >
              Download Digital ID Card
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

