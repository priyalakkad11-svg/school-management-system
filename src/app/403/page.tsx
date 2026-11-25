import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button, Card } from "@/components/ui/primitives";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center flex flex-col items-center gap-4">
        <span className="w-12 h-12 rounded-full bg-warning-soft text-warning inline-flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold text-warning bg-warning-soft px-3 py-1 rounded-full">
          HTTP 403
        </span>
        <h1 className="text-xl font-bold text-ink">Access Restricted</h1>
        <p className="text-sm text-ink-secondary">
          Your active portal role does not have permission to view this section.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/login">
            <Button variant="primary">Switch Role</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">School Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

