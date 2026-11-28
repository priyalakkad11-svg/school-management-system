-- Section B: Platform Admin, Pricing Slabs, Subscriptions, Gapless GST Invoices, Support Tickets, Holidays & Rate Limits

CREATE TABLE IF NOT EXISTS public.platform_settings (
  singleton_key text PRIMARY KEY DEFAULT 'default',
  platform_name text NOT NULL DEFAULT 'EduCore Multi-School SaaS',
  owner_name text NOT NULL DEFAULT 'Priya Lakkad',
  support_email text NOT NULL DEFAULT 'support@educore.in',
  company_name text NOT NULL DEFAULT 'EduCore Technologies Pvt Ltd',
  company_address text NOT NULL DEFAULT 'Baner Tech Park, Pune 411045, Maharashtra, India',
  gstin text NOT NULL DEFAULT '27AABCE1234F1Z5',
  default_trial_days integer NOT NULL DEFAULT 14,
  default_grace_days integer NOT NULL DEFAULT 7,
  default_gst_pct numeric(5,2) NOT NULL DEFAULT 18.00,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.platform_settings (singleton_key) VALUES ('default') ON CONFLICT (singleton_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.saas_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  yearly_discount_pct numeric(5,2) NOT NULL DEFAULT 15.00,
  setup_fee_inr numeric(12,2) NOT NULL DEFAULT 0,
  gst_pct numeric(5,2) NOT NULL DEFAULT 18.00,
  max_students integer NOT NULL DEFAULT 500,
  max_teachers integer NOT NULL DEFAULT 60,
  max_staff integer NOT NULL DEFAULT 30,
  max_storage_mb integer NOT NULL DEFAULT 5120,
  enabled_modules text[] NOT NULL DEFAULT ARRAY[
    'setup','students','teachers','staff','attendance','timetable',
    'exams','fees','communication','reports','documents'
  ],
  slabs jsonb NOT NULL DEFAULT '[
    {"min":1,"max":200,"price_per_student_month":49},
    {"min":201,"max":500,"price_per_student_month":42},
    {"min":501,"max":1000,"price_per_student_month":35},
    {"min":1001,"max":null,"price_per_student_month":29}
  ]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.saas_plans (code, name, description, yearly_discount_pct, setup_fee_inr, max_students, max_teachers, max_staff, max_storage_mb, enabled_modules, slabs)
VALUES
(
  'STARTER',
  'Foundation Campus',
  'Core academics, attendance, fees, and parent portal for growing schools.',
  10.00,
  5000.00,
  300,
  35,
  20,
  2048,
  ARRAY['setup','students','teachers','staff','attendance','timetable','exams','fees','communication','documents'],
  '[{"min":1,"max":200,"price_per_student_month":45},{"min":201,"max":500,"price_per_student_month":39},{"min":501,"max":1000,"price_per_student_month":34},{"min":1001,"max":null,"price_per_student_month":29}]'::jsonb
),
(
  'GROWTH',
  'Growth ERP Suite',
  'Complete ERP with Library, Transport, Inventory, Reports & Custom Subsites.',
  15.00,
  10000.00,
  1500,
  150,
  75,
  10240,
  ARRAY['setup','students','teachers','staff','attendance','timetable','exams','fees','library','transport','communication','reports','inventory','documents'],
  '[{"min":1,"max":200,"price_per_student_month":59},{"min":201,"max":500,"price_per_student_month":49},{"min":501,"max":1000,"price_per_student_month":42},{"min":1001,"max":null,"price_per_student_month":35}]'::jsonb
),
(
  'ENTERPRISE',
  'Enterprise Trust Campus',
  'All modules including Hostel, Priority Support & Custom Scale Capacity.',
  20.00,
  15000.00,
  10000,
  800,
  400,
  51200,
  ARRAY['setup','students','teachers','staff','attendance','timetable','exams','fees','library','transport','hostel','communication','reports','inventory','documents'],
  '[{"min":1,"max":200,"price_per_student_month":69},{"min":201,"max":500,"price_per_student_month":55},{"min":501,"max":1000,"price_per_student_month":46},{"min":1001,"max":null,"price_per_student_month":38}]'::jsonb
)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.saas_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percent', 'amount')),
  discount_value numeric(12,2) NOT NULL CHECK (discount_value >= 0),
  expires_at timestamptz,
  max_redemptions integer,
  redemption_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.school_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL UNIQUE REFERENCES public.schools(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.saas_plans(id) ON DELETE RESTRICT,
  billing_cycle text NOT NULL DEFAULT 'yearly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  student_count_tier integer NOT NULL DEFAULT 250,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('trial', 'active', 'past_due', 'read_only', 'suspended', 'cancelled')),
  trial_ends_at timestamptz,
  grace_ends_at timestamptz,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '365 days'),
  coupon_id uuid REFERENCES public.saas_coupons(id) ON DELETE SET NULL,
  monthly_rate_inr numeric(12,2) NOT NULL DEFAULT 0,
  custom_limits jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.school_subscriptions (school_id, plan_id, billing_cycle, student_count_tier, status, monthly_rate_inr)
SELECT
  '11111111-1111-4111-8111-111111111111'::uuid,
  p.id,
  'yearly',
  1240,
  'active',
  0.00
FROM public.saas_plans p
WHERE p.code = 'ENTERPRISE'
ON CONFLICT (school_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.saas_invoice_sequences (
  financial_year text PRIMARY KEY,
  last_number integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.saas_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  financial_year text NOT NULL,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.school_subscriptions(id) ON DELETE SET NULL,
  subtotal_inr numeric(12,2) NOT NULL DEFAULT 0,
  discount_inr numeric(12,2) NOT NULL DEFAULT 0,
  gst_pct numeric(5,2) NOT NULL DEFAULT 18.00,
  gst_amount_inr numeric(12,2) NOT NULL DEFAULT 0,
  total_inr numeric(12,2) NOT NULL DEFAULT 0,
  amount_paid_inr numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'issued'
    CHECK (status IN ('draft', 'issued', 'paid', 'partially_paid', 'void', 'credited')),
  due_date date NOT NULL DEFAULT (CURRENT_DATE + 15),
  issued_at timestamptz NOT NULL DEFAULT now(),
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS saas_invoices_school_idx ON public.saas_invoices (school_id, issued_at DESC);

CREATE TABLE IF NOT EXISTS public.saas_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.saas_invoices(id) ON DELETE RESTRICT,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  amount_inr numeric(12,2) NOT NULL CHECK (amount_inr > 0),
  method text NOT NULL CHECK (method IN ('UPI', 'Bank Transfer', 'Cash', 'Cheque', 'GatewayStub')),
  reference_no text NOT NULL,
  paid_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS saas_payments_school_idx ON public.saas_payments (school_id, paid_at DESC);

CREATE TABLE IF NOT EXISTS public.saas_credit_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_note_number text NOT NULL UNIQUE,
  financial_year text NOT NULL,
  invoice_id uuid NOT NULL REFERENCES public.saas_invoices(id) ON DELETE RESTRICT,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  amount_inr numeric(12,2) NOT NULL CHECK (amount_inr > 0),
  reason text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS saas_credit_notes_school_idx ON public.saas_credit_notes (school_id, issued_at DESC);

CREATE TABLE IF NOT EXISTS public.platform_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  target_status text[] NOT NULL DEFAULT ARRAY['trial', 'active', 'past_due'],
  is_active boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  description text NOT NULL,
  resolution_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS support_tickets_school_idx ON public.support_tickets (school_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.saas_notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('renewal_30d', 'renewal_7d', 'renewal_1d', 'handover', 'suspension')),
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS saas_notif_school_idx ON public.saas_notification_log (school_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.school_holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  holiday_date date NOT NULL,
  category text NOT NULL DEFAULT 'Gazetted' CHECK (category IN ('Gazetted', 'Academic', 'Exam', 'Event')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS school_holidays_school_date_idx ON public.school_holidays (school_id, holiday_date);

CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  bucket_key text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 0,
  first_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER platform_settings_set_updated_at BEFORE UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER saas_plans_set_updated_at BEFORE UPDATE ON public.saas_plans FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER school_subscriptions_set_updated_at BEFORE UPDATE ON public.school_subscriptions FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER support_tickets_set_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- Atomic FY gapless invoice & credit note number helpers
CREATE OR REPLACE FUNCTION private.next_saas_doc_number(p_prefix text, p_fy text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_seq_key text := p_prefix || '-' || p_fy;
  v_next integer;
BEGIN
  INSERT INTO public.saas_invoice_sequences (financial_year, last_number)
  VALUES (v_seq_key, 1)
  ON CONFLICT (financial_year)
  DO UPDATE SET last_number = public.saas_invoice_sequences.last_number + 1
  RETURNING last_number INTO v_next;

  RETURN p_prefix || '-' || p_fy || '-' || LPAD(v_next::text, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.next_saas_invoice_number(p_fy text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT private.next_saas_doc_number('EDU', p_fy);
$$;

CREATE OR REPLACE FUNCTION public.next_saas_credit_note_number(p_fy text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT private.next_saas_doc_number('CN', p_fy);
$$;

REVOKE ALL ON FUNCTION public.next_saas_invoice_number(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_saas_invoice_number(text) TO service_role;
REVOKE ALL ON FUNCTION public.next_saas_credit_note_number(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_saas_credit_note_number(text) TO service_role;

-- Usage metering & platform dashboard aggregation helpers (Demo School excluded from MRR/real stats)
CREATE OR REPLACE FUNCTION public.get_school_usage_summary(p_school_id uuid)
RETURNS TABLE (
  students_count bigint,
  teachers_count bigint,
  staff_count bigint,
  users_count bigint,
  storage_bytes bigint,
  max_students integer,
  max_teachers integer,
  max_staff integer,
  max_storage_mb integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH counts AS (
    SELECT
      COUNT(*) FILTER (WHERE p.role = 'student' AND p.deleted_at IS NULL) AS students_count,
      COUNT(*) FILTER (WHERE p.role = 'teacher' AND p.deleted_at IS NULL) AS teachers_count,
      COUNT(*) FILTER (WHERE p.role = 'staff' AND p.deleted_at IS NULL) AS staff_count,
      COUNT(*) FILTER (WHERE p.deleted_at IS NULL) AS users_count
    FROM public.profiles p
    WHERE p.school_id = p_school_id
  ),
  storage_agg AS (
    SELECT COALESCE(SUM(COALESCE((o.metadata ->> 'size')::bigint, 0)), 0)::bigint AS storage_bytes
    FROM storage.objects o
    WHERE o.name LIKE p_school_id::text || '/%'
  ),
  limits AS (
    SELECT
      COALESCE((sub.custom_limits ->> 'max_students')::integer, pl.max_students, 500) AS max_students,
      COALESCE((sub.custom_limits ->> 'max_teachers')::integer, pl.max_teachers, 60) AS max_teachers,
      COALESCE((sub.custom_limits ->> 'max_staff')::integer, pl.max_staff, 30) AS max_staff,
      COALESCE((sub.custom_limits ->> 'max_storage_mb')::integer, pl.max_storage_mb, 5120) AS max_storage_mb
    FROM public.schools s
    LEFT JOIN public.school_subscriptions sub ON sub.school_id = s.id
    LEFT JOIN public.saas_plans pl ON pl.id = sub.plan_id
    WHERE s.id = p_school_id
    LIMIT 1
  )
  SELECT
    c.students_count,
    c.teachers_count,
    c.staff_count,
    c.users_count,
    st.storage_bytes,
    COALESCE(l.max_students, 500),
    COALESCE(l.max_teachers, 60),
    COALESCE(l.max_staff, 30),
    COALESCE(l.max_storage_mb, 5120)
  FROM counts c
  CROSS JOIN storage_agg st
  LEFT JOIN limits l ON true;
$$;

CREATE OR REPLACE FUNCTION public.get_platform_dashboard_metrics()
RETURNS TABLE (
  active_schools bigint,
  trial_schools bigint,
  suspended_schools bigint,
  total_real_schools bigint,
  total_real_students bigint,
  mrr_inr numeric,
  arr_inr numeric,
  renewals_due_30d bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    COUNT(*) FILTER (WHERE s.is_demo = false AND s.deleted_at IS NULL AND s.status = 'active') AS active_schools,
    COUNT(*) FILTER (WHERE s.is_demo = false AND s.deleted_at IS NULL AND s.status = 'trial') AS trial_schools,
    COUNT(*) FILTER (WHERE s.is_demo = false AND s.deleted_at IS NULL AND s.status IN ('suspended', 'read_only')) AS suspended_schools,
    COUNT(*) FILTER (WHERE s.is_demo = false AND s.deleted_at IS NULL) AS total_real_schools,
    (
      SELECT COUNT(*)
      FROM public.profiles p
      JOIN public.schools sc ON sc.id = p.school_id
      WHERE sc.is_demo = false
        AND sc.deleted_at IS NULL
        AND p.deleted_at IS NULL
        AND p.role = 'student'
    ) AS total_real_students,
    COALESCE(SUM(CASE WHEN s.is_demo = false AND s.deleted_at IS NULL AND sub.status IN ('active', 'past_due') THEN sub.monthly_rate_inr ELSE 0 END), 0) AS mrr_inr,
    COALESCE(SUM(CASE WHEN s.is_demo = false AND s.deleted_at IS NULL AND sub.status IN ('active', 'past_due') THEN sub.monthly_rate_inr * 12 ELSE 0 END), 0) AS arr_inr,
    COUNT(*) FILTER (
      WHERE s.is_demo = false
        AND s.deleted_at IS NULL
        AND sub.current_period_end IS NOT NULL
        AND sub.current_period_end <= (now() + interval '30 days')
        AND sub.current_period_end >= now()
    ) AS renewals_due_30d
  FROM public.schools s
  LEFT JOIN public.school_subscriptions sub ON sub.school_id = s.id;
$$;

-- Exclude non-tenant SaaS billing tables if needed or keep tenant-scoped ones inside get_tenant_rls_audit?
-- school_subscriptions, saas_invoices, saas_payments, saas_credit_notes, saas_notification_log, support_tickets, school_holidays all have school_id AND tenant RLS!
-- Keep auth_rate_limits and platform tables service-only / super_admin!
CREATE OR REPLACE FUNCTION public.get_tenant_rls_audit()
RETURNS TABLE (
  table_name text,
  rls_enabled boolean,
  policy_count bigint,
  has_school_scope boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    c.relname::text AS table_name,
    c.relrowsecurity AS rls_enabled,
    COUNT(p.policyname) AS policy_count,
    BOOL_OR(
      COALESCE(p.qual, '') ILIKE '%school_id%'
      OR COALESCE(p.with_check, '') ILIKE '%school_id%'
      OR COALESCE(p.qual, '') ILIKE '%current_school_id%'
      OR COALESCE(p.with_check, '') ILIKE '%current_school_id%'
    ) AS has_school_scope
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid AND a.attname = 'school_id' AND NOT a.attisdropped
  LEFT JOIN pg_catalog.pg_policies p ON p.schemaname = 'public' AND p.tablename = c.relname
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relname NOT IN ('support_sessions')
  GROUP BY c.relname, c.relrowsecurity
  ORDER BY c.relname;
$$;

-- Enable RLS & Grants on all new tables
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_invoice_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.platform_settings, public.saas_plans, public.school_subscriptions,
  public.saas_invoices, public.saas_payments, public.saas_credit_notes,
  public.platform_announcements, public.support_tickets, public.saas_notification_log,
  public.school_holidays TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.platform_settings, public.saas_plans, public.saas_coupons,
  public.school_subscriptions, public.saas_invoices, public.saas_payments, public.saas_credit_notes,
  public.platform_announcements, public.support_tickets, public.saas_notification_log,
  public.school_holidays TO authenticated;

-- RLS Policies: Platform tables -> super_admin only (or read active plans/announcements); Tenant tables -> scoped by school_id = current_school_id()
CREATE POLICY platform_settings_super_admin ON public.platform_settings FOR ALL TO authenticated
  USING ((SELECT private.is_super_admin())) WITH CHECK ((SELECT private.is_super_admin()));

CREATE POLICY saas_plans_read_auth ON public.saas_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY saas_plans_write_super_admin ON public.saas_plans FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY saas_plans_upd_super_admin ON public.saas_plans FOR UPDATE TO authenticated
  USING ((SELECT private.is_super_admin())) WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY saas_plans_del_super_admin ON public.saas_plans FOR DELETE TO authenticated USING ((SELECT private.is_super_admin()));

CREATE POLICY saas_coupons_super_admin ON public.saas_coupons FOR ALL TO authenticated
  USING ((SELECT private.is_super_admin())) WITH CHECK ((SELECT private.is_super_admin()));

CREATE POLICY school_subscriptions_select ON public.school_subscriptions FOR SELECT TO authenticated
  USING ((SELECT private.is_super_admin()) OR school_id = (SELECT private.current_school_id()));
CREATE POLICY school_subscriptions_write_sa ON public.school_subscriptions FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY school_subscriptions_upd_sa ON public.school_subscriptions FOR UPDATE TO authenticated
  USING ((SELECT private.is_super_admin())) WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY school_subscriptions_del_sa ON public.school_subscriptions FOR DELETE TO authenticated USING ((SELECT private.is_super_admin()));

CREATE POLICY saas_invoice_sequences_super_admin ON public.saas_invoice_sequences FOR ALL TO authenticated
  USING ((SELECT private.is_super_admin())) WITH CHECK ((SELECT private.is_super_admin()));

CREATE POLICY saas_invoices_select ON public.saas_invoices FOR SELECT TO authenticated
  USING ((SELECT private.is_super_admin()) OR (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin())));
CREATE POLICY saas_invoices_write_sa ON public.saas_invoices FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY saas_invoices_upd_sa ON public.saas_invoices FOR UPDATE TO authenticated
  USING ((SELECT private.is_super_admin())) WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY saas_invoices_del_sa ON public.saas_invoices FOR DELETE TO authenticated USING ((SELECT private.is_super_admin()));

CREATE POLICY saas_payments_select ON public.saas_payments FOR SELECT TO authenticated
  USING ((SELECT private.is_super_admin()) OR (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin())));
CREATE POLICY saas_payments_write_sa ON public.saas_payments FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY saas_payments_upd_sa ON public.saas_payments FOR UPDATE TO authenticated
  USING ((SELECT private.is_super_admin())) WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY saas_payments_del_sa ON public.saas_payments FOR DELETE TO authenticated USING ((SELECT private.is_super_admin()));

CREATE POLICY saas_credit_notes_select ON public.saas_credit_notes FOR SELECT TO authenticated
  USING ((SELECT private.is_super_admin()) OR (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin())));
CREATE POLICY saas_credit_notes_write_sa ON public.saas_credit_notes FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY saas_credit_notes_upd_sa ON public.saas_credit_notes FOR UPDATE TO authenticated
  USING ((SELECT private.is_super_admin())) WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY saas_credit_notes_del_sa ON public.saas_credit_notes FOR DELETE TO authenticated USING ((SELECT private.is_super_admin()));

CREATE POLICY platform_announcements_select ON public.platform_announcements FOR SELECT TO authenticated USING (is_active = true OR (SELECT private.is_super_admin()));
CREATE POLICY platform_announcements_write_sa ON public.platform_announcements FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY platform_announcements_upd_sa ON public.platform_announcements FOR UPDATE TO authenticated
  USING ((SELECT private.is_super_admin())) WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY platform_announcements_del_sa ON public.platform_announcements FOR DELETE TO authenticated USING ((SELECT private.is_super_admin()));

CREATE POLICY support_tickets_select ON public.support_tickets FOR SELECT TO authenticated
  USING ((SELECT private.is_super_admin()) OR school_id = (SELECT private.current_school_id()));
CREATE POLICY support_tickets_insert ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.is_super_admin()) OR (school_id = (SELECT private.current_school_id()) AND (SELECT private.school_allows_write())));
CREATE POLICY support_tickets_update ON public.support_tickets FOR UPDATE TO authenticated
  USING ((SELECT private.is_super_admin()) OR (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write())))
  WITH CHECK ((SELECT private.is_super_admin()) OR (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write())));
CREATE POLICY support_tickets_delete ON public.support_tickets FOR DELETE TO authenticated
  USING ((SELECT private.is_super_admin()));

CREATE POLICY saas_notif_log_select ON public.saas_notification_log FOR SELECT TO authenticated
  USING ((SELECT private.is_super_admin()) OR (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin())));
CREATE POLICY saas_notif_log_write_sa ON public.saas_notification_log FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY saas_notif_log_upd_sa ON public.saas_notification_log FOR UPDATE TO authenticated
  USING ((SELECT private.is_super_admin())) WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY saas_notif_log_del_sa ON public.saas_notification_log FOR DELETE TO authenticated USING ((SELECT private.is_super_admin()));

CREATE POLICY school_holidays_select ON public.school_holidays FOR SELECT TO authenticated
  USING (school_id = (SELECT private.current_school_id()));
CREATE POLICY school_holidays_insert ON public.school_holidays FOR INSERT TO authenticated
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
CREATE POLICY school_holidays_update ON public.school_holidays FOR UPDATE TO authenticated
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()))
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
CREATE POLICY school_holidays_delete ON public.school_holidays FOR DELETE TO authenticated
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));

-- auth_rate_limits has RLS enabled with zero authenticated policies -> strictly service_role only!
;
