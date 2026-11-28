import { z } from "zod";

export const userRoleSchema = z.enum([
  "super_admin",
  "school_admin",
  "principal",
  "admin",
  "teacher",
  "student",
  "parent",
  "staff",
]);

export const loginSchema = z.object({
  role: userRoleSchema,
  identifier: z.string().min(3, "Enter a valid email or ID"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberDevice: z.boolean().default(true),
});

export const forgotPasswordSchema = z.object({
  role: userRoleSchema,
  contact: z.string().min(4, "Enter your registered email or mobile number"),
});

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Minimum 8 characters required"),
    confirmPassword: z.string().min(8, "Confirm your new password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const setupPasswordSchema = z
  .object({
    tempPassword: z.string().min(6, "Enter current temporary password"),
    newPassword: z.string().min(8, "Minimum 8 characters required"),
    confirmPassword: z.string().min(8, "Confirm password"),
    securityQuestion: z.string().min(4),
    securityAnswer: z.string().min(2, "Enter an answer"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const schoolProfileSchema = z.object({
  schoolName: z.string().min(3),
  affiliationCode: z.string().min(3),
  principalName: z.string().min(3),
  officialEmail: z.string().email(),
  phone: z.string().min(7),
  timezoneCurrency: z.string().min(3),
  address: z.string().min(6),
  gradingMode: z.string().min(3),
});

export const classSectionSchema = z.object({
  className: z.string().min(2),
  gradeOrder: z.coerce.number().int().min(1).max(12),
  wing: z.string().min(2),
  sections: z.string().min(1),
  capacityPerSection: z.coerce.number().int().min(10).max(80),
  roomBlock: z.string().min(2),
});

export const subjectSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  category: z.string().min(2),
  maxTheory: z.coerce.number().int().min(0).max(100),
  maxPractical: z.coerce.number().int().min(0).max(100),
});

export const studentAdmissionSchema = z.object({
  name: z.string().min(3),
  dob: z.string().min(4),
  gender: z.enum(["Male", "Female", "Other"]),
  classSection: z.string().min(2),
  parentName: z.string().min(3),
  parentPhone: z.string().min(8),
  parentEmail: z.string().email(),
  transportRoute: z.string().min(2),
  address: z.string().min(6),
});

export const teacherSchema = z.object({
  name: z.string().min(3),
  empId: z.string().min(3),
  department: z.string().min(2),
  designation: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  qualification: z.string().min(2),
  salaryGross: z.coerce.number().positive(),
});

export const examSchema = z.object({
  name: z.string().min(3),
  type: z.string().min(2),
  gradeScale: z.string().min(2),
  startDate: z.string().min(4),
  endDate: z.string().min(4),
  passingPct: z.coerce.number().min(20).max(60),
});

export const noticeSchema = z.object({
  title: z.string().min(4),
  audience: z.string().min(3),
  channel: z.string().min(3),
  description: z.string().min(8),
});

export const leaveRequestSchema = z.object({
  leaveType: z.string().min(2),
  fromDate: z.string().min(4),
  toDate: z.string().min(4),
  substitute: z.string().optional(),
  reason: z.string().min(5),
});

export const supportTicketSchema = z.object({
  module: z.string().min(2),
  priority: z.string().min(2),
  subject: z.string().min(4),
  description: z.string().min(10),
});

export const enquirySchema = z.object({
  childName: z.string().min(2),
  applyingClass: z.string().min(1),
  parentName: z.string().min(2),
  parentPhone: z.string().min(8),
  notes: z.string().optional(),
});

