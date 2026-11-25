"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button, Card } from "@/components/ui/primitives";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center flex flex-col items-center gap-4">
        <span className="w-12 h-12 rounded-full bg-danger-soft text-danger inline-flex items-center justify-center">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold text-ink">Unable to load this screen</h1>
        <p className="text-sm text-ink-secondary">
          {error.message || "An unexpected client error occurred while rendering this module."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

