import Link from "next/link";
import { ServerCrash } from "lucide-react";
import { Button, Card } from "@/components/ui/primitives";

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center flex flex-col items-center gap-4">
        <span className="w-12 h-12 rounded-full bg-danger-soft text-danger inline-flex items-center justify-center">
          <ServerCrash className="w-6 h-6" aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold text-danger bg-danger-soft px-3 py-1 rounded-full">
          HTTP 500
        </span>
        <h1 className="text-xl font-bold text-ink">Temporary Service Disruption</h1>
        <p className="text-sm text-ink-secondary">
          We are experiencing a brief issue connecting to campus records. Please try again shortly.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/help">
            <Button variant="primary">Contact IT Helpdesk</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

