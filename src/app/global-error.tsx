"use client";

import React from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink font-sans flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-lg border border-line bg-surface p-8 text-center shadow-card flex flex-col items-center gap-4">
          <h1 className="text-xl font-bold text-ink">System Recovery</h1>
          <p className="text-sm text-ink-secondary">
            EduCore encountered an unexpected application error.
          </p>
          <button
            type="button"
            onClick={reset}
            className="min-h-11 px-4 py-2 rounded-md bg-brand text-ink-on-dark text-sm font-semibold cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}

