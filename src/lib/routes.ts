export type PortalRole = "public" | "auth" | "admin" | "teacher" | "student" | "parent" | "common" | "super_admin";

export type ScreenModule =
  | "public-auth"
  | "admin-setup"
  | "admin-students"
  | "admin-staff"
  | "admin-attendance-timetable"
  | "admin-exams"
  | "admin-fees"
  | "admin-library-transport"
  | "admin-hostel-comm"
  | "admin-reports-system"
  | "teacher"
  | "student"
  | "parent"
  | "common";

export interface AppScreenRoute {
  num: number;
  figmaId: string;
  figmaName: string;
  route: string;
  role: PortalRole;
  module: ScreenModule;
  indexable: boolean;
}

export const SCREEN_ROUTES: AppScreenRoute[] = [
  { num: 1, figmaId: "6:17", figmaName: "01. Landing / School Home Page", route: "/", role: "public", module: "public-auth", indexable: true },
  { num: 2, figmaId: "6:75", figmaName: "02. Login (Role Select)", route: "/login", role: "auth", module: "public-auth", indexable: true },
  { num: 3, figmaId: "6:122", figmaName: "03. Forgot Password", route: "/forgot-password", role: "auth", module: "public-auth", indexable: false },
  { num: 4, figmaId: "6:161", figmaName: "04. OTP Verification", route: "/otp-verification", role: "auth", module: "public-auth", indexable: false },
  { num: 5, figmaId: "6:201", figmaName: "05. Reset Password", route: "/reset-password", role: "auth", module: "public-auth", indexable: false },
  { num: 6, figmaId: "6:237", figmaName: "06. First-time Setup / Change Password", route: "/setup-password", role: "auth", module: "public-auth", indexable: false },

  { num: 7, figmaId: "11:2223", figmaName: "07. Admin Dashboard", route: "/admin", role: "admin", module: "admin-setup", indexable: false },
  { num: 8, figmaId: "11:2444", figmaName: "08. School Profile & Settings", route: "/admin/setup/school-profile", role: "admin", module: "admin-setup", indexable: false },
  { num: 9, figmaId: "11:2560", figmaName: "09. Academic Year Management", route: "/admin/setup/academic-years", role: "admin", module: "admin-setup", indexable: false },
  { num: 10, figmaId: "11:2705", figmaName: "10. Classes & Sections List", route: "/admin/setup/classes", role: "admin", module: "admin-setup", indexable: false },
  { num: 11, figmaId: "11:2861", figmaName: "11. Add / Edit Class & Section", route: "/admin/setup/classes/manage", role: "admin", module: "admin-setup", indexable: false },
  { num: 12, figmaId: "11:2983", figmaName: "12. Subjects List & Editor", route: "/admin/setup/subjects", role: "admin", module: "admin-setup", indexable: false },
  { num: 13, figmaId: "11:3144", figmaName: "13. Subject-Class Mapping", route: "/admin/setup/subject-mapping", role: "admin", module: "admin-setup", indexable: false },
  { num: 14, figmaId: "11:3317", figmaName: "14. Roles & Permissions", route: "/admin/setup/roles", role: "admin", module: "admin-setup", indexable: false },
  { num: 15, figmaId: "11:3484", figmaName: "15. User Management", route: "/admin/setup/users", role: "admin", module: "admin-setup", indexable: false },

  { num: 16, figmaId: "11:3645", figmaName: "16. Students List", route: "/admin/students", role: "admin", module: "admin-students", indexable: false },
  { num: 17, figmaId: "11:3846", figmaName: "17. Add Student / Admission Form", route: "/admin/students/new", role: "admin", module: "admin-students", indexable: false },
  { num: 18, figmaId: "11:3973", figmaName: "18. Student Profile", route: "/admin/students/profile", role: "admin", module: "admin-students", indexable: false },
  { num: 19, figmaId: "11:4071", figmaName: "19. Bulk Import Students", route: "/admin/students/bulk-import", role: "admin", module: "admin-students", indexable: false },
  { num: 20, figmaId: "11:4213", figmaName: "20. Student Promotion / Transfer", route: "/admin/students/promotion", role: "admin", module: "admin-students", indexable: false },
  { num: 21, figmaId: "11:4364", figmaName: "21. Student ID Card Generator", route: "/admin/students/id-cards", role: "admin", module: "admin-students", indexable: false },
  { num: 22, figmaId: "11:4476", figmaName: "22. Admission Enquiries List", route: "/admin/students/enquiries", role: "admin", module: "admin-students", indexable: false },
  { num: 23, figmaId: "11:4666", figmaName: "23. Admission Application Review", route: "/admin/students/applications", role: "admin", module: "admin-students", indexable: false },

  { num: 24, figmaId: "12:3404", figmaName: "24. Teachers List", route: "/admin/teachers", role: "admin", module: "admin-staff", indexable: false },
  { num: 25, figmaId: "12:3560", figmaName: "25. Add / Edit Teacher", route: "/admin/teachers/manage", role: "admin", module: "admin-staff", indexable: false },
  { num: 26, figmaId: "12:3684", figmaName: "26. Teacher Profile", route: "/admin/teachers/profile", role: "admin", module: "admin-staff", indexable: false },
  { num: 27, figmaId: "12:3820", figmaName: "27. Non-Teaching Staff & Editor", route: "/admin/staff", role: "admin", module: "admin-staff", indexable: false },
  { num: 28, figmaId: "12:3976", figmaName: "28. Teacher-Subject-Class Assignment", route: "/admin/teachers/assignments", role: "admin", module: "admin-staff", indexable: false },
  { num: 29, figmaId: "12:4137", figmaName: "29. Staff Attendance", route: "/admin/staff/attendance", role: "admin", module: "admin-staff", indexable: false },
  { num: 30, figmaId: "12:4307", figmaName: "30. Leave Requests Approval", route: "/admin/staff/leave-requests", role: "admin", module: "admin-staff", indexable: false },
  { num: 31, figmaId: "12:4497", figmaName: "31. Payroll / Salary List", route: "/admin/staff/payroll", role: "admin", module: "admin-staff", indexable: false },
  { num: 32, figmaId: "12:4656", figmaName: "32. Salary Slip", route: "/admin/staff/salary-slip", role: "admin", module: "admin-staff", indexable: false },

  { num: 33, figmaId: "12:4783", figmaName: "33. Student Attendance (Class-wise)", route: "/admin/attendance/students", role: "admin", module: "admin-attendance-timetable", indexable: false },
  { num: 34, figmaId: "12:4932", figmaName: "34. Attendance Reports", route: "/admin/attendance/reports", role: "admin", module: "admin-attendance-timetable", indexable: false },
  { num: 35, figmaId: "12:5098", figmaName: "35. Class Timetable (View)", route: "/admin/timetable/classes", role: "admin", module: "admin-attendance-timetable", indexable: false },
  { num: 36, figmaId: "12:5266", figmaName: "36. Create / Edit Timetable", route: "/admin/timetable/builder", role: "admin", module: "admin-attendance-timetable", indexable: false },
  { num: 37, figmaId: "12:5421", figmaName: "37. Teacher Timetable", route: "/admin/timetable/teachers", role: "admin", module: "admin-attendance-timetable", indexable: false },
  { num: 38, figmaId: "12:5567", figmaName: "38. Substitution Management", route: "/admin/timetable/substitutions", role: "admin", module: "admin-attendance-timetable", indexable: false },

  { num: 39, figmaId: "13:4366", figmaName: "39. Exam Schedule List", route: "/admin/exams", role: "admin", module: "admin-exams", indexable: false },
  { num: 40, figmaId: "13:4503", figmaName: "40. Create Exam", route: "/admin/exams/create", role: "admin", module: "admin-exams", indexable: false },
  { num: 41, figmaId: "13:4614", figmaName: "41. Exam Time Table", route: "/admin/exams/timetable", role: "admin", module: "admin-exams", indexable: false },
  { num: 42, figmaId: "13:4769", figmaName: "42. Admin Marks Entry", route: "/admin/exams/marks-entry", role: "admin", module: "admin-exams", indexable: false },
  { num: 43, figmaId: "13:4947", figmaName: "43. Grade System Settings", route: "/admin/exams/grades", role: "admin", module: "admin-exams", indexable: false },
  { num: 44, figmaId: "13:5126", figmaName: "44. Result Generation", route: "/admin/exams/results", role: "admin", module: "admin-exams", indexable: false },
  { num: 45, figmaId: "13:5302", figmaName: "45. Report Card (View / Print)", route: "/admin/exams/report-card", role: "admin", module: "admin-exams", indexable: false },
  { num: 46, figmaId: "13:5451", figmaName: "46. Admit Card Generator", route: "/admin/exams/admit-cards", role: "admin", module: "admin-exams", indexable: false },
  { num: 47, figmaId: "13:5581", figmaName: "47. Result Analytics", route: "/admin/exams/analytics", role: "admin", module: "admin-exams", indexable: false },

  { num: 48, figmaId: "14:2223", figmaName: "48. Fee Structure Setup", route: "/admin/fees/structure", role: "admin", module: "admin-fees", indexable: false },
  { num: 49, figmaId: "14:2382", figmaName: "49. Fee Collection", route: "/admin/fees/collect", role: "admin", module: "admin-fees", indexable: false },
  { num: 50, figmaId: "14:2515", figmaName: "50. Fee Receipt", route: "/admin/fees/receipt", role: "admin", module: "admin-fees", indexable: false },
  { num: 51, figmaId: "14:2640", figmaName: "51. Pending / Defaulters List", route: "/admin/fees/defaulters", role: "admin", module: "admin-fees", indexable: false },
  { num: 52, figmaId: "14:2785", figmaName: "52. Fee Reports", route: "/admin/fees/reports", role: "admin", module: "admin-fees", indexable: false },
  { num: 53, figmaId: "14:2961", figmaName: "53. Discounts & Scholarships", route: "/admin/fees/scholarships", role: "admin", module: "admin-fees", indexable: false },

  { num: 54, figmaId: "14:3097", figmaName: "54. Books List", route: "/admin/library/books", role: "admin", module: "admin-library-transport", indexable: false },
  { num: 55, figmaId: "14:3253", figmaName: "55. Add / Edit Book", route: "/admin/library/books/manage", role: "admin", module: "admin-library-transport", indexable: false },
  { num: 56, figmaId: "14:3361", figmaName: "56. Issue / Return Book", route: "/admin/library/circulation", role: "admin", module: "admin-library-transport", indexable: false },
  { num: 57, figmaId: "14:3493", figmaName: "57. Library Members & Fines", route: "/admin/library/members", role: "admin", module: "admin-library-transport", indexable: false },
  { num: 58, figmaId: "14:3669", figmaName: "58. Transport Routes & Editor", route: "/admin/transport/routes", role: "admin", module: "admin-library-transport", indexable: false },
  { num: 59, figmaId: "14:3806", figmaName: "59. Vehicles & Drivers", route: "/admin/transport/vehicles", role: "admin", module: "admin-library-transport", indexable: false },
  { num: 60, figmaId: "14:3937", figmaName: "60. Student Transport Assignment", route: "/admin/transport/assignments", role: "admin", module: "admin-library-transport", indexable: false },

  { num: 61, figmaId: "15:3050", figmaName: "61. Hostel Rooms", route: "/admin/hostel/rooms", role: "admin", module: "admin-hostel-comm", indexable: false },
  { num: 62, figmaId: "15:3209", figmaName: "62. Hostel Room Allocation", route: "/admin/hostel/allocations", role: "admin", module: "admin-hostel-comm", indexable: false },
  { num: 63, figmaId: "15:3356", figmaName: "63. Notice Board & Announcements", route: "/admin/communication/notices", role: "admin", module: "admin-hostel-comm", indexable: false },
  { num: 64, figmaId: "15:3503", figmaName: "64. Events & Calendar", route: "/admin/communication/events", role: "admin", module: "admin-hostel-comm", indexable: false },
  { num: 65, figmaId: "15:3658", figmaName: "65. Holiday List", route: "/admin/communication/holidays", role: "admin", module: "admin-hostel-comm", indexable: false },
  { num: 66, figmaId: "15:3799", figmaName: "66. Admin Messages / Inbox", route: "/admin/communication/messages", role: "admin", module: "admin-hostel-comm", indexable: false },
  { num: 67, figmaId: "15:3890", figmaName: "67. SMS / Email / WhatsApp Log", route: "/admin/communication/notifications-log", role: "admin", module: "admin-hostel-comm", indexable: false },
  { num: 68, figmaId: "15:4074", figmaName: "68. Complaints & Feedback", route: "/admin/communication/complaints", role: "admin", module: "admin-hostel-comm", indexable: false },

  { num: 69, figmaId: "15:4217", figmaName: "69. Reports Center", route: "/admin/reports", role: "admin", module: "admin-reports-system", indexable: false },
  { num: 70, figmaId: "15:4346", figmaName: "70. Inventory / Assets", route: "/admin/inventory", role: "admin", module: "admin-reports-system", indexable: false },
  { num: 71, figmaId: "15:4502", figmaName: "71. Documents & Certificate Generator", route: "/admin/documents", role: "admin", module: "admin-reports-system", indexable: false },
  { num: 72, figmaId: "15:4600", figmaName: "72. Audit Logs", route: "/admin/audit-logs", role: "admin", module: "admin-reports-system", indexable: false },
  { num: 73, figmaId: "15:4748", figmaName: "73. Backup & System Settings", route: "/admin/system-settings", role: "admin", module: "admin-reports-system", indexable: false },

  { num: 74, figmaId: "7:331", figmaName: "74. Teacher Dashboard", route: "/teacher", role: "teacher", module: "teacher", indexable: false },
  { num: 75, figmaId: "7:518", figmaName: "75. My Classes", route: "/teacher/classes", role: "teacher", module: "teacher", indexable: false },
  { num: 76, figmaId: "7:636", figmaName: "76. Mark Attendance", route: "/teacher/attendance", role: "teacher", module: "teacher", indexable: false },
  { num: 77, figmaId: "7:809", figmaName: "77. My Timetable", route: "/teacher/timetable", role: "teacher", module: "teacher", indexable: false },
  { num: 78, figmaId: "7:977", figmaName: "78. Assignments & Homework", route: "/teacher/assignments", role: "teacher", module: "teacher", indexable: false },
  { num: 79, figmaId: "7:1150", figmaName: "79. Study Material Upload", route: "/teacher/study-material", role: "teacher", module: "teacher", indexable: false },
  { num: 80, figmaId: "7:1302", figmaName: "80. Marks Entry", route: "/teacher/marks-entry", role: "teacher", module: "teacher", indexable: false },
  { num: 81, figmaId: "7:1478", figmaName: "81. Student List & Profile", route: "/teacher/students", role: "teacher", module: "teacher", indexable: false },
  { num: 82, figmaId: "7:1624", figmaName: "82. Apply Leave & Leave History", route: "/teacher/leave", role: "teacher", module: "teacher", indexable: false },
  { num: 83, figmaId: "7:1778", figmaName: "83. Messages & Notices", route: "/teacher/messages", role: "teacher", module: "teacher", indexable: false },
  { num: 84, figmaId: "7:1868", figmaName: "84. Teacher My Profile", route: "/teacher/profile", role: "teacher", module: "teacher", indexable: false },

  { num: 85, figmaId: "8:1000", figmaName: "85. Student Dashboard", route: "/student", role: "student", module: "student", indexable: false },
  { num: 86, figmaId: "8:1177", figmaName: "86. Student My Profile", route: "/student/profile", role: "student", module: "student", indexable: false },
  { num: 87, figmaId: "8:1261", figmaName: "87. My Attendance", route: "/student/attendance", role: "student", module: "student", indexable: false },
  { num: 88, figmaId: "8:1448", figmaName: "88. Student Timetable", route: "/student/timetable", role: "student", module: "student", indexable: false },
  { num: 89, figmaId: "8:1595", figmaName: "89. Homework & Assignments", route: "/student/homework", role: "student", module: "student", indexable: false },
  { num: 90, figmaId: "8:1730", figmaName: "90. Student Study Material", route: "/student/study-material", role: "student", module: "student", indexable: false },
  { num: 91, figmaId: "8:1877", figmaName: "91. Exam Schedule", route: "/student/exams", role: "student", module: "student", indexable: false },
  { num: 92, figmaId: "8:2029", figmaName: "92. Results & Report Card", route: "/student/results", role: "student", module: "student", indexable: false },
  { num: 93, figmaId: "8:2232", figmaName: "93. Student Fees & Payments", route: "/student/fees", role: "student", module: "student", indexable: false },
  { num: 94, figmaId: "8:2421", figmaName: "94. Student Library", route: "/student/library", role: "student", module: "student", indexable: false },
  { num: 95, figmaId: "8:2547", figmaName: "95. Student Notices & Events", route: "/student/notices", role: "student", module: "student", indexable: false },
  { num: 96, figmaId: "8:2640", figmaName: "96. Student Messages", route: "/student/messages", role: "student", module: "student", indexable: false },

  { num: 97, figmaId: "9:1757", figmaName: "97. Parent Dashboard", route: "/parent", role: "parent", module: "parent", indexable: false },
  { num: 98, figmaId: "9:1928", figmaName: "98. Child Switcher", route: "/parent/children", role: "parent", module: "parent", indexable: false },
  { num: 99, figmaId: "9:2005", figmaName: "99. Child Attendance", route: "/parent/attendance", role: "parent", module: "parent", indexable: false },
  { num: 100, figmaId: "9:2156", figmaName: "100. Child Results", route: "/parent/results", role: "parent", module: "parent", indexable: false },
  { num: 101, figmaId: "9:2305", figmaName: "101. Fees & Online Payment", route: "/parent/fees", role: "parent", module: "parent", indexable: false },
  { num: 102, figmaId: "9:2446", figmaName: "102. Homework Status", route: "/parent/homework", role: "parent", module: "parent", indexable: false },
  { num: 103, figmaId: "9:2578", figmaName: "103. Teacher Communication", route: "/parent/messages", role: "parent", module: "parent", indexable: false },
  { num: 104, figmaId: "9:2660", figmaName: "104. Parent Notices & Events", route: "/parent/notices", role: "parent", module: "parent", indexable: false },
  { num: 105, figmaId: "9:2770", figmaName: "105. Apply Leave for Child", route: "/parent/leave", role: "parent", module: "parent", indexable: false },

  { num: 106, figmaId: "6:287", figmaName: "106. Notifications Center", route: "/notifications", role: "common", module: "common", indexable: false },
  { num: 107, figmaId: "6:395", figmaName: "107. My Profile & Account Settings", route: "/account", role: "common", module: "common", indexable: false },
  { num: 108, figmaId: "6:495", figmaName: "108. Search Results", route: "/search", role: "common", module: "common", indexable: false },
  { num: 109, figmaId: "6:599", figmaName: "109. 404 / Error / Access Denied", route: "/status-errors", role: "common", module: "common", indexable: false },
  { num: 110, figmaId: "6:677", figmaName: "110. Help / Support", route: "/help", role: "common", module: "common", indexable: false },
];

export const PUBLIC_SEO_ROUTES = [
  "/",
  "/about",
  "/academics",
  "/admissions",
  "/apply",
  "/campus-life",
  "/notices",
  "/events",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
] as const;

