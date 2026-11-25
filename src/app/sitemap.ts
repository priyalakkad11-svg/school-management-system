import type { MetadataRoute } from "next";
import { PUBLIC_SEO_ROUTES } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenwood.edu";
  const lastModified = new Date("2026-11-25");

  return PUBLIC_SEO_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "/notices" || route === "/events" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/admissions" || route === "/apply" ? 0.9 : 0.7,
  }));
}

