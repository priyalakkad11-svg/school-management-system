import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button, Card } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center flex flex-col items-center gap-4">
        <span className="w-12 h-12 rounded-full bg-brand-soft text-brand inline-flex items-center justify-center">
          <SearchX className="w-6 h-6" aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold text-brand bg-brand-soft px-3 py-1 rounded-full">
          HTTP 404
        </span>
        <h1 className="text-xl font-bold text-ink">Page Not Found</h1>
        <p className="text-sm text-ink-secondary">
          The school portal screen or record you requested could not be found.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="primary">School Home</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Portal Login</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

