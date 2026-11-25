# Component Registry (`COMPONENTS.md`)

> Always check this file before creating any new UI component or template. Reuse existing components via props/config.

## Layouts (`src/components/layout/`)
- `PublicLayout` — Public navbar (`Academics`, `Admissions`, `Campus Life`, `Notices`, `Contact`, CTAs) + main + dark footer.
- `AuthLayout` — Split 50/50 dark navy brand panel (features + copyright) & centered auth form card.
- `AppShell` — Role-aware responsive shell (`admin`, `teacher`, `student`, `parent`, `staff`, `common`): fixed 260px dark sidebar on desktop, slide-over drawer + mobile bottom nav on `< lg`, Topbar with search, session pill (`AY 2026–27`), notifications bell, and `UserChip`.

## Primitives (`src/components/ui/`)
- `Button` — Variants: `primary | secondary | outline | danger | ghost`; sizes `sm | md | lg`; min 44px touch target on mobile.
- `StatusBadge` — Tones: `success | warning | danger | info | primary | neutral`.
- `Input` / `Select` / `Textarea` / `Checkbox` — Accessible form controls with label, hint, error state, 44px height.
- `Card` / `StatCard` — Elevated surface cards using `--shadow-card` and `--radius-lg`.
- `Modal` / `Drawer` / `ConfirmDialog` — Accessible overlays (full-screen sheet on mobile).
- `Tabs` / `Stepper` / `Skeleton` / `EmptyState` / `ErrorState` / `FileUpload` / `ToastProvider`.

## Templates (`src/components/templates/`)
- `DataTablePage` — Config-driven TanStack Table page with search, filters, sorting, pagination, CSV export, bulk actions, and mobile card view.
- `FormPage` / `FormWizard` — React Hook Form + Zod validated form template.
- `DetailPage` — Profile/detail header + tabbed sections.
- `DashboardPage` — KPI `StatCard` row + Recharts chart + notice/table widgets.
- `CalendarView` — Events & monthly/weekly schedule view.
- `PrintView` — Printable A4/card container for Fee Receipt, Report Card, Admit Card, ID Card, Certificates, Salary Slip.
- `InboxView` — Split thread list + live conversation pane.

