"use client";

import React from "react";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: string;
  message: string;
  tone: "success" | "warning";
}

interface ToastCtxValue {
  showToast: (message: string, tone?: "success" | "warning") => void;
}

const ToastContext = React.createContext<ToastCtxValue>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const showToast = React.useCallback((message: string, tone: "success" | "warning" = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between gap-3 rounded-md border px-4 py-3 shadow-modal bg-surface text-sm font-medium",
              t.tone === "success" ? "border-success text-ink" : "border-warning text-ink",
            )}
          >
            <span className="inline-flex items-center gap-2">
              {t.tone === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              )}
              <span>{t.message}</span>
            </span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-sidebar/50 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="bg-surface border border-line rounded-none sm:rounded-lg shadow-modal w-full h-full sm:h-auto sm:max-w-lg max-h-screen overflow-y-auto p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-md text-ink-secondary hover:bg-subtle cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex bg-sidebar/60"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-72 max-w-[85vw] bg-sidebar text-ink-on-dark h-full flex flex-col p-4 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-sidebar-hover">
          <span className="font-bold text-base">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation drawer"
            className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-md text-ink-on-dark-muted hover:bg-sidebar-hover hover:text-ink-on-dark cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="pt-4 flex-1">{children}</div>
      </div>
      <button
        type="button"
        aria-label="Close drawer backdrop"
        className="flex-1 cursor-default"
        onClick={onClose}
      />
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-ink-secondary">{description}</p>
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

