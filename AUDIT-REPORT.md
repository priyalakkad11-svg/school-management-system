# EduCore (Greenwood International Academy) — Full Technical, SEO, UX & Global Benchmark Audit

**Audit Date:** 2026-11-28  
**Codebase Scope:** 123 `src/app/**/page.tsx` routes (`110` Figma-mapped screens + utility/SEO routes), Supabase Phase 5 Foundation & Auth (`dd03363` + `b9a9060` + audit fixes).

---

## 1. Real vs. Mock Audit (Kya Real Hai vs. Kya Kaam Nahi Kar Raha)

### A. Real & Working in Production Code
1. **Authentication, Session & Route Security (`src/app/actions/auth.actions.ts`, `src/lib/supabase/`, `src/proxy.ts`):**
   - Email **and** School User Code login (`ADM-001`, `TCH-042`, `ADM-2026-0142`, `PAR-1042`, `STF-011`) backed by Supabase Auth + `public.profiles`.
   - Server-side portal role matching, `Active` status & soft-delete (`deleted_at IS NULL`) enforcement, `last_login_at` updates, and `must_change_password` first-login enforcement.
   - Recovery & password workflows: Forgot Password OTP (`/forgot-password`), 6-digit OTP verification (`/otp-verification`), Reset Password (`/reset-password`), First-Time Password Setup (`/setup-password`), Account profile/language/password updates (`/account`), and session-scoped `signOut({ scope: "local" })`.
   - Middleware/Proxy (`src/proxy.ts` → `src/lib/supabase/proxy.ts`) validates JWT claims via `getClaims()` and guards `/admin`, `/teacher`, `/student`, `/parent`, `/notifications`, `/account`, `/search`, `/help`, `/status-errors`.
2. **Database Foundation & RLS (`supabase/migrations/20261125173000_auth_profiles_storage.sql`, `20261125173500_grant_public_schema_roles.sql`):**
   - `public.profiles`, `public.audit_logs`, triggers (`prevent_self_role_escalation`, `sync_role_to_auth_app_metadata`, `handle_new_auth_user`, `audit_row_change`), and 4 private Supabase Storage buckets (`documents`, `avatars`, `study-material`, `receipts`) are enforced and pass **17 / 17** assertions in `pnpm test:rls`.
   - `20261125174000_school_setup.sql` defines Module 2 tables (`school_settings`, `academic_years`, `school_classes`, `subjects`, `class_subject_mappings`), though services/UI are not wired to them yet.
3. **Interactive Client Features:**
   - **Data Tables (`DataTablePage.tsx`):** Search, multi-dropdown filters, column sorting, pagination, multi-row bulk selection, and real browser **CSV download** (`educore-export.csv`).
   - **Print / PDF Layouts (`PrintView.tsx`):** Clean `@media print` receipts, report cards, ID cards, admit cards, certificates, and salary slips.
   - **Back Navigation & Layouts (`AppShell.tsx`, `PublicLayout.tsx`, `AuthLayout.tsx`):** Contextual Back buttons + responsive sidebar/drawer/bottom bar across `390px`, `768px`, and `1440px`.

### B. Mock / Static / Incomplete Flows (Not Persisting to DB Yet)
1. **37 Runtime Mock Imports (`pnpm check:mocks`):**
   - `src/services/school.service.ts` and **36 page files** still import static `MOCK_*` arrays from `src/mocks/school.data.ts` (Admin Setup, Students, Teachers, Staff, Attendance, Timetable, Exams, Fees, Library, Transport, Hostel, Communication, Reports, Inventory, Audit Logs, Notifications, Search, Landing Notices).
2. **32 Portal Pages with Inline Static Data:**
   - **11 Teacher pages**, **12 Student pages**, and **9 Parent pages** mostly contain hardcoded local arrays/JSX (not caught by `check:mocks` because they don't import `school.data.ts`) and do not read/write per-user Postgres rows.
3. **Toast-Only Form & Action Handlers (`159` `showToast(` occurrences across `src/app/`):**
   - Submitting Admission Enquiry (`/apply`), Add Student (`/admin/students/new`), Collect Fee (`/admin/fees/collect`), Mark Attendance, Marks Entry, Leave Request, Study Material upload, Bulk Select alerts, and **Change Profile Photo** (`/account/page.tsx:83`) show confirmation toasts or `Math.random()` reference IDs without writing to Supabase DB or uploading files to Storage.
4. **RBAC Granularity Gap for `staff`:**
   - In `src/lib/supabase/proxy.ts:84`, `staff` is allowed on **all** `/admin/*` paths (including `/admin/setup/roles`, `/admin/audit-logs`, `/admin/system-settings`). Non-admin operational staff should be scoped strictly to operational modules (`/admin/staff`, `/admin/library/*`, `/admin/transport/*`, `/admin/hostel/*`, `/admin/inventory`, `/admin/fees/collect`, etc.).
5. **Fixed During This Audit:**
   - `AppShell.tsx` previously kept `ADMIN_NAV` & `EduCore Admin` branding on `role="common"` routes (`/account`, `/notifications`, `/search`, `/help`) even for logged-in `teacher`, `student`, and `parent` users. Fixed to resolve navigation/branding dynamically from `user.role`.

---

## 2. SEO / AEO / GEO Audit

| Area | Status | Notes |
| :--- | :--- | :--- |
| `src/app/robots.ts` | Pass | Allows public pages + `/login`; blocks all `/admin`, `/teacher`, `/student`, `/parent`, auth recovery & internal utility routes; declares `sitemap.xml`. |
| `src/app/sitemap.ts` | Partial | Covers all `PUBLIC_SEO_ROUTES` (`/` `1.0`, `/admissions` & `/apply` `0.9`, others `0.7`), though `lastModified` is static (`2026-11-25`). |
| Portal `robots` directive | Pass | Portal layouts mark authenticated sections `noindex, nofollow`. |
| Structured Data (`JsonLd`) | Pass | `/` includes `EducationalOrganization` + `WebSite` schema; `/faq` includes `FAQPage` schema. |
| AEO / AI Discovery (`public/llms.txt`) | Pass | Clean Markdown campus directory and portal entrypoint summary for LLMs/search agents. |
| PWA (`manifest.json` + `icon.svg`) | Pass | Valid web app manifest and vector app icon. |
| **Fixed in This Audit** | Upgraded | Added site-wide `openGraph`, `twitter` card, `keywords`, and `alternates.canonical` in `src/app/layout.tsx`; added metadata + canonical in `src/app/page.tsx`, `src/app/apply/layout.tsx`, and `src/app/login/layout.tsx`. |
| Remaining SEO Improvements | Recommended | Add a dedicated `1200×630` PNG social preview (`public/og-educore.png`), `Event` JSON-LD on `/events`, dynamic notice pages from DB, and remove unused template SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`). |

---

## 3. Design & UX Review Rating

| Category | Score | Assessment |
| :--- | :--- | :--- |
| **Visual System & Design Tokens** | **9.0 / 10** | Strict CSS variable + Tailwind `@theme inline` token architecture (`check:tokens`: 0 raw hex/color leaks), crisp hierarchy, consistent typography (`Plus Jakarta Sans`), subtle elevation. |
| **Responsive Engineering** | **9.0 / 10** | Verified zero horizontal overflow at `390`, `768`, and `1440` across all 110 screens (`routes-smoke.spec.ts`); desktop tables cleanly transform to card lists on mobile + drawer & bottom nav. |
| **Accessibility (WCAG 2.1 AA)** | **9.5 / 10** | Verified **0 axe-core violations** across all 339 E2E checks; semantic landmarks (`main`, `nav`, `header`), accessible `44px+` touch targets, `label-content-name-mismatch` resolved. |
| **UX Flows & Navigation** | **8.0 / 10** | Contextual Back navigation, role-aware common shell, multi-step wizard, CSV export & print templates work smoothly. Needs real inline modals/drawers for row editing/deletion, dark mode option, and persistent saved views. |
| **Functional Completeness (ERP)** | **3.5 / 10** | Strong UI & Supabase Auth shell, but 12 of 13 backend business modules still rely on mock/static data and client-only toasts. |

**Overall Rating:** **UI / Design System: 8.8 / 10** | **Production ERP Readiness: 4.5 / 10** (until Modules 2–13 are connected to Supabase).

---

## 4. World-Class School Management Benchmark (PowerSchool, Toddle, ManageBac, Infinite Campus, Fedena)

Global enterprise K-12 platforms stand apart on **7 core pillars**. Here is how EduCore maps to global standards and what is needed to make it world-class:

1. **Single Source of Truth & Multi-Academic-Year Ledger (SIS Core):**
   - Student enrollment, class/section history per academic year, guardian relationship table (`parent ↔ student` M:N linkage for siblings), promotion/transfer workflows, and TC lock rules.
2. **Real Financial Accounting, Payments & Tax-Ready Receipts:**
   - Fee structures by grade/term, installment schedules, scholarships/concessions, automated late fines, **online payment gateway integration (Razorpay / Stripe webhooks)**, immutable sequential receipt numbers, and PDF receipts stored in private `receipts` bucket.
3. **Granular RBAC + Auditability:**
   - Separate permissions matrix for Principal/Super Admin, Accountant, Librarian, Transport Coordinator, Hostel Warden, Teacher, Student, Parent — enforced at **both** Next.js proxy and Postgres RLS (`audit_logs` capturing every grade edit, fee void, attendance override).
4. **Real-Time Attendance & Parent Alert Engine:**
   - Class-wise & period-wise attendance + RFID/bus boarding logs, automated absence alerts via **WhatsApp / SMS / Email queues** (delivery status tracked in Notification Log).
5. **Assessment, Gradebook & Transcript Integrity:**
   - Configurable grading schemas (CBSE percentage/grades, IB 1–7 criteria, GPA), marks locking after moderation, moderation workflow, and tamper-evident report cards with QR verification.
6. **True LMS Workflow (Assignments, Submissions, Study Material):**
   - Teachers upload materials to `study-material` private bucket (signed URL downloads), create due-dated assignments, students submit files/work, teachers grade with rubric feedback visible in Student & Parent portals.
7. **Operational Readiness (Multi-Campus / Timezone / Exports / Backups):**
   - School branch (`campus_id`) scoping for scaling beyond 1 campus, scheduled Supabase backups, bulk CSV import validation (`bulk-import`) with preview/rollback, and live search across entities.

---

## 5. Actionable Phase 5 Readiness Sequence

Follow `PROGRESS.md` Modules `2` through `13` strictly in order, finishing each module with `pnpm check:mocks` (decreasing count), `pnpm test:rls`, `pnpm typecheck`, `pnpm lint`, and E2E tests:
1. **School Setup (`Module 2`):** Connect `20261125174000_school_setup.sql` + CRUD actions for Academic Years, Classes, Subjects, Mappings, Settings, and tighten `staff` route RBAC.
2. **Students & Admissions (`Module 3`):** Migrate Enquiries (`/apply` + `/admin/students/enquiries`), Applications, Students, Guardians (`parent_students`), Promotions, ID cards.
3. **Teachers, Staff & Payroll (`Module 4`):** Teachers, Staff directory, Leave Approval state machine, Payroll generation & Salary Slips.
4. **Attendance & Timetable (`Module 5`):** Daily class attendance upsert, Timetable slots & substitution persistence.
5. **Exams, Marks & Report Cards (`Module 6`):** Exam schedule, marks entry, grade calculation, result lock & PDF report card data.
6. **Fees & Receipts (`Module 7`):** Fee structures, invoices, scholarships, payment collection, receipt PDFs + Razorpay/Stripe checkout hook.
7. **Library, Transport, Hostel (`Module 8`) & Communication (`Module 9`) & Operations (`Module 10`):** Full DB CRUD + Storage uploads.
8. **Teacher / Student / Parent Portals (`Module 11`), Common (`Module 12`) & Public Data (`Module 13`):** Replace all 32 inline portal datasets, connect Storage avatar upload on `/account`, wire live Search + Notifications + Public Notices/Events.
