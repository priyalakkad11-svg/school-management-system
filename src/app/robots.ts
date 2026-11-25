import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenwood.edu";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
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
          "/login",
        ],
        disallow: [
          "/admin",
          "/teacher",
          "/student",
          "/parent",
          "/account",
          "/notifications",
          "/search",
          "/help",
          "/status-errors",
          "/forgot-password",
          "/otp-verification",
          "/reset-password",
          "/setup-password",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

