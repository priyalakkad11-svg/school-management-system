# EduCore Multi-School SaaS — Pilot Readiness Report

**Status:** Pilot-Ready (P0 + P1 Modules Live on Supabase Postgres + Private Storage)
**Supabase Project:** `gvmwlleuzzfljmejmtnd`
**Verification Gates Passed:** `check:mocks` (0 runtime mocks), `check:toasts` (0 unbacked toast actions), `typecheck`, `eslint --max-warnings 0`, `check:tokens`, `test:rls` (38/38), `test:tenant` (117/117 across 65 tables + 4 storage buckets + `read_only` lock), and `next build`.

---

## 1. What Works End-to-End (Verified Live Persistence)

1. **Strict Multi-Tenancy & Auth (`A` + `D1`):**
   - Dual login (`school_code + user_id + password` OR `email + password`) via server-side resolution (`signInAction`) with DB-backed rate limits and account lockout (`auth_rate_limits`).
   - Super Admin platform login enforces TOTP MFA (`AAL2`) via `/platform/mfa` and cannot be created through any UI route or role-escalation update.
   - All 65 tenant tables carry `school_id NOT NULL` + RLS policies scoped by `current_school_id()` + `school_allows_write()`, preventing cross-school access and blocking writes when a school subscription is `read_only` or `suspended`.

2. **Super Admin Platform Operations (`B` / Screens `111–123`):**
   - Atomic school provisioning (`createSchoolAtomicAction`) creating school, settings, RBAC roles/permissions, academic year, flexible class-section structure, subscription, and first `school_admin` account with one-time printable Credential Handover sheet.
   - Config-driven INR pricing slabs per student count, monthly vs. yearly discount, GST % & GSTIN, coupons, mid-cycle proration/credit notes, gapless FY SaaS invoice numbering, manual payment recording, usage metering (80% warning / 100% block), module toggles, Demo School reset (`is_demo = true` excluded from MRR), and audited "View as School" support sessions.

3. **School Onboarding & Academic Operations (`C` + `D2`–`D10`):**
   - Persisted onboarding checklist (`/admin/setup/onboarding`), flexible Nursery–Class 12 section structure, chunked CSV/XLSX bulk import (`5,000+` rows dry-run + error reporting), bulk class credential slip generation, and academic year promotion with fee balance carry-forward.
   - Students & guardians (`parent_students`), live public `/apply` admissions enquiry form (with honeypot + DB rate limits), teacher/staff directory & payroll, attendance (with absent notification queue + edit lock window), timetable conflict detection (teacher & room double-booking guard), substitution cover assignment.
   - Examinations, CBSE/percentage grade scales, marks entry & post-publish lock (with audited unlock reason), gapless FY fee receipts (`next_fee_receipt_number`), scholarships/concessions, audited refunds, defaulters ledger, and public QR document verification (`/verify/[token]`).
   - Notices, events, complaints, helpdesk tickets (`/help`), private avatar upload (`/account`), and Teacher/Student/Parent LMS portals (homework publishing, private Storage `study-material` signed URLs, leave requests, online portal fee payments).

4. **P1 Campus Operations & Microsites (`D11`–`D13`):**
   - Library book catalog, circulation issue/return & overdue fine settlement; transport vehicles & routes; hostel rooms & allocations; inventory assets; compliance archive JSON export (`/admin/reports`, `/admin/system-settings`); certificate issuance with QR verification.
   - Live public microsites per school at `/s/[school_code]` (Home, Admissions, Notices, Events, Contact) with per-school metadata, JSON-LD, and dynamic `sitemap.xml` entries.

---

## 2. Isolated Adapters & Deferred Integrations

- **Email / SMS / WhatsApp Dispatch (`src/lib/comms-adapter.ts`):** All outbound alerts record delivery rows cleanly into `communication_logs`. Real SMTP email sends when `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` are configured; SMS & WhatsApp adapters currently log structured `Queued (Adapter Ready)` records until Twilio / Meta Cloud API keys are supplied.
- **Online Payment Gateway (`payPortalFeeAction` / SaaS payments):** Platform subscriptions support manual UPI/NEFT/Cheque/Cash reconciliation; portal fee checkouts execute atomic `fee_receipts` creation using gapless per-school financial year sequences behind an isolated payment adapter boundary (live Razorpay/Stripe checkout webhook integration is deferred).
- **UI Language:** English (`en`) is active across all routes; multi-language i18n resource bundles are logged as a future post-pilot enhancement.

---

## 3. Manual Pilot Launch Steps

1. Set production environment variables in your host (`.env.local` for local/staging): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, optional `SMTP_*` keys.
2. Run `pnpm seed:superadmin` from the CLI (`SUPER_ADMIN_EMAIL` + runtime password) and enroll a TOTP authenticator app at `/platform/mfa`.
3. Provision each pilot school via `/platform/schools/new` and deliver the printed one-time Credential Handover sheet (`/setup-password` enforces immediate password replacement on first sign-in).
4. Configure Supabase Dashboard Auth settings before opening to pilot schools (Leaked Password Protection, email confirmation policy, and MFA enforcement — listed in final handoff).
