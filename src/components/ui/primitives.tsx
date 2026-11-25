"use client";

import React from "react";
import { Check, ChevronDown, UploadCloud, AlertCircle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types/domain";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-brand text-ink-on-dark hover:bg-brand-hover border border-transparent",
    secondary: "bg-brand-soft text-brand hover:bg-brand-soft/80 border border-transparent",
    outline: "bg-surface text-ink border border-line hover:bg-subtle",
    danger: "bg-danger text-ink-on-dark hover:bg-danger/90 border border-transparent",
    ghost: "bg-transparent text-ink-secondary hover:bg-subtle border border-transparent",
  };

  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "min-h-9 px-3 py-1.5 text-xs rounded-md",
    md: "min-h-11 px-4 py-2.5 text-sm rounded-md",
    lg: "min-h-12 px-5 py-3 text-sm rounded-md",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const BADGE_TONES: Record<StatusTone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  primary: "bg-brand-soft text-brand",
  neutral: "bg-subtle text-ink-secondary",
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-surface border border-line rounded-lg shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  title,
  value,
  delta,
  icon,
  deltaTone = "success",
}: {
  title: string;
  value: string;
  delta: string;
  icon?: React.ReactNode;
  deltaTone?: StatusTone;
}) {
  const deltaColor: Record<StatusTone, string> = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    info: "text-info",
    primary: "text-brand",
    neutral: "text-ink-secondary",
  };
  return (
    <Card className="p-5 flex flex-col justify-between gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-ink-secondary">{title}</span>
        {icon ? (
          <span className="w-9 h-9 rounded-md bg-brand-soft text-brand inline-flex items-center justify-center shrink-0">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="text-2xl sm:text-[28px] font-bold leading-tight text-ink">{value}</div>
      <div className={cn("text-xs font-medium", deltaColor[deltaTone])}>{delta}</div>
    </Card>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label ? (
        <label htmlFor={inputId} className="text-xs font-medium text-ink">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "min-h-11 w-full rounded-md bg-surface border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-2 focus:outline-offset-0 focus:outline-line-focus",
          error && "border-danger",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-ink-muted">{hint}</span>
      ) : null}
    </div>
  );
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export function Select({ label, error, options, id, className, ...props }: SelectProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label ? (
        <label htmlFor={selectId} className="text-xs font-medium text-ink">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "min-h-11 w-full appearance-none rounded-md bg-surface border border-line pl-3 pr-9 py-2 text-sm text-ink focus:outline-2 focus:outline-offset-0 focus:outline-line-focus",
            error && "border-danger",
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="w-4 h-4 text-ink-secondary pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className, ...props }: TextareaProps) {
  const generatedId = React.useId();
  const areaId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label ? (
        <label htmlFor={areaId} className="text-xs font-medium text-ink">
          {label}
        </label>
      ) : null}
      <textarea
        id={areaId}
        className={cn(
          "min-h-24 w-full rounded-md bg-surface border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-2 focus:outline-offset-0 focus:outline-line-focus",
          error && "border-danger",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
  id,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}) {
  const generatedId = React.useId();
  const cbId = id ?? generatedId;
  return (
    <label htmlFor={cbId} className="inline-flex items-center gap-2.5 min-h-11 cursor-pointer select-none">
      <input
        id={cbId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "w-4 h-4 rounded-sm border inline-flex items-center justify-center transition-colors",
          checked ? "bg-brand border-brand text-ink-on-dark" : "bg-surface border-line",
        )}
      >
        {checked ? <Check className="w-3 h-3 stroke-[3]" /> : null}
      </span>
      <span className="text-xs font-medium text-ink-secondary">{label}</span>
    </label>
  );
}

export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sz =
    size === "lg" ? "w-16 h-16 text-lg" : size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-xs";
  return (
    <span
      className={cn(
        "rounded-full bg-brand-soft text-brand font-semibold inline-flex items-center justify-center shrink-0",
        sz,
      )}
    >
      {initials}
    </span>
  );
}

export function Tabs({
  items,
  active,
  onChange,
}: {
  items: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(item.key)}
            className={cn(
              "min-h-11 px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer",
              isActive
                ? "bg-brand text-ink-on-dark"
                : "bg-surface text-ink-secondary border border-line hover:bg-subtle",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-3">
      {steps.map((label, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "w-7 h-7 rounded-full text-xs font-bold inline-flex items-center justify-center",
                done
                  ? "bg-success text-ink-on-dark"
                  : active
                    ? "bg-brand text-ink-on-dark"
                    : "bg-subtle text-ink-secondary",
              )}
            >
              {idx + 1}
            </span>
            <span className={cn("text-xs font-medium", active ? "text-ink" : "text-ink-secondary")}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-subtle", className)} />;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="p-8 flex flex-col items-center justify-center text-center gap-3">
      <span className="w-11 h-11 rounded-full bg-subtle text-ink-muted inline-flex items-center justify-center">
        <Inbox className="w-5 h-5" />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="text-sm text-ink-secondary max-w-md">{description}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </Card>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="p-8 flex flex-col items-center justify-center text-center gap-3">
      <span className="w-11 h-11 rounded-full bg-danger-soft text-danger inline-flex items-center justify-center">
        <AlertCircle className="w-5 h-5" />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="text-sm text-ink-secondary max-w-md">{description}</p>
      {onRetry ? (
        <Button variant="primary" onClick={onRetry}>
          Retry Request
        </Button>
      ) : null}
    </Card>
  );
}

export function FileUpload({
  title = "Drop PDF / CSV / XLSX or click to browse",
  subtitle = "Max file size 50 MB",
  onFileSelected,
}: {
  title?: string;
  subtitle?: string;
  onFileSelected?: (fileName: string) => void;
}) {
  const [fileName, setFileName] = React.useState<string | null>(null);
  return (
    <label className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-brand bg-brand-soft px-4 py-6 text-center cursor-pointer hover:bg-brand-soft/80">
      <UploadCloud className="w-6 h-6 text-brand" aria-hidden="true" />
      <span className="text-sm font-semibold text-brand">{fileName ?? title}</span>
      <span className="text-xs text-ink-secondary">{subtitle}</span>
      <input
        type="file"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setFileName(`${f.name} (${Math.max(1, Math.round(f.size / 1024))} KB)`);
            onFileSelected?.(f.name);
          }
        }}
      />
    </label>
  );
}

