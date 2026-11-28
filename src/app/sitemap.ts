import type { MetadataRoute } from "next";
import { PUBLIC_SEO_ROUTES } from "@/lib/routes";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenwood.edu";
  const lastModified = new Date("2026-11-28");

  const entries: MetadataRoute.Sitemap = PUBLIC_SEO_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "/notices" || route === "/events" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/admissions" || route === "/apply" ? 0.9 : 0.7,
  }));

  try {
    const admin = createAdminClient();
    const { data: schools } = await admin
      .from("schools")
      .select("school_code, updated_at")
      .is("deleted_at", null)
      .neq("status", "cancelled")
      .limit(200);

    for (const s of schools ?? []) {
      const lm = s.updated_at ? new Date(s.updated_at) : lastModified;
      for (const suffix of ["", "/admissions", "/notices", "/events", "/contact"]) {
        entries.push({
          url: `${siteUrl}/s/${s.school_code}${suffix}`,
          lastModified: lm,
          changeFrequency: suffix === "/notices" || suffix === "/events" ? "weekly" : "monthly",
          priority: suffix === "" ? 0.85 : 0.7,
        });
      }
    }
  } catch {
    // Allow build-time static sitemap generation cleanly without runtime env errors
  }

  return entries;
}
