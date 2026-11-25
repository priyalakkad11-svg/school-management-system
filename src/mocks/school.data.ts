import type {
  AcademicYear,
  AdminUser,
  AdmissionEnquiry,
  AuditLogEntry,
  ComplaintTicket,
  ExamItem,
  FeeTransaction,
  HostelRoom,
  InventoryAsset,
  LeaveRequest,
  LibraryBook,
  MessageThread,
  NoticeItem,
  NotificationItem,
  PayrollRecord,
  SchoolClass,
  StaffMember,
  Student,
  Subject,
  Teacher,
  TransportRoute,
} from "@/types/domain";

export const MOCK_ACADEMIC_YEARS: AcademicYear[] = [
  { id: "ay-26", name: "AY 2026–27 (Current)", startDate: "01 Apr 2026", endDate: "31 Mar 2027", studentsCount: 2480, status: "Active" },
  { id: "ay-27", name: "AY 2027–28 (Draft)", startDate: "01 Apr 2027", endDate: "31 Mar 2028", studentsCount: 0, status: "Upcoming" },
  { id: "ay-25", name: "AY 2025–26", startDate: "01 Apr 2025", endDate: "31 Mar 2026", studentsCount: 2356, status: "Archived" },
  { id: "ay-24", name: "AY 2024–25", startDate: "01 Apr 2024", endDate: "31 Mar 2025", studentsCount: 2210, status: "Archived" },
];

export const MOCK_CLASSES: SchoolClass[] = [
  { id: "cls-10", name: "Class 10", gradeOrder: 10, wing: "Senior Wing", sections: ["A", "B", "C", "D"], classTeachers: "Mrs. Kavita Nair (+3)", strength: 156, capacity: 160, roomBlock: "Senior Block", status: "Active" },
  { id: "cls-9", name: "Class 9", gradeOrder: 9, wing: "Senior Wing", sections: ["A", "B", "C"], classTeachers: "Mr. Arjun Menon (+2)", strength: 114, capacity: 120, roomBlock: "Senior Block", status: "Active" },
  { id: "cls-12", name: "Class 12 (Science)", gradeOrder: 12, wing: "Lab Wing", sections: ["A", "B"], classTeachers: "Dr. S. Kulkarni (+1)", strength: 72, capacity: 80, roomBlock: "Lab Wing", status: "Active" },
  { id: "cls-6", name: "Class 6", gradeOrder: 6, wing: "Middle Wing", sections: ["A", "B", "C", "D"], classTeachers: "Ms. Ritu Kapoor (+3)", strength: 152, capacity: 160, roomBlock: "Middle Wing", status: "Active" },
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: "sub-math", code: "MATH-041", name: "Mathematics", category: "Core Theory", maxTheory: 80, maxPractical: 20, periodsPerWeek: 6, status: "Active" },
  { id: "sub-phy", code: "PHY-042", name: "Physics", category: "Theory + Lab", maxTheory: 70, maxPractical: 30, periodsPerWeek: 5, status: "Active" },
  { id: "sub-cs", code: "CS-083", name: "Computer Science", category: "Theory + Lab", maxTheory: 50, maxPractical: 50, periodsPerWeek: 4, status: "Active" },
  { id: "sub-eng", code: "ENG-184", name: "English Lang & Lit", category: "Core Theory", maxTheory: 80, maxPractical: 20, periodsPerWeek: 5, status: "Active" },
  { id: "sub-frn", code: "FRN-018", name: "French Language", category: "Elective", maxTheory: 80, maxPractical: 20, periodsPerWeek: 3, status: "Active" },
];

export const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: "usr-1", name: "Priya Lakkad", email: "priya.lakkad@greenwood.edu", role: "Super Admin", lastLogin: "Online now", twoFactor: true, status: "Active" },
  { id: "usr-2", name: "Suresh Bansal", email: "accounts@greenwood.edu", role: "Accountant", lastLogin: "22 mins ago", twoFactor: true, status: "Active" },
  { id: "usr-3", name: "Dr. Anjali Rao", email: "examcell@greenwood.edu", role: "Exam Controller", lastLogin: "2 hours ago", twoFactor: true, status: "Active" },
  { id: "usr-4", name: "Mohan Joshi", email: "library@greenwood.edu", role: "Librarian", lastLogin: "Yesterday", twoFactor: false, status: "Active" },
];

export const MOCK_STUDENTS: Student[] = [
  { id: "stu-1", admissionId: "ADM-2026-0142", rollNo: "01", name: "Aarav Sharma", className: "Class 10", section: "A", dob: "14 May 2011", gender: "Male", bloodGroup: "O+", house: "Emerald", parentName: "Rajesh Sharma", parentPhone: "+91 98250 11223", parentEmail: "rajesh.sharma@gmail.com", address: "42 Rosewood Residency, Sector 14, Pune", transportRoute: "Bus Route #04", attendancePct: 96.5, termAvgPct: 91.6, feeStatus: "Paid", feeDueAmount: 0, status: "Active" },
  { id: "stu-2", admissionId: "ADM-2026-0143", rollNo: "02", name: "Ananya Verma", className: "Class 10", section: "A", dob: "21 Jul 2011", gender: "Female", bloodGroup: "B+", house: "Sapphire", parentName: "Neha Verma", parentPhone: "+91 98250 22334", parentEmail: "neha.verma@gmail.com", address: "18 Crestview Apts, Baner, Pune", transportRoute: "Self / Walker", attendancePct: 98.0, termAvgPct: 94.2, feeStatus: "Paid", feeDueAmount: 0, status: "Active" },
  { id: "stu-3", admissionId: "ADM-2026-0144", rollNo: "03", name: "Devansh Patel", className: "Class 10", section: "A", dob: "03 Nov 2011", gender: "Male", bloodGroup: "A+", house: "Ruby", parentName: "Kiran Patel", parentPhone: "+91 98250 33445", parentEmail: "kiran.patel@gmail.com", address: "904 Sky Gardens, Wakad, Pune", transportRoute: "Bus Route #07", attendancePct: 84.2, termAvgPct: 71.5, feeStatus: "Due", feeDueAmount: 19000, status: "Active" },
  { id: "stu-4", admissionId: "ADM-2026-0145", rollNo: "04", name: "Ishita Rao", className: "Class 10", section: "B", dob: "19 Feb 2011", gender: "Female", bloodGroup: "AB+", house: "Topaz", parentName: "Suman Rao", parentPhone: "+91 98250 44556", parentEmail: "suman.rao@gmail.com", address: "7 Lakefront Enclave, Aundh, Pune", transportRoute: "Bus Route #01", attendancePct: 94.1, termAvgPct: 85.4, feeStatus: "Paid", feeDueAmount: 0, status: "Active" },
  { id: "stu-5", admissionId: "ADM-2026-0146", rollNo: "05", name: "Kabir Joshi", className: "Class 10", section: "B", dob: "29 Aug 2011", gender: "Male", bloodGroup: "O-", house: "Emerald", parentName: "Amit Joshi", parentPhone: "+91 98250 55667", parentEmail: "amit.joshi@gmail.com", address: "11 Palm Meadow, Pashan, Pune", transportRoute: "Bus Route #04", attendancePct: 91.0, termAvgPct: 62.0, feeStatus: "Overdue", feeDueAmount: 22700, status: "Active" },
  { id: "stu-6", admissionId: "ADM-2026-0618", rollNo: "14", name: "Diya Sharma", className: "Class 6", section: "C", dob: "09 Jan 2015", gender: "Female", bloodGroup: "O+", house: "Emerald", parentName: "Rajesh Sharma", parentPhone: "+91 98250 11223", parentEmail: "rajesh.sharma@gmail.com", address: "42 Rosewood Residency, Sector 14, Pune", transportRoute: "Bus Route #04", attendancePct: 98.2, termAvgPct: 94.0, feeStatus: "Paid", feeDueAmount: 0, status: "Active" },
];

export const MOCK_ENQUIRIES: AdmissionEnquiry[] = [
  { id: "enq-1", enquiryNo: "ENQ-2026-901", childName: "Reyansh Nair", applyingClass: "Class 1", parentName: "Vikram Nair", parentPhone: "+91 98220 11002", source: "Website Form", stage: "Tour Scheduled", score: 90, notes: "Campus tour confirmed for Saturday 10:30 AM." },
  { id: "enq-2", enquiryNo: "ENQ-2026-902", childName: "Naina Kulkarni", applyingClass: "Class 6", parentName: "Siddharth Kulkarni", parentPhone: "+91 98220 22003", source: "Walk-In", stage: "Form Submitted", score: 88, notes: "Strong academic background; sibling discount eligible." },
  { id: "enq-3", enquiryNo: "ENQ-2026-903", childName: "Vivaan Shah", applyingClass: "Class 9", parentName: "Meera Shah", parentPhone: "+91 98220 33004", source: "Referral", stage: "Follow-up Due", score: 81, notes: "Waiting for previous school marksheet." },
  { id: "enq-4", enquiryNo: "ENQ-2026-904", childName: "Sara Khan", applyingClass: "KG-2", parentName: "Imran Khan", parentPhone: "+91 98220 44005", source: "Website Form", stage: "Enrolled", score: 94, notes: "Fee paid and uniform issued." },
];

export const MOCK_TEACHERS: Teacher[] = [
  { id: "tch-1", empId: "TCH-042", name: "Mrs. Kavita Nair", department: "Mathematics", designation: "Senior PGT", qualification: "M.Sc. Mathematics, B.Ed.", classesAssigned: "10-A (CT), 10-C, 9-B, 12-Sci", periodsPerWeek: 26, email: "kavita.nair@greenwood.edu", phone: "+91 98250 77812", salaryGross: 74000, joinDate: "01 Jul 2018", status: "Active" },
  { id: "tch-2", empId: "TCH-019", name: "Mr. Arjun Menon", department: "Physics", designation: "PGT Physics", qualification: "M.Sc. Physics, B.Ed.", classesAssigned: "10-A, 11-Sci, 12-Sci", periodsPerWeek: 24, email: "arjun.menon@greenwood.edu", phone: "+91 98250 66109", salaryGross: 68000, joinDate: "15 Jun 2019", status: "Active" },
  { id: "tch-3", empId: "TCH-088", name: "Ms. Clara D'Souza", department: "English", designation: "TGT English", qualification: "M.A. English Lit, B.Ed.", classesAssigned: "9-A, 10-A, 10-B", periodsPerWeek: 27, email: "clara.dsouza@greenwood.edu", phone: "+91 98250 55421", salaryGross: 62000, joinDate: "10 Apr 2021", status: "On Leave" },
  { id: "tch-4", empId: "TCH-104", name: "Mr. Vikram Rao", department: "Computer Science", designation: "CS Lab Lead", qualification: "B.Tech CS, M.Ed.", classesAssigned: "8-A, 9-A, 10-A, 12-Sci", periodsPerWeek: 20, email: "vikram.rao@greenwood.edu", phone: "+91 98250 44310", salaryGross: 66000, joinDate: "03 Aug 2022", status: "Active" },
];

export const MOCK_STAFF: StaffMember[] = [
  { id: "stf-1", empId: "STF-011", name: "Ramesh Pawar", role: "Bus Driver #04", department: "Transport", shift: "07:00–15:30", phone: "+91 98230 11220", salary: 26000, status: "Active" },
  { id: "stf-2", empId: "STF-018", name: "Sunita Kamble", role: "Lab Assistant", department: "Science Lab", shift: "08:00–16:00", phone: "+91 98230 22331", salary: 29500, status: "Active" },
  { id: "stf-3", empId: "STF-024", name: "Mahesh Shinde", role: "Security Lead", department: "Campus Safety", shift: "Night Shift", phone: "+91 98230 33442", salary: 24000, status: "Active" },
  { id: "stf-4", empId: "STF-031", name: "Mohan Joshi", role: "Head Librarian", department: "Library", shift: "08:30–16:30", phone: "+91 98230 44553", salary: 42000, status: "Active" },
];

export const MOCK_LEAVES: LeaveRequest[] = [
  { id: "lv-1", applicantName: "Mrs. Kavita Nair", applicantRole: "Teacher", classOrDept: "Mathematics", leaveType: "Medical", dates: "27–28 Nov 2026", days: 2, substitute: "Mr. Rohan Deshmukh", reason: "Scheduled dental surgery & recovery", status: "Pending" },
  { id: "lv-2", applicantName: "Mr. Vikram Rao", applicantRole: "Teacher", classOrDept: "Computer Sci.", leaveType: "Casual", dates: "30 Nov 2026", days: 1, substitute: "Mr. A. Joshi", reason: "Personal family work", status: "Pending" },
  { id: "lv-3", applicantName: "Ms. Clara D'Souza", applicantRole: "Teacher", classOrDept: "English", leaveType: "Medical", dates: "25 Nov 2026", days: 1, substitute: "Mrs. Priya Mehta", reason: "Acute migraine", status: "Approved" },
  { id: "lv-4", applicantName: "Aarav Sharma", applicantRole: "Student", classOrDept: "Class 10-A", leaveType: "Family", dates: "19 Nov 2026", days: 1, reason: "Family ceremony", status: "Approved" },
];

export const MOCK_PAYROLL: PayrollRecord[] = [
  { id: "pay-1", empId: "TCH-042", name: "Mrs. Kavita Nair", designation: "Senior PGT Mathematics", month: "November 2026", basic: 48000, hra: 18000, allowance: 8000, pf: 3600, tds: 1800, pt: 200, netPay: 68400, bankRef: "SAL-2611-042", status: "Processed" },
  { id: "pay-2", empId: "TCH-019", name: "Mr. Arjun Menon", designation: "PGT Physics", month: "November 2026", basic: 44000, hra: 16000, allowance: 8000, pf: 3300, tds: 1600, pt: 200, netPay: 62900, bankRef: "SAL-2611-019", status: "Processed" },
  { id: "pay-3", empId: "TCH-088", name: "Ms. Clara D'Souza", designation: "TGT English", month: "November 2026", basic: 40000, hra: 15000, allowance: 7000, pf: 3000, tds: 1200, pt: 200, netPay: 57600, bankRef: "SAL-2611-088", status: "Pending" },
  { id: "pay-4", empId: "STF-011", name: "Ramesh Pawar", designation: "Bus Driver #04", month: "November 2026", basic: 18000, hra: 6000, allowance: 2000, pf: 1600, tds: 0, pt: 200, netPay: 24200, bankRef: "SAL-2611-011", status: "Processed" },
];

export const MOCK_EXAMS: ExamItem[] = [
  { id: "ex-1", name: "Mid-Term Assessment 2026", type: "Summative Term", classes: "Grades 1–12", dateWindow: "08 Dec – 17 Dec 2026", marksLocked: "0 / 42", passingPct: 33, status: "Published" },
  { id: "ex-2", name: "Term 1 Unit Evaluation", type: "Term Assessment", classes: "Grades 1–12", dateWindow: "10 Aug – 19 Aug 2026", marksLocked: "42 / 42", passingPct: 33, status: "Results Live" },
  { id: "ex-3", name: "Pre-Board Practicals", type: "Board Practical", classes: "Grades 10 & 12", dateWindow: "12 Jan – 20 Jan 2027", marksLocked: "0 / 6", passingPct: 33, status: "Draft" },
];

export const MOCK_FEE_TRANSACTIONS: FeeTransaction[] = [
  { id: "fee-1", receiptNo: "RCP-2026-4410", admissionId: "ADM-2026-0142", studentName: "Aarav Sharma", className: "10-A", feeHead: "Term 2 Tuition & Lab", amount: 20350, discount: 1850, netPaid: 18500, mode: "UPI (GPay)", date: "25 Nov 2026", status: "Paid" },
  { id: "fee-2", receiptNo: "RCP-2026-4411", admissionId: "ADM-2026-0618", studentName: "Diya Sharma", className: "6-C", feeHead: "Term 2 Tuition Fee", amount: 14200, discount: 0, netPaid: 14200, mode: "NetBanking", date: "18 Nov 2026", status: "Paid" },
  { id: "fee-3", receiptNo: "INV-2026-4412", admissionId: "ADM-2026-0144", studentName: "Devansh Patel", className: "10-A", feeHead: "Term 2 Tuition + Late Fine", amount: 19000, discount: 0, netPaid: 0, mode: "Pending", date: "10 Aug 2026", status: "Due" },
  { id: "fee-4", receiptNo: "INV-2026-4413", admissionId: "ADM-2026-0146", studentName: "Kabir Joshi", className: "10-B", feeHead: "Term 2 Tuition + Transport", amount: 22700, discount: 0, netPaid: 0, mode: "Pending", date: "10 Aug 2026", status: "Overdue" },
];

export const MOCK_BOOKS: LibraryBook[] = [
  { id: "bk-1", accNo: "LIB-4421", title: "Concepts of Physics Vol. 2", author: "H.C. Verma", isbn: "978-8177092325", category: "Physics", shelf: "Rack A-04", available: 14, total: 18, status: "Available" },
  { id: "bk-2", accNo: "LIB-1189", title: "Mathematics Class 10 Reference", author: "R.D. Sharma", isbn: "978-9391003517", category: "Mathematics", shelf: "Rack B-01", available: 2, total: 25, status: "Low Stock" },
  { id: "bk-3", accNo: "LIB-0923", title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0061120084", category: "Literature", shelf: "Lit C-12", available: 8, total: 10, status: "Available" },
  { id: "bk-4", accNo: "LIB-5510", title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", category: "Computer Sci.", shelf: "CS D-03", available: 0, total: 4, status: "All Issued" },
];

export const MOCK_ROUTES: TransportRoute[] = [
  { id: "rt-1", code: "Route #01", title: "Kothrud – Paud Road", coverage: "Kothrud Depot → Karve Statue → Campus", stopsCount: 9, monthlyFee: 2400, busNo: "BUS-01 • MH-12-PQ-4401", driverName: "Suresh Mane", driverPhone: "+91 98230 22331", capacity: 48, occupied: 41, status: "Parked" },
  { id: "rt-2", code: "Route #04", title: "Baner – Oakridge Express", coverage: "Oakridge → Balewadi High St → Campus", stopsCount: 11, monthlyFee: 2600, busNo: "BUS-04 • MH-12-PQ-4410", driverName: "Ramesh Pawar", driverPhone: "+91 98230 11220", capacity: 48, occupied: 42, status: "On Route" },
  { id: "rt-3", code: "Route #07", title: "Wakad – Hinjewadi Ph 1", coverage: "Dange Chowk → Wakad Bridge → Campus", stopsCount: 12, monthlyFee: 2800, busNo: "BUS-07 • MH-12-PQ-4418", driverName: "Vikram More", driverPhone: "+91 98230 33442", capacity: 40, occupied: 38, status: "Maintenance" },
];

export const MOCK_HOSTEL_ROOMS: HostelRoom[] = [
  { id: "hr-1", roomNo: "EB-101", wing: "Boys Wing — Emerald Bhavan", floor: "1st Floor", type: "2-Bed AC", occupied: 2, capacity: 2, monthlyFee: 9500, residents: ["Vivaan Rao (11-Sci)", "Karan Verma (11-Sci)"], status: "Full" },
  { id: "hr-2", roomNo: "EB-102", wing: "Boys Wing — Emerald Bhavan", floor: "1st Floor", type: "2-Bed AC", occupied: 1, capacity: 2, monthlyFee: 9500, residents: ["Pranav Nair (11-Sci)"], status: "Open" },
  { id: "hr-3", roomNo: "EB-204", wing: "Boys Wing — Emerald Bhavan", floor: "2nd Floor", type: "3-Bed Non-AC", occupied: 2, capacity: 3, monthlyFee: 6800, residents: ["Rohan Kapoor (9-A)", "Aditya Joshi (9-B)"], status: "Open" },
  { id: "hr-4", roomNo: "GB-105", wing: "Girls Wing — Gargi Bhavan", floor: "1st Floor", type: "2-Bed AC", occupied: 2, capacity: 2, monthlyFee: 9500, residents: ["Riya Kapoor (12-Com)", "Meera Iyer (12-Sci)"], status: "Full" },
];

export const MOCK_NOTICES: NoticeItem[] = [
  { id: "nt-1", title: "Annual Science & Robotics Expo 2026", audience: "All Portals", category: "Event", date: "20 Nov 2026", eventDate: "12 Dec 2026", description: "Project abstracts for Grades 8–12 must be submitted to the Science Department by Dec 02.", views: 1940, status: "Pinned" },
  { id: "nt-2", title: "Mid-Term Examination Date Sheet Published", audience: "Grades 1–12", category: "Exam", date: "24 Nov 2026", eventDate: "08–17 Dec 2026", description: "Students must carry printed Admit Cards and arrive 20 minutes prior to the exam window.", views: 2180, status: "Published" },
  { id: "nt-3", title: "Parent-Teacher Meeting (Term 1 Review)", audience: "Parents", category: "PTM", date: "18 Nov 2026", eventDate: "05 Dec 2026", description: "Individual 15-minute parent review slots open across all classrooms.", views: 2310, status: "Published" },
  { id: "nt-4", title: "Winter Uniform Transition Notice", audience: "All Students", category: "Circular", date: "15 Nov 2026", eventDate: "01 Dec 2026", description: "School blazers and navy sweaters are mandatory during morning assembly starting Dec 01.", views: 1820, status: "Published" },
];

export const MOCK_MESSAGES: MessageThread[] = [
  {
    id: "msg-1",
    participant: "Mr. Rajesh Sharma",
    roleLabel: "Parent • Aarav (10-A)",
    preview: "Regarding Aarav's Olympiad prep & scholarship...",
    time: "10:15 AM",
    unread: true,
    messages: [
      { sender: "Mr. Rajesh Sharma", text: "Good morning! Could you share the reference pack for the Regional Math Olympiad?", time: "10:12 AM", self: false },
      { sender: "EduCore Staff", text: "Hello Mr. Sharma! The Olympiad problem pack is now live under Study Material for Class 10-A.", time: "10:15 AM", self: true },
    ],
  },
  {
    id: "msg-2",
    participant: "Mrs. Kavita Nair",
    roleLabel: "Class Teacher • 10-A Math",
    preview: "Pre-board paper moderation scheduled @ 3 PM",
    time: "Yesterday",
    unread: false,
    messages: [
      { sender: "Mrs. Kavita Nair", text: "Math department moderation meeting is scheduled in Conference Room B at 3:00 PM.", time: "Yesterday", self: false },
    ],
  },
  {
    id: "msg-3",
    participant: "Transport Desk",
    roleLabel: "Fleet Operations",
    preview: "Bus #07 fitness renewal documents ready",
    time: "22 Nov",
    unread: false,
    messages: [
      { sender: "Transport Desk", text: "RTO fitness renewal inspection for Bus #07 is booked for Friday morning.", time: "22 Nov", self: false },
    ],
  },
];

export const MOCK_COMPLAINTS: ComplaintTicket[] = [
  { id: "cmp-1", ticketNo: "CMP-2026-114", submittedBy: "Parent (6-C)", category: "Transport", subject: "Bus #04 morning pickup 10m late", description: "Oakridge stop arrival shifted from 07:25 to 07:35 due to roadwork.", assignedTo: "Transport Officer", status: "In Progress" },
  { id: "cmp-2", ticketNo: "CMP-2026-115", submittedBy: "Student (11-A)", category: "Facilities", subject: "Lab 2 projector calibration needed", description: "Projector display slightly blurred on right edge.", assignedTo: "IT Admin", status: "Resolved" },
  { id: "cmp-3", ticketNo: "CMP-2026-116", submittedBy: "Parent (10-B)", category: "Canteen", subject: "Request more millet & fruit options", description: "Adding fresh seasonal fruit bowls in recess menu.", assignedTo: "Principal Office", status: "Open" },
];

export const MOCK_INVENTORY: InventoryAsset[] = [
  { id: "ast-1", tag: "AST-IT-041", name: "Dell OptiPlex Desktops", department: "CS Lab 1 & 2", quantity: 45, valueInr: 2250000, condition: "Good" },
  { id: "ast-2", tag: "AST-LAB-19", name: "Compound Microscopes", department: "Biology Lab", quantity: 24, valueInr: 288000, condition: "Good" },
  { id: "ast-3", tag: "AST-AV-08", name: "Epson Smart Projectors", department: "Senior Block", quantity: 12, valueInr: 640000, condition: "Needs Repair" },
  { id: "ast-4", tag: "AST-FUR-90", name: "Dual Student Desks", department: "Middle Wing", quantity: 180, valueInr: 900000, condition: "Good" },
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: "aud-1", timestamp: "25 Nov 10:18:04", actor: "Suresh Bansal (Accountant)", module: "Fees", action: "Issued Receipt RCP-2026-4410 (₹18,500)", ip: "192.168.1.44" },
  { id: "aud-2", timestamp: "25 Nov 09:42:19", actor: "Mrs. Kavita Nair (Teacher)", module: "Attendance", action: "Submitted Class 10-A attendance (40 students)", ip: "192.168.1.82" },
  { id: "aud-3", timestamp: "24 Nov 18:10:55", actor: "Priya Lakkad (Super Admin)", module: "RBAC", action: "Updated Accountant export permissions", ip: "103.42.19.12" },
  { id: "aud-4", timestamp: "24 Nov 14:05:11", actor: "Dr. Anjali Rao (Exam Cell)", module: "Exams", action: "Locked Term 1 marks for Class 10-A", ip: "192.168.1.19" },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: "nf-1", title: "Fee Payment Received", description: "Aarav Sharma (Class 10-A) paid Term 2 Tuition Fee of ₹18,500 via UPI.", category: "Fees", time: "2 mins ago", tag: "Paid", tone: "success", unread: true },
  { id: "nf-2", title: "Leave Request Pending", description: "Mrs. Kavita Nair (Math Dept) requested 2 days Medical Leave (Nov 27–28).", category: "HR", time: "18 mins ago", tag: "Action Required", tone: "warning", unread: true },
  { id: "nf-3", title: "Exam Timetable Published", description: "Mid-Term Assessment Schedule for Grades 6–12 is now live on Student & Parent portals.", category: "Academic", time: "1 hour ago", tag: "Academic", tone: "info", unread: true },
  { id: "nf-4", title: "Bus Route #04 Delay Alert", description: "GPS tracker reports 12-min traffic delay near Oakridge Crossing.", category: "Transport", time: "3 hours ago", tag: "Transport", tone: "danger", unread: false },
  { id: "nf-5", title: "Automated Cloud Backup", description: "Nightly encrypted PostgreSQL snapshot completed (4.2 GB).", category: "System", time: "Yesterday", tag: "System", tone: "neutral", unread: false },
];

export const MONTHLY_REVENUE_ATTENDANCE_CHART = [
  { month: "Jun", feesLakhs: 28, attendancePct: 92 },
  { month: "Jul", feesLakhs: 24, attendancePct: 95 },
  { month: "Aug", feesLakhs: 36, attendancePct: 93 },
  { month: "Sep", feesLakhs: 21, attendancePct: 94 },
  { month: "Oct", feesLakhs: 32, attendancePct: 96 },
  { month: "Nov", feesLakhs: 43, attendancePct: 95.4 },
];

