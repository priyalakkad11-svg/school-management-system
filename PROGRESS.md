# EduCore School Management System — Build Progress

**Figma File:** `Fbf0xWCwBfZGn6QwVZAchq` (110 numbered screens confirmed via Figma REST API)

## Decisions
1. **Figma Read Access:** Figma MCP (`figma_figma`) hit the Starter plan tool-call limit (`mcp_rate_limit_paywall`), so Phase 0/Phase 2 read-only Figma inspection and screenshot fetching use the official Figma REST API (`https://api.figma.com/v1`) via the user's `FIGMA_TOKEN` environment variable.
2. **TypeScript Version Compatibility:** `create-next-app@16.4.6` installs `typescript@5.9.3` (while `typescript@7.0.2` is currently on npm); keeping the Next.js-compatible `typescript` version without `--legacy-peer-deps` or `--force`.
3. **Token Architecture:** All colors live strictly as CSS variables in `src/app/globals.css` (`@theme inline`), mapped to semantic Tailwind utilities (`bg-canvas`, `bg-surface`, `bg-sidebar`, `text-primary`, `brand-primary`, etc.) and verified by `pnpm check:tokens`.
4. **Role Auth & Route Guards:** Mock role-based sessions (`admin`, `teacher`, `student`, `parent`, `staff`) stored via HTTP-only signed/structured cookie + client demo switcher on `/login`, with server-side layout guards. Portal pages carry `robots: { index: false, follow: false }`.
5. **GitHub Actions Workflow Push Scope:** Local `gh` OAuth credentials hold `repo` scope without `workflow` scope (`refusing to allow an OAuth App to create or update workflow .github/workflows/ci.yml`), so `.github/workflows/` is kept locally and excluded via `.gitignore` when pushing to `origin main`.

---

## Phase Checklist
- [x] Phase 0: Repository scaffold, tokens, routes manifest, CI, docs
- [x] Phase 1: Shared layouts, UI primitives, data templates, error pages
- [x] Phase 2: All 110 screens implemented & verified
- [x] Phase 3: SEO / AEO / GEO, JSON-LD, sitemap, robots, llms.txt, PWA manifest
- [x] Phase 4: Full Playwright + axe-core + Lighthouse QA & `QA-REPORT.md`
- [ ] Phase 5 v2: Multi-School SaaS Backend, Tenancy, Super Admin, Full CRUD, Scale & Ops

---

## PHASE 5 (Single-Tenant Baseline Completed Prior to v2)
- [x] Foundation: Supabase clients (`browser`, `server`, `admin`), proxy session refresh, DB types, error mapper, server-side pagination/filter helpers, `check:mocks`
- [x] 1. Auth & profiles (single-tenant baseline — to be retrofitted with `school_id` & `school_code` in Phase 5 v2 Step A/D)
- [x] 2. School setup (single-tenant baseline — to be retrofitted with `school_id` & flexible onboarding in Phase 5 v2 Step A/C/D)
- [ ] 3–13. Remaining modules (currently on mocks — tracked in full inside PHASE 5 v2 below)

---

## PHASE 5 v2 (Multi-School SaaS Checklist — Spec: `docs/PHASE5-V2.md`)

### Step 0: Preflight & Tooling
- [x] First Action: Save `docs/PHASE5-V2.md` & link in `AGENTS.md`
- [x] Step 0: Baseline audit & `PHASE 5 v2` checklist ready

### A. Tenancy Foundation
- [x] A1: `schools` table + `school_id` NOT NULL (FK + indexes) across all tenant tables + backfill into Demo School + Storage `<school_id>/` prefixes
- [x] A2: Security-definer helpers (`current_school_id`, `current_role`, `is_super_admin`, `has_permission`, `school_allows_write`) + tenant-scoped RLS on all tables
- [x] A3: Roles (`super_admin`, `school_admin`, `principal`, `teacher`, `student`, `parent`, `staff` sub-roles), DB-backed permissions, proxy + staff RBAC tightening
- [x] A4: `super_admin` server-only bootstrap script (`SUPER_ADMIN_EMAIL` + runtime password), escalation trigger lock, TOTP MFA enforcement (`/platform/mfa` + AAL2 proxy check)
- [x] A5: `pnpm test:tenant` (introspects all `school_id` tables + cross-tenant isolation across 2 schools + Storage) & extended `pnpm test:rls` (`0` failures)

### B. Platform / Super Admin (`111+` NEW screens — not in Figma)
- [x] B1: Plans, Slabs (INR per student/month), Coupons, Invoices (gapless FY numbering + GST/GSTIN), Manual Payments & Subscriptions schema + pricing calculator + proration/credit notes (`NEW — not in Figma`)
- [x] B2: Atomic `createSchoolAtomicAction` server operation + Printable Credential Handover sheet (`/platform/schools/new` -> Handover 118, one-time copy, forced first-login password setup, reset/lock/unlock) (`NEW — not in Figma`)
- [x] B3: Dual login (`school_code + user_id + password` & `email + password`) + DB-backed rate limits/lockout (`auth_rate_limits`) + per-school branding (`NEW — not in Figma`)
- [x] B4: Super Admin Screens `111–123`: Platform Dashboard, Schools List, Create School Wizard, School Detail tabs, Plans/Pricing, Subscriptions, Invoices & Print, Handover Sheet, Platform Announcements, Support Tickets, Platform Audit Logs, Platform Settings & Demo School Reset, Audited Support Access ("View as School") (`NEW — not in Figma`)
- [x] B5: Usage metering (80% warn, 100% block), module toggles (sidebar + proxy + public), per-school settings & holidays, Demo School reset (`is_demo = true` excluded from MRR)
- [x] B6: Public per-school microsites `/s/[school_code]` (home, admissions, notices, events, contact + metadata, sitemap, JSON-LD) (`NEW — not in Figma`)

### C. School Onboarding & Academic Structure
- [x] C1: Persisted School Admin onboarding checklist (`school_onboarding`, `/admin/setup/onboarding` `NEW — not in Figma`)
- [x] C2: Flexible classes (Nursery/LKG/UKG/1–12), multi-section capacities (`school_sections`), teachers, subjects, rooms
- [x] C3: Chunked CSV/XLSX bulk import (`5,000+` rows dry-run + error report + idempotent re-run via `/admin/students/bulk-import`) for students, guardians, teachers, staff, fees
- [x] C4: Bulk credential generation per class/all + printable slips & one-time CSV (`/admin/setup/credentials` `NEW — not in Figma`)
- [x] C5: Academic year rollover (promote/detain/transfer + fee carry-forward + read-only archive via `/admin/students/promotion`)

### D. Module Loop — P0 (Pilot-Ready)
- [x] D1: `1` Auth retrofit (`school_id`, `school_code`, MFA for `super_admin`)
- [x] D2: `2` School Setup retrofit (scoped by `school_id` + onboarding/flexible structure)
- [x] D3: `3` Students, Guardians (`parent_students`) & Admissions (`/apply` live + honeypot + rate limit)
- [x] D4: `4` Teachers & Staff (full profiles, qualifications, class assignments)
- [x] D5: `5` Attendance & Timetable (edit lock window, absent alerts queue, teacher/room conflict detection)
- [x] D6: `6` Exams, Marks & Report Cards (scales, terms/weightage, marks lock/audited unlock, QR `/verify/[token]`)
- [x] D7: `7` Fees & Receipts (structures, installments, scholarships/concessions, late fee, partial payment, audited refunds, gapless receipts, defaulters, payment stub)
- [x] D8: `9` Notices, Messages & Notifications (SMTP email adapter, SMS/WhatsApp stubs, delivery log, class/section/role targeting)
- [x] D9: `11` Teacher, Student & Parent Portals (zero inline static data; LMS submissions & grading via private Storage + signed URLs; multi-child switcher)
- [x] D10: `12` Common (`/notifications`, `/account` real avatar upload, `/search`, `/help` tickets)
- [x] D-Milestone: Write `PILOT-READY.md`

### D. Module Loop — P1
- [x] D11: `8` Library, Transport & Hostel (tenant CRUD + issue/return + fines + allocations)
- [x] D12: `10` Reports, Inventory, Documents/Certificates (QR `/verify/[token]`), Audit Logs, System Settings
- [x] D13: `13` Public Pages Data (live DB notices, events, `/s/[school_code]`)

### E–I. Verification, Scale, Security, Docs & Leftovers
- [x] E1: No Fake Actions — audit all `159` `showToast(` calls + add `pnpm check:toasts` + `pnpm check:mocks` = 0
- [ ] F1: Composite `(school_id, ...)` indexes, SQL counter views/RPC, 3-school `10,000+` student seed + `EXPLAIN ANALYZE` (`< 300ms`)
- [ ] G1: DB rate limits + cleanup, `/api/health`, `error_logs` table + stub, soft-delete purge design, per-school CSV/JSON export & offboarding, guardian consent
- [ ] H1: `docs/DEPLOY.md`, `docs/OPERATIONS.md`, `docs/SCHOOL-ADMIN-GUIDE.md`, update `/privacy` & `/terms` (`NEEDS LEGAL REVIEW`)
- [ ] I1: `public/og-educore.png` (`1200×630`), per-school `Event` JSON-LD, remove unused starter SVGs
- [ ] FINAL: Full gates across `390/768/1440`, `QA-REPORT.md` Phase 5 v2 section, `PILOT-READY.md`, Manual steps list

---

## Screen Checklist (01–110)

### Module 1: Public & Auth Screens (01–06)
- [x] `01. Landing / School Home Page` (`6:17`) → `/`
- [x] `02. Login (Role Select)` (`6:75`) → `/login`
- [x] `03. Forgot Password` (`6:122`) → `/forgot-password`
- [x] `04. OTP Verification` (`6:161`) → `/otp-verification`
- [x] `05. Reset Password` (`6:201`) → `/reset-password`
- [x] `06. First-time Setup / Change Password` (`6:237`) → `/setup-password`

### Module 2A: Admin Dashboard & School Setup (07–15)
- [x] `07. Admin Dashboard` (`11:2223`) → `/admin`
- [x] `08. School Profile & Settings` (`11:2444`) → `/admin/setup/school-profile`
- [x] `09. Academic Year Management` (`11:2560`) → `/admin/setup/academic-years`
- [x] `10. Classes & Sections List` (`11:2705`) → `/admin/setup/classes`
- [x] `11. Add / Edit Class & Section` (`11:2861`) → `/admin/setup/classes/manage`
- [x] `12. Subjects List & Editor` (`11:2983`) → `/admin/setup/subjects`
- [x] `13. Subject-Class Mapping` (`11:3144`) → `/admin/setup/subject-mapping`
- [x] `14. Roles & Permissions` (`11:3317`) → `/admin/setup/roles`
- [x] `15. User Management` (`11:3484`) → `/admin/setup/users`

### Module 2B: Admin Students (16–23)
- [x] `16. Students List` (`11:3645`) → `/admin/students`
- [x] `17. Add Student / Admission Form` (`11:3846`) → `/admin/students/new`
- [x] `18. Student Profile` (`11:3973`) → `/admin/students/profile`
- [x] `19. Bulk Import Students` (`11:4071`) → `/admin/students/bulk-import`
- [x] `20. Student Promotion / Transfer` (`11:4213`) → `/admin/students/promotion`
- [x] `21. Student ID Card Generator` (`11:4364`) → `/admin/students/id-cards`
- [x] `22. Admission Enquiries List` (`11:4476`) → `/admin/students/enquiries`
- [x] `23. Admission Application Review` (`11:4666`) → `/admin/students/applications`

### Module 2C: Admin Teachers & Staff (24–32)
- [x] `24. Teachers List` (`12:3404`) → `/admin/teachers`
- [x] `25. Add / Edit Teacher` (`12:3560`) → `/admin/teachers/manage`
- [x] `26. Teacher Profile` (`12:3684`) → `/admin/teachers/profile`
- [x] `27. Non-Teaching Staff & Editor` (`12:3820`) → `/admin/staff`
- [x] `28. Teacher-Subject-Class Assignment` (`12:3976`) → `/admin/teachers/assignments`
- [x] `29. Staff Attendance` (`12:4137`) → `/admin/staff/attendance`
- [x] `30. Leave Requests Approval` (`12:4307`) → `/admin/staff/leave-requests`
- [x] `31. Payroll / Salary List` (`12:4497`) → `/admin/staff/payroll`
- [x] `32. Salary Slip` (`12:4656`) → `/admin/staff/salary-slip`

### Module 2D: Admin Attendance & Timetable (33–38)
- [x] `33. Student Attendance (Class-wise)` (`12:4783`) → `/admin/attendance/students`
- [x] `34. Attendance Reports` (`12:4932`) → `/admin/attendance/reports`
- [x] `35. Class Timetable (View)` (`12:5098`) → `/admin/timetable/classes`
- [x] `36. Create / Edit Timetable` (`12:5266`) → `/admin/timetable/builder`
- [x] `37. Teacher Timetable` (`12:5421`) → `/admin/timetable/teachers`
- [x] `38. Substitution Management` (`12:5567`) → `/admin/timetable/substitutions`

### Module 2E: Admin Exams & Results (39–47)
- [x] `39. Exam Schedule List` (`13:4366`) → `/admin/exams`
- [x] `40. Create Exam` (`13:4503`) → `/admin/exams/create`
- [x] `41. Exam Time Table` (`13:4614`) → `/admin/exams/timetable`
- [x] `42. Admin Marks Entry` (`13:4769`) → `/admin/exams/marks-entry`
- [x] `43. Grade System Settings` (`13:4947`) → `/admin/exams/grades`
- [x] `44. Result Generation` (`13:5126`) → `/admin/exams/results`
- [x] `45. Report Card (View / Print)` (`13:5302`) → `/admin/exams/report-card`
- [x] `46. Admit Card Generator` (`13:5451`) → `/admin/exams/admit-cards`
- [x] `47. Result Analytics` (`13:5581`) → `/admin/exams/analytics`

### Module 2F: Admin Fees (48–53)
- [x] `48. Fee Structure Setup` (`14:2223`) → `/admin/fees/structure`
- [x] `49. Fee Collection` (`14:2382`) → `/admin/fees/collect`
- [x] `50. Fee Receipt` (`14:2515`) → `/admin/fees/receipt`
- [x] `51. Pending / Defaulters List` (`14:2640`) → `/admin/fees/defaulters`
- [x] `52. Fee Reports` (`14:2785`) → `/admin/fees/reports`
- [x] `53. Discounts & Scholarships` (`14:2961`) → `/admin/fees/scholarships`

### Module 2G: Admin Library & Transport (54–60)
- [x] `54. Books List` (`14:3097`) → `/admin/library/books`
- [x] `55. Add / Edit Book` (`14:3253`) → `/admin/library/books/manage`
- [x] `56. Issue / Return Book` (`14:3361`) → `/admin/library/circulation`
- [x] `57. Library Members & Fines` (`14:3493`) → `/admin/library/members`
- [x] `58. Transport Routes & Editor` (`14:3669`) → `/admin/transport/routes`
- [x] `59. Vehicles & Drivers` (`14:3806`) → `/admin/transport/vehicles`
- [x] `60. Student Transport Assignment` (`14:3937`) → `/admin/transport/assignments`

### Module 2H: Admin Hostel & Communication (61–68)
- [x] `61. Hostel Rooms` (`15:3050`) → `/admin/hostel/rooms`
- [x] `62. Hostel Room Allocation` (`15:3209`) → `/admin/hostel/allocations`
- [x] `63. Notice Board & Announcements` (`15:3356`) → `/admin/communication/notices`
- [x] `64. Events & Calendar` (`15:3503`) → `/admin/communication/events`
- [x] `65. Holiday List` (`15:3658`) → `/admin/communication/holidays`
- [x] `66. Admin Messages / Inbox` (`15:3799`) → `/admin/communication/messages`
- [x] `67. SMS / Email / WhatsApp Log` (`15:3890`) → `/admin/communication/notifications-log`
- [x] `68. Complaints & Feedback` (`15:4074`) → `/admin/communication/complaints`

### Module 2I: Admin Reports & System Settings (69–73)
- [x] `69. Reports Center` (`15:4217`) → `/admin/reports`
- [x] `70. Inventory / Assets` (`15:4346`) → `/admin/inventory`
- [x] `71. Documents & Certificate Generator` (`15:4502`) → `/admin/documents`
- [x] `72. Audit Logs` (`15:4600`) → `/admin/audit-logs`
- [x] `73. Backup & System Settings` (`15:4748`) → `/admin/system-settings`

### Module 3: Teacher Portal (74–84)
- [x] `74. Teacher Dashboard` (`7:331`) → `/teacher`
- [x] `75. My Classes` (`7:518`) → `/teacher/classes`
- [x] `76. Mark Attendance` (`7:636`) → `/teacher/attendance`
- [x] `77. My Timetable` (`7:809`) → `/teacher/timetable`
- [x] `78. Assignments & Homework` (`7:977`) → `/teacher/assignments`
- [x] `79. Study Material Upload` (`7:1150`) → `/teacher/study-material`
- [x] `80. Marks Entry` (`7:1302`) → `/teacher/marks-entry`
- [x] `81. Student List & Profile` (`7:1478`) → `/teacher/students`
- [x] `82. Apply Leave & Leave History` (`7:1624`) → `/teacher/leave`
- [x] `83. Messages & Notices` (`7:1778`) → `/teacher/messages`
- [x] `84. Teacher My Profile` (`7:1868`) → `/teacher/profile`

### Module 4: Student Portal (85–96)
- [x] `85. Student Dashboard` (`8:1000`) → `/student`
- [x] `86. Student My Profile` (`8:1177`) → `/student/profile`
- [x] `87. My Attendance` (`8:1261`) → `/student/attendance`
- [x] `88. Student Timetable` (`8:1448`) → `/student/timetable`
- [x] `89. Homework & Assignments` (`8:1595`) → `/student/homework`
- [x] `90. Student Study Material` (`8:1730`) → `/student/study-material`
- [x] `91. Exam Schedule` (`8:1877`) → `/student/exams`
- [x] `92. Results & Report Card` (`8:2029`) → `/student/results`
- [x] `93. Student Fees & Payments` (`8:2232`) → `/student/fees`
- [x] `94. Student Library` (`8:2421`) → `/student/library`
- [x] `95. Student Notices & Events` (`8:2547`) → `/student/notices`
- [x] `96. Student Messages` (`8:2640`) → `/student/messages`

### Module 5: Parent Portal (97–105)
- [x] `97. Parent Dashboard` (`9:1757`) → `/parent`
- [x] `98. Child Switcher` (`9:1928`) → `/parent/children`
- [x] `99. Child Attendance` (`9:2005`) → `/parent/attendance`
- [x] `100. Child Results` (`9:2156`) → `/parent/results`
- [x] `101. Fees & Online Payment` (`9:2305`) → `/parent/fees`
- [x] `102. Homework Status` (`9:2446`) → `/parent/homework`
- [x] `103. Teacher Communication` (`9:2578`) → `/parent/messages`
- [x] `104. Parent Notices & Events` (`9:2660`) → `/parent/notices`
- [x] `105. Apply Leave for Child` (`9:2770`) → `/parent/leave`

### Module 6: Common & Utility Screens (106–110)
- [x] `106. Notifications Center` (`6:287`) → `/notifications`
- [x] `107. My Profile & Account Settings` (`6:395`) → `/account`
- [x] `108. Search Results` (`6:495`) → `/search`
- [x] `109. 404 / Error / Access Denied` (`6:599`) → `/status-errors`
- [x] `110. Help / Support` (`6:677`) → `/help`

