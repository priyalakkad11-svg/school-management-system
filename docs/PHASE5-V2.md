# PHASE 5 v2: MULTI-SCHOOL SaaS (MASTER SPECIFICATION)

> **Status:** Single source of truth for converting EduCore (Greenwood International Academy) into a multi-school SaaS platform owned by **Priya** (`super_admin`).  
> **Rule:** Always read and follow `AGENTS.md`, `PROGRESS.md`, `QA-REPORT.md`, `AUDIT-REPORT.md`, and this document.

---

## Business & Core Rules

- **Business Model:** Multi-tenant SaaS sold to many schools. Each school has strictly isolated data (`school_id`), its own billing plan (monthly/yearly priced by student count slabs in INR), feature/module toggles, and handed-over admin credentials.
- **No Public School Signup:** Schools are created ONLY by `super_admin` (`Priya`).
- **Stack & Code Rules Carried Over:**
  - Single Supabase project; keys only in `.env.local`; `SUPABASE_SERVICE_ROLE_KEY` server-only.
  - Strict TypeScript (`strict: true`), no `any`, `@ts-ignore`, or `eslint-disable`; no plain JS files.
  - Token-only styling (`pnpm check:tokens`); keep the 110 Figma screens visually intact.
  - New platform/multi-school screens allowed ONLY where specified (`111+`), built with existing tokens/templates, marked `NEW (not in Figma)` in `PROGRESS.md`.
  - No destructive SQL (`DROP`/`TRUNCATE`/unscoped `DELETE`). Latest stable versions, no `--force`/`--legacy-peer-deps`.
  - Never tick any item in `PROGRESS.md` while any gate fails (`typecheck`, `lint --max-warnings 0`, `check:tokens`, `check:mocks`, `check:toasts`, `build`, `test:rls`, `test:tenant`, module E2E). Commit (`feat(<area>): <item>`) and push after every completed item.
  - Stop ONLY for missing/invalid keys, unreachable DB, or destructive operations. Log non-specified business defaults (e.g., slab pricing) under Decisions in `PROGRESS.md`.

---

## Step 0: Preflight
- Run baseline gates; document real vs. mock status (Module 1 Auth/Foundation + Module 2 Setup currently live in single-tenant mode, Modules 3–13 still on mocks); add complete `PHASE 5 v2` checklist to `PROGRESS.md`.

---

## A. Tenancy Foundation (Must precede all other modules)
- **`schools` table:** `id`, `school_code` (unique, short, login-friendly), `name`, `logo`, `address`, `contact`, `board`, `status`, `is_demo`, `created_at`.
- **Tenant Isolation:** Add `school_id NOT NULL` (FK + index) to EVERY tenant table, including `profiles`, `audit_logs`, `school_settings`, `academic_years`, `school_classes`, `subjects`, `class_subject_mappings`, `rbac_roles`, `rbac_permissions`. Backfill existing single-tenant rows into a seeded `Demo School` (`is_demo = true`). Prefix Storage paths with `<school_id>/...` and match Storage RLS policies.
- **SQL Security Helpers (`SECURITY DEFINER`, fixed `search_path = ''`, reading from `profiles`, NEVER `user_metadata`):**
  - `private.current_school_id()`
  - `private.current_role()`
  - `private.is_super_admin()`
  - `private.has_permission(code text)`
  - `private.school_allows_write()` (blocks writes when subscription is `read_only`, `suspended`, or `cancelled`)
- **RLS Policies:** Every tenant table enforces `school_id = (SELECT private.current_school_id())`. Platform tables restrict access to `super_admin`. `super_admin` inspects tenant rows ONLY via an explicit audited support session.
- **Roles & Granular Staff RBAC:** `super_admin` (platform), `school_admin`, `principal`, `teacher`, `student`, `parent`, `staff` with per-school sub-roles (`accountant`, `librarian`, `transport`, `hostel`, `receptionist`) via per-school `rbac_roles` + `module:action` permission codes. Enforced in BOTH Next.js route proxy AND Postgres RLS. Non-admin `staff` strictly scoped away from `/admin`, `/admin/setup/*`, `/admin/audit-logs`, `/admin/system-settings` and unauthorized modules.
- **Super Admin Bootstrap:** Server-only script (`pnpm seed:superadmin` / `scripts/seed-superadmin.ts`) reading `SUPER_ADMIN_EMAIL` + runtime-prompted password (min 12 chars). No UI creates `super_admin`; DB trigger blocks escalation to `super_admin`; enforce TOTP MFA for `super_admin`.
- **`pnpm test:tenant`:** Introspects every table with `school_id`, asserts RLS enabled + policy checks `school_id`, seeds 2 schools, and proves School A user cannot select, insert, update, or delete School B rows on ANY table or Storage bucket. Extend `pnpm test:rls`. `0` failures required.

---

## B. Platform / Super Admin (`111+`, marked `NEW (not in Figma)`)
- **New Screens (`111+`):**
  - `111` Platform Dashboard (active/trial/suspended schools, total real students, MRR/ARR, renewals due in 30d, recent signups)
  - `112` Schools Directory (search, filter, status)
  - `113` Create School Wizard (4 steps: School Details, Academic Structure, Plan & Billing calculator, First School Admin Account)
  - `114` School Detail (tabs: Overview, Usage, Plan & Billing, Modules/Features, Users, Audit, Support Access)
  - `115` Plans & Pricing Editor
  - `116` Subscriptions Manager
  - `117` Invoices & Payments (with print view)
  - `118` Credential Handover Sheet (printable, one-time copy)
  - `119` Platform Announcements
  - `120` Support Tickets (platform-wide)
  - `121` Platform Audit Logs
  - `122` Platform Settings & Demo School Manager
  - `123` Support Access Banner / Session Control
- **Business Rules:**
  - Config-driven INR pricing: per-student per-month slabs (`1–200`, `201–500`, `501–1000`, `1000+`), monthly vs yearly (`yearly_discount_pct`), optional `setup_fee`, `gst_pct` + GSTIN on invoices, coupons (`percent`/`amount`, expiry), module feature flags, resource limits (`max_students`, `max_teachers`, `max_staff`, `max_storage_mb`), price calculator, mid-cycle proration & credit notes for refunds.
  - Lifecycle: `trial` -> `active` -> `past_due` -> `read_only` -> `suspended` -> `cancelled` (enforced in proxy & DB `school_allows_write()`). 30/7/1-day renewal reminders queued in notification log.
  - Manual payments (`UPI`/`bank`/`cash`/`cheque` + ref), gapless financial-year GST invoice numbers, printable invoice, isolated payment gateway adapter stub.
  - Usage metering (`students`/`teachers`/`storage` vs limits): warn at 80%, block inserts at 100% with upgrade prompt.
  - Per-school module toggles driving sidebar, route guards, and public pages.
  - Per-school settings (`Asia/Kolkata`, `INR`, date format, working days, academic calendar, holidays). UI language English-only for now (i18n logged as future item).
  - Atomic `Create School` RPC/server transaction: school, settings, default roles/permissions, academic year, classes/sections, subscription, invoice/trial, first `school_admin` user.
  - Generated `school_code`, `login_id`, temp password shown ONCE on Handover sheet; never stored plaintext or logged; forced password change on first login; reset/lock/unlock by super admin.
  - Dual login: `(school_code + user_id + password)` AND `email + password`, with DB-backed rate limit & lockout and generic errors (no user enumeration).
  - Audited support access ("view as school"): explicit time-limited session with reason, read-only by default, logged in `audit_logs`, sticky warning banner.
  - Per-school branding (logo, name, accent CSS variable) on login, receipts, report cards, ID cards, certificates.
  - Public school microsites `/s/[school_code]` (home, admissions, notices, events, contact) with metadata, sitemap, JSON-LD (`noindex` stays on portals).
  - Demo School (`is_demo = true`): realistic data, resettable by super admin, excluded from MRR/ARR & usage.

---

## C. School Onboarding & Academic Structure (School Admin)
- Persisted first-login onboarding checklist (profile, academic year, classes/sections, subjects, fee structure, import teachers, import students, invite parents).
- Flexible classes (Nursery, LKG, UKG, Grades 1–12), sections + capacity + class teacher, mandatory/optional subjects, rooms.
- Bulk CSV/XLSX import (students, guardians, teachers, staff, fees): downloadable templates, dry-run preview, server validation, row errors, idempotent re-run, chunked for `5,000+` rows.
- Bulk credential generation per class/all (`login_id = admission/emp no`, temp passwords, printable slips, one-time CSV).
- Academic year rollover (promote/detain/transfer preview, fee carry-forward, read-only archive).

---

## D. Module Loop (All Tenant-Scoped, Real Persistence)
- **P0 (Pilot-Ready):** `1` Auth (tenant retrofit) -> `2` School Setup (tenant retrofit + onboarding) -> `3` Students, Guardians & Admissions -> `4` Teachers & Staff -> `5` Attendance & Timetable -> `6` Exams, Marks & Report Cards -> `7` Fees & Receipts -> `9` Notices, Messages & Notifications -> `11` Teacher/Student/Parent Portals -> `12` Common (`notifications`, `account`, `search`, `help`). **Write `PILOT-READY.md` after P0.**
- **P1:** `8` Library, Transport & Hostel -> `10` Reports, Inventory, Documents/Certificates, Audit Logs, System Settings -> `13` Public Pages Data (`/`, `/notices`, `/events`, `/s/[school_code]`).
- Full student/teacher/parent profiles, unique admission/emp codes per school, gapless per-school/year receipt sequences, attendance edit lock window, absent-student guardian notification queue, marks lock + audited unlock, timetable conflict detection (teacher/room), complete fee ledger/concessions/installments/refunds/defaulters, grading scales & term weights, LMS homework submissions (`study-material` private bucket + signed URLs) & grading, QR verification `/verify/[token]` on report cards & ID cards (revocable tokens, minimal non-sensitive info), provider adapters (working SMTP email adapter, SMS/WhatsApp & online payment stubs).

---

## E. No Fake Actions
- `pnpm check:toasts`: Fails if any `showToast(` lives in a file without a backing service/server-action call.
- Wire every action for real: `/apply` (persisted enquiry + honeypot + DB rate limit), avatar upload (`avatars` bucket), study-material upload (`study-material` bucket), fee collection, attendance, marks, leave, bulk actions.
- Zero runtime mock imports (`pnpm check:mocks` = 0) and zero inline static arrays across all 13 modules & portals.

---

## F. Scale & Performance
- Composite indexes starting with `(school_id, ...)` on all large tables; server-side pagination/search/sort everywhere; SQL views/RPC for dashboard counts.
- Seed 3 schools (`Nursery–10` with `1,500+` students, `1–10`, `1–12`, `10,000+` total students); run `EXPLAIN ANALYZE` on top list/search queries (`< 300ms` local server time) and record in `QA-REPORT.md`.

---

## G. Security & Operations
- DB-backed rate limits (login, OTP, enquiry, credentials) with cleanup; `/api/health`; DB-backed `error_logs` + adapter stub (no PII in logs); 30-day soft-delete purge job; per-school CSV/JSON export & offboarding; guardian consent fields; security headers, `pnpm audit`, zero Supabase Security Advisor warnings.

---

## H. Docs & Legal
- Write `docs/DEPLOY.md`, `docs/OPERATIONS.md`, `docs/SCHOOL-ADMIN-GUIDE.md`.
- Update `/privacy` & `/terms` for multi-school SaaS (`NEEDS LEGAL REVIEW` placeholders).

---

## I. Audit Leftovers
- `public/og-educore.png` (`1200×630`), per-school `Event` JSON-LD on events, remove unused starter SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`).

---

## Final Deliverables
- All checks passing across `390`, `768`, `1440` (`0` open issues), updated `QA-REPORT.md` (`Phase 5 v2` section with real tool/EXPLAIN/RLS/tenant/advisor outputs), `PILOT-READY.md`, and concise `"Manual steps for me"` list.
