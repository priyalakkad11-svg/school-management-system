import {
  getLiveAuditLogsAction,
  getLiveBooksAction,
  getLiveComplaintsAction,
  getLiveEnquiriesAction,
  getLiveEventsAction,
  getLiveExamsAction,
  getLiveFeeTransactionsAction,
  getLiveHostelRoomsAction,
  getLiveInventoryAction,
  getLiveLeavesAction,
  getLiveMessagesAction,
  getLiveNoticesAction,
  getLiveNotificationsAction,
  getLivePayrollAction,
  getLiveRoutesAction,
  getLiveStaffAction,
  getLiveStudentsAction,
  getLiveTeachersAction,
} from "@/app/actions/live-data.actions";

export const StudentService = {
  list: () => getLiveStudentsAction(),
  getById: async (id: string) => {
    const all = await getLiveStudentsAction();
    return all.find((s) => s.id === id || s.admissionId === id) ?? all[0] ?? null;
  },
  listEnquiries: () => getLiveEnquiriesAction(),
};

export const StaffService = {
  listTeachers: () => getLiveTeachersAction(),
  getTeacher: async (id?: string) => {
    const all = await getLiveTeachersAction();
    return (id ? all.find((t) => t.id === id || t.empId === id) : all[0]) ?? all[0] ?? null;
  },
  listStaff: () => getLiveStaffAction(),
  listLeaves: () => getLiveLeavesAction(),
  listPayroll: () => getLivePayrollAction(),
};

export const AcademicService = {
  listExams: () => getLiveExamsAction(),
  getDashboardTrend: async () => [
    { month: "Jun", feeLakhs: 28, attendancePct: 92 },
    { month: "Jul", feeLakhs: 24, attendancePct: 95 },
    { month: "Aug", feeLakhs: 36, attendancePct: 93 },
    { month: "Sep", feeLakhs: 21, attendancePct: 94 },
    { month: "Oct", feeLakhs: 32, attendancePct: 96 },
    { month: "Nov", feeLakhs: 43, attendancePct: 95.4 },
  ],
};

export const FinanceService = {
  listTransactions: () => getLiveFeeTransactionsAction(),
};

export const OperationsService = {
  listBooks: () => getLiveBooksAction(),
  listRoutes: () => getLiveRoutesAction(),
  listHostelRooms: () => getLiveHostelRoomsAction(),
  listInventory: () => getLiveInventoryAction(),
  listAuditLogs: () => getLiveAuditLogsAction(),
};

export const CommunicationService = {
  listNotices: (allowPublic = false) => getLiveNoticesAction(allowPublic),
  listEvents: (allowPublic = false) => getLiveEventsAction(allowPublic),
  listMessages: () => getLiveMessagesAction(),
  listComplaints: () => getLiveComplaintsAction(),
  listNotifications: () => getLiveNotificationsAction(),
};
