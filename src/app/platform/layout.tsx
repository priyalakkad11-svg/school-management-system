import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Platform Super Admin | EduCore SaaS",
    template: "%s | EduCore Platform",
  },
  robots: { index: false, follow: false },
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return children;
}
