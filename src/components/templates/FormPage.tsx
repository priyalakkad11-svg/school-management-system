"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  Stepper,
  Textarea,
} from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import type { PortalRole } from "@/lib/routes";

export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "select" | "textarea" | "checkbox" | "password";
  placeholder?: string;
  hint?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  colSpan?: 1 | 2;
  stepIndex?: number;
}

export interface FormPageProps {
  role: PortalRole;
  title: string;
  subtitle?: string;
  sectionTitle?: string;
  fields: FormFieldConfig[];
  initialValues?: Record<string, string | boolean>;
  schema?: z.ZodType<Record<string, unknown>>;
  steps?: string[];
  submitLabel?: string;
  cancelHref?: string;
  onSubmitted?: (values: Record<string, string | boolean>) => void;
  aside?: React.ReactNode;
}

export function FormPage({
  role,
  title,
  subtitle,
  sectionTitle = "Record Details",
  fields,
  initialValues = {},
  schema,
  steps,
  submitLabel = "Save Changes",
  cancelHref,
  onSubmitted,
  aside,
}: FormPageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [values, setValues] = React.useState<Record<string, string | boolean>>(() => {
    const base: Record<string, string | boolean> = {};
    for (const f of fields) {
      if (f.name in initialValues) {
        base[f.name] = initialValues[f.name];
      } else {
        base[f.name] = f.type === "checkbox" ? false : f.options?.[0]?.value ?? "";
      }
    }
    return base;
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [step, setStep] = React.useState(0);

  const visibleFields = steps
    ? fields.filter((f) => (f.stepIndex ?? 0) === step)
    : fields;

  const validateFields = (targetFields: FormFieldConfig[]) => {
    const nextErrors: Record<string, string> = {};
    for (const f of targetFields) {
      const val = values[f.name];
      if (f.required && (val === "" || val === undefined)) {
        nextErrors[f.name] = `${f.label} is required`;
      }
      if (f.type === "email" && typeof val === "string" && val && !val.includes("@")) {
        nextErrors[f.name] = "Enter a valid email address";
      }
    }
    if (schema && (!steps || step === steps.length - 1)) {
      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0] ?? "");
          if (key && !nextErrors[key]) {
            nextErrors[key] = issue.message;
          }
        }
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields(visibleFields)) return;
    if (steps && step < steps.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    onSubmitted?.(values);
    showToast(`${title} saved successfully.`);
  };

  return (
    <AppShell role={role} title={title} subtitle={subtitle}>
      <div className={aside ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "max-w-4xl"}>
        <Card className={aside ? "lg:col-span-2 p-6" : "p-6"}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            <div className="flex flex-col gap-3 border-b border-line pb-4">
              <h2 className="text-lg font-semibold text-ink">{sectionTitle}</h2>
              {steps ? <Stepper steps={steps} current={step} /> : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleFields.map((field) => {
                const spanClass = field.colSpan === 2 || field.type === "textarea" ? "md:col-span-2" : "";
                const err = errors[field.name];
                if (field.type === "select") {
                  return (
                    <div key={field.name} className={spanClass}>
                      <Select
                        label={field.label}
                        value={String(values[field.name] ?? "")}
                        error={err}
                        options={field.options ?? []}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                        }
                      />
                    </div>
                  );
                }
                if (field.type === "textarea") {
                  return (
                    <div key={field.name} className={spanClass}>
                      <Textarea
                        label={field.label}
                        placeholder={field.placeholder}
                        value={String(values[field.name] ?? "")}
                        error={err}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                        }
                      />
                    </div>
                  );
                }
                if (field.type === "checkbox") {
                  return (
                    <div key={field.name} className={spanClass}>
                      <Checkbox
                        label={field.label}
                        checked={Boolean(values[field.name])}
                        onChange={(checked) =>
                          setValues((prev) => ({ ...prev, [field.name]: checked }))
                        }
                      />
                    </div>
                  );
                }
                return (
                  <div key={field.name} className={spanClass}>
                    <Input
                      type={field.type}
                      label={field.label}
                      placeholder={field.placeholder}
                      hint={field.hint}
                      error={err}
                      value={String(values[field.name] ?? "")}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
              <div>
                {steps && step > 0 ? (
                  <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                    Previous Step
                  </Button>
                ) : cancelHref ? (
                  <Button variant="outline" onClick={() => router.push(cancelHref)}>
                    Cancel
                  </Button>
                ) : null}
              </div>
              <Button type="submit" variant="primary">
                {steps && step < steps.length - 1 ? "Continue to Next Step" : submitLabel}
              </Button>
            </div>
          </form>
        </Card>
        {aside ? <div className="flex flex-col gap-4">{aside}</div> : null}
      </div>
    </AppShell>
  );
}

