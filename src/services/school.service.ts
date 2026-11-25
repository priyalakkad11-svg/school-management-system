import {
  MOCK_ACADEMIC_YEARS,
  MOCK_ADMIN_USERS,
  MOCK_AUDIT_LOGS,
  MOCK_BOOKS,
  MOCK_CLASSES,
  MOCK_COMPLAINTS,
  MOCK_ENQUIRIES,
  MOCK_EXAMS,
  MOCK_FEE_TRANSACTIONS,
  MOCK_HOSTEL_ROOMS,
  MOCK_INVENTORY,
  MOCK_LEAVES,
  MOCK_MESSAGES,
  MOCK_NOTICES,
  MOCK_NOTIFICATIONS,
  MOCK_PAYROLL,
  MOCK_ROUTES,
  MOCK_STAFF,
  MOCK_STUDENTS,
  MOCK_SUBJECTS,
  MOCK_TEACHERS,
  MONTHLY_REVENUE_ATTENDANCE_CHART,
} from "@/mocks/school.data";

export const SchoolSetupService = {
  listAcademicYears: async () => MOCK_ACADEMIC_YEARS,
  listClasses: async () => MOCK_CLASSES,
  listSubjects: async () => MOCK_SUBJECTS,
  listAdminUsers: async () => MOCK_ADMIN_USERS,
};

export const StudentService = {
  list: async () => MOCK_STUDENTS,
  getById: async (id: string) => MOCK_STUDENTS.find((s) => s.id === id || s.admissionId === id) ?? MOCK_STUDENTS[0],
  listEnquiries: async () => MOCK_ENQUIRIES,
};

export const StaffService = {
  listTeachers: async () => MOCK_TEACHERS,
  getTeacher: async (id?: string) => MOCK_TEACHERS.find((t) => t.id === id) ?? MOCK_TEACHERS[0],
  listStaff: async () => MOCK_STAFF,
  listLeaves: async () => MOCK_LEAVES,
  listPayroll: async () => MOCK_PAYROLL,
};

export const AcademicService = {
  listExams: async () => MOCK_EXAMS,
  getDashboardTrend: async () => MONTHLY_REVENUE_ATTENDANCE_CHART,
};

export const FinanceService = {
  listTransactions: async () => MOCK_FEE_TRANSACTIONS,
};

export const OperationsService = {
  listBooks: async () => MOCK_BOOKS,
  listRoutes: async () => MOCK_ROUTES,
  listHostelRooms: async () => MOCK_HOSTEL_ROOMS,
  listInventory: async () => MOCK_INVENTORY,
  listAuditLogs: async () => MOCK_AUDIT_LOGS,
};

export const CommunicationService = {
  listNotices: async () => MOCK_NOTICES,
  listMessages: async () => MOCK_MESSAGES,
  listComplaints: async () => MOCK_COMPLAINTS,
  listNotifications: async () => MOCK_NOTIFICATIONS,
};

