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
- [ ] Phase 2: All 110 screens implemented & verified
- [ ] Phase 3: SEO / AEO / GEO, JSON-LD, sitemap, robots, llms.txt, PWA manifest
- [ ] Phase 4: Full Playwright + axe-core + Lighthouse QA & `QA-REPORT.md`

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
- [ ] `07. Admin Dashboard` (`11:2223`) → `/admin`
- [ ] `08. School Profile & Settings` (`11:2444`) → `/admin/setup/school-profile`
- [ ] `09. Academic Year Management` (`11:2560`) → `/admin/setup/academic-years`
- [ ] `10. Classes & Sections List` (`11:2705`) → `/admin/setup/classes`
- [ ] `11. Add / Edit Class & Section` (`11:2861`) → `/admin/setup/classes/manage`
- [ ] `12. Subjects List & Editor` (`11:2983`) → `/admin/setup/subjects`
- [ ] `13. Subject-Class Mapping` (`11:3144`) → `/admin/setup/subject-mapping`
- [ ] `14. Roles & Permissions` (`11:3317`) → `/admin/setup/roles`
- [ ] `15. User Management` (`11:3484`) → `/admin/setup/users`

### Module 2B: Admin Students (16–23)
- [ ] `16. Students List` (`11:3645`) → `/admin/students`
- [ ] `17. Add Student / Admission Form` (`11:3846`) → `/admin/students/new`
- [ ] `18. Student Profile` (`11:3973`) → `/admin/students/profile`
- [ ] `19. Bulk Import Students` (`11:4071`) → `/admin/students/bulk-import`
- [ ] `20. Student Promotion / Transfer` (`11:4213`) → `/admin/students/promotion`
- [ ] `21. Student ID Card Generator` (`11:4364`) → `/admin/students/id-cards`
- [ ] `22. Admission Enquiries List` (`11:4476`) → `/admin/students/enquiries`
- [ ] `23. Admission Application Review` (`11:4666`) → `/admin/students/applications`

### Module 2C: Admin Teachers & Staff (24–32)
- [ ] `24. Teachers List` (`12:3404`) → `/admin/teachers`
- [ ] `25. Add / Edit Teacher` (`12:3560`) → `/admin/teachers/manage`
- [ ] `26. Teacher Profile` (`12:3684`) → `/admin/teachers/profile`
- [ ] `27. Non-Teaching Staff & Editor` (`12:3820`) → `/admin/staff`
- [ ] `28. Teacher-Subject-Class Assignment` (`12:3976`) → `/admin/teachers/assignments`
- [ ] `29. Staff Attendance` (`12:4137`) → `/admin/staff/attendance`
- [ ] `30. Leave Requests Approval` (`12:4307`) → `/admin/staff/leave-requests`
- [ ] `31. Payroll / Salary List` (`12:4497`) → `/admin/staff/payroll`
- [ ] `32. Salary Slip` (`12:4656`) → `/admin/staff/salary-slip`

### Module 2D: Admin Attendance & Timetable (33–38)
- [ ] `33. Student Attendance (Class-wise)` (`12:4783`) → `/admin/attendance/students`
- [ ] `34. Attendance Reports` (`12:4932`) → `/admin/attendance/reports`
- [ ] `35. Class Timetable (View)` (`12:5098`) → `/admin/timetable/classes`
- [ ] `36. Create / Edit Timetable` (`12:5266`) → `/admin/timetable/builder`
- [ ] `37. Teacher Timetable` (`12:5421`) → `/admin/timetable/teachers`
- [ ] `38. Substitution Management` (`12:5567`) → `/admin/timetable/substitutions`

### Module 2E: Admin Exams & Results (39–47)
- [ ] `39. Exam Schedule List` (`13:4366`) → `/admin/exams`
- [ ] `40. Create Exam` (`13:4503`) → `/admin/exams/create`
- [ ] `41. Exam Time Table` (`13:4614`) → `/admin/exams/timetable`
- [ ] `42. Admin Marks Entry` (`13:4769`) → `/admin/exams/marks-entry`
- [ ] `43. Grade System Settings` (`13:4947`) → `/admin/exams/grades`
- [ ] `44. Result Generation` (`13:5126`) → `/admin/exams/results`
- [ ] `45. Report Card (View / Print)` (`13:5302`) → `/admin/exams/report-card`
- [ ] `46. Admit Card Generator` (`13:5451`) → `/admin/exams/admit-cards`
- [ ] `47. Result Analytics` (`13:5581`) → `/admin/exams/analytics`

### Module 2F: Admin Fees (48–53)
- [ ] `48. Fee Structure Setup` (`14:2223`) → `/admin/fees/structure`
- [ ] `49. Fee Collection` (`14:2382`) → `/admin/fees/collect`
- [ ] `50. Fee Receipt` (`14:2515`) → `/admin/fees/receipt`
- [ ] `51. Pending / Defaulters List` (`14:2640`) → `/admin/fees/defaulters`
- [ ] `52. Fee Reports` (`14:2785`) → `/admin/fees/reports`
- [ ] `53. Discounts & Scholarships` (`14:2961`) → `/admin/fees/scholarships`

### Module 2G: Admin Library & Transport (54–60)
- [ ] `54. Books List` (`14:3097`) → `/admin/library/books`
- [ ] `55. Add / Edit Book` (`14:3253`) → `/admin/library/books/manage`
- [ ] `56. Issue / Return Book` (`14:3361`) → `/admin/library/circulation`
- [ ] `57. Library Members & Fines` (`14:3493`) → `/admin/library/members`
- [ ] `58. Transport Routes & Editor` (`14:3669`) → `/admin/transport/routes`
- [ ] `59. Vehicles & Drivers` (`14:3806`) → `/admin/transport/vehicles`
- [ ] `60. Student Transport Assignment` (`14:3937`) → `/admin/transport/assignments`

### Module 2H: Admin Hostel & Communication (61–68)
- [ ] `61. Hostel Rooms` (`15:3050`) → `/admin/hostel/rooms`
- [ ] `62. Hostel Room Allocation` (`15:3209`) → `/admin/hostel/allocations`
- [ ] `63. Notice Board & Announcements` (`15:3356`) → `/admin/communication/notices`
- [ ] `64. Events & Calendar` (`15:3503`) → `/admin/communication/events`
- [ ] `65. Holiday List` (`15:3658`) → `/admin/communication/holidays`
- [ ] `66. Admin Messages / Inbox` (`15:3799`) → `/admin/communication/messages`
- [ ] `67. SMS / Email / WhatsApp Log` (`15:3890`) → `/admin/communication/notifications-log`
- [ ] `68. Complaints & Feedback` (`15:4074`) → `/admin/communication/complaints`

### Module 2I: Admin Reports & System Settings (69–73)
- [ ] `69. Reports Center` (`15:4217`) → `/admin/reports`
- [ ] `70. Inventory / Assets` (`15:4346`) → `/admin/inventory`
- [ ] `71. Documents & Certificate Generator` (`15:4502`) → `/admin/documents`
- [ ] `72. Audit Logs` (`15:4600`) → `/admin/audit-logs`
- [ ] `73. Backup & System Settings` (`15:4748`) → `/admin/system-settings`

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
- [ ] `85. Student Dashboard` (`8:1000`) → `/student`
- [ ] `86. Student My Profile` (`8:1177`) → `/student/profile`
- [ ] `87. My Attendance` (`8:1261`) → `/student/attendance`
- [ ] `88. Student Timetable` (`8:1448`) → `/student/timetable`
- [ ] `89. Homework & Assignments` (`8:1595`) → `/student/homework`
- [ ] `90. Student Study Material` (`8:1730`) → `/student/study-material`
- [ ] `91. Exam Schedule` (`8:1877`) → `/student/exams`
- [ ] `92. Results & Report Card` (`8:2029`) → `/student/results`
- [ ] `93. Student Fees & Payments` (`8:2232`) → `/student/fees`
- [ ] `94. Student Library` (`8:2421`) → `/student/library`
- [ ] `95. Student Notices & Events` (`8:2547`) → `/student/notices`
- [ ] `96. Student Messages` (`8:2640`) → `/student/messages`

### Module 5: Parent Portal (97–105)
- [ ] `97. Parent Dashboard` (`9:1757`) → `/parent`
- [ ] `98. Child Switcher` (`9:1928`) → `/parent/children`
- [ ] `99. Child Attendance` (`9:2005`) → `/parent/attendance`
- [ ] `100. Child Results` (`9:2156`) → `/parent/results`
- [ ] `101. Fees & Online Payment` (`9:2305`) → `/parent/fees`
- [ ] `102. Homework Status` (`9:2446`) → `/parent/homework`
- [ ] `103. Teacher Communication` (`9:2578`) → `/parent/messages`
- [ ] `104. Parent Notices & Events` (`9:2660`) → `/parent/notices`
- [ ] `105. Apply Leave for Child` (`9:2770`) → `/parent/leave`

### Module 6: Common & Utility Screens (106–110)
- [ ] `106. Notifications Center` (`6:287`) → `/notifications`
- [ ] `107. My Profile & Account Settings` (`6:395`) → `/account`
- [ ] `108. Search Results` (`6:495`) → `/search`
- [ ] `109. 404 / Error / Access Denied` (`6:599`) → `/status-errors`
- [ ] `110. Help / Support` (`6:677`) → `/help`

