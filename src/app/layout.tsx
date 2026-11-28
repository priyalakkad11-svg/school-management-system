import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { envServer } from "@/lib/env.server";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const siteUrl = envServer.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Greenwood International Academy | EduCore School ERP",
    template: "%s | Greenwood International Academy",
  },
  description:
    "Unified K-12 campus platform powered by EduCore ERP connecting students, parents, faculty, and school administration.",
  keywords: [
    "Greenwood International Academy",
    "EduCore School ERP",
    "School Management System",
    "K-12 ERP India",
    "CBSE IB School Portal",
    "Student Parent Teacher Portal",
  ],
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Greenwood International Academy — EduCore ERP",
    title: "Greenwood International Academy | EduCore School ERP",
    description:
      "Unified K-12 campus platform powered by EduCore ERP connecting students, parents, faculty, and school administration.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Greenwood International Academy | EduCore School ERP",
    description:
      "Unified K-12 campus platform powered by EduCore ERP connecting students, parents, faculty, and school administration.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-canvas text-ink font-sans flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
