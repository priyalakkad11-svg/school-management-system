import { createAdminClient } from "@/lib/supabase/admin";

export interface PublicSchoolMicrositeData {
  id: string;
  schoolCode: string;
  name: string;
  board: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  accentColor: string;
  status: string;
  enabledModules: string[];
  principalName: string;
  affiliationCode: string;
  activeYearName: string;
  classesCount: number;
  upcomingHolidays: Array<{ id: string; title: string; holidayDate: string; category: string }>;
}

export async function getPublicSchoolMicrosite(
  rawSchoolCode: string,
): Promise<PublicSchoolMicrositeData | null> {
  const schoolCode = decodeURIComponent(rawSchoolCode).trim().toUpperCase();
  if (!schoolCode) return null;

  const admin = createAdminClient();
  const { data: school } = await admin
    .from("schools")
    .select("*")
    .eq("school_code", schoolCode)
    .is("deleted_at", null)
    .neq("status", "cancelled")
    .maybeSingle();

  if (!school) return null;

  const [settingsRes, ayRes, classesCountRes, holidaysRes] = await Promise.all([
    admin.from("school_settings").select("*").eq("school_id", school.id).limit(1).maybeSingle(),
    admin
      .from("academic_years")
      .select("name")
      .eq("school_id", school.id)
      .eq("status", "Active")
      .is("deleted_at", null)
      .maybeSingle(),
    admin
      .from("school_classes")
      .select("id", { count: "exact", head: true })
      .eq("school_id", school.id)
      .is("deleted_at", null),
    admin
      .from("school_holidays")
      .select("id, title, holiday_date, category")
      .eq("school_id", school.id)
      .order("holiday_date", { ascending: true })
      .limit(10),
  ]);

  return {
    id: school.id,
    schoolCode: school.school_code,
    name: settingsRes.data?.school_name ?? school.name,
    board: school.board,
    address: settingsRes.data?.address ?? school.address,
    contactEmail: settingsRes.data?.official_email ?? school.contact_email,
    contactPhone: settingsRes.data?.phone ?? school.contact_phone,
    accentColor: school.accent_color,
    status: school.status,
    enabledModules: school.enabled_modules,
    principalName: settingsRes.data?.principal_name ?? "Principal",
    affiliationCode: settingsRes.data?.affiliation_code ?? school.board,
    activeYearName: ayRes.data?.name ?? "2026-27",
    classesCount: classesCountRes.count ?? 0,
    upcomingHolidays: (holidaysRes.data ?? []).map((h) => ({
      id: h.id,
      title: h.title,
      holidayDate: h.holiday_date,
      category: h.category,
    })),
  };
}
