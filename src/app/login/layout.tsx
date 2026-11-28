import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unified Portal Login",
  description:
    "Sign in to Greenwood International Academy EduCore ERP as Admin, Teacher, Student, Parent, or Staff.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
