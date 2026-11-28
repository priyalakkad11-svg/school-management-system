-- Step 1: Schools & Support Sessions
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_code text NOT NULL UNIQUE,
  name text NOT NULL,
  logo_path text,
  accent_color text NOT NULL DEFAULT 'indigo',
  address text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  board text NOT NULL DEFAULT 'CBSE',
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('trial', 'active', 'past_due', 'read_only', 'suspended', 'cancelled')),
  is_demo boolean NOT NULL DEFAULT false,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  currency text NOT NULL DEFAULT 'INR',
  date_format text NOT NULL DEFAULT 'DD MMM YYYY',
  working_days text[] NOT NULL DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  enabled_modules text[] NOT NULL DEFAULT ARRAY[
    'setup', 'students', 'teachers', 'staff', 'attendance', 'timetable',
    'exams', 'fees', 'library', 'transport', 'hostel', 'communication',
    'reports', 'inventory', 'documents'
  ],
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS schools_status_idx ON public.schools (status);
CREATE INDEX IF NOT EXISTS schools_is_demo_idx ON public.schools (is_demo);
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

INSERT INTO public.schools (
  id, school_code, name, address, contact_email, contact_phone, board, status, is_demo
)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'GIA01',
  'Greenwood International Academy (Demo)',
  'Plot 18, Knowledge Park, Baner Road, Pune 411045',
  'office@greenwood.edu.in',
  '+91 20 2748 9900',
  'CBSE',
  'active',
  true
)
ON CONFLICT (school_code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.support_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  reason text NOT NULL,
  read_only boolean NOT NULL DEFAULT true,
  expires_at timestamptz NOT NULL,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_sessions_admin_idx ON public.support_sessions (super_admin_id, ended_at, expires_at);
ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;

-- Step 2: Add school_id columns (nullable first for safe backfill)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS sub_role text,
  ADD COLUMN IF NOT EXISTS permission_role_id uuid REFERENCES public.rbac_roles(id) ON DELETE SET NULL;

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE RESTRICT;

ALTER TABLE public.school_settings
  ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;

ALTER TABLE public.academic_years
  ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;

ALTER TABLE public.school_classes
  ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;

ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;

ALTER TABLE public.class_subject_mappings
  ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;

ALTER TABLE public.rbac_roles
  ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;

ALTER TABLE public.rbac_permissions
  ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;

-- Step 3: Install updated helpers & triggers BEFORE backfilling rows so audit_logs trigger always populates school_id
CREATE OR REPLACE FUNCTION private.current_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.role
  FROM public.profiles p
  WHERE p.id = (SELECT auth.uid())
    AND p.deleted_at IS NULL
    AND p.status = 'Active'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION private.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT private.current_role();
$$;

CREATE OR REPLACE FUNCTION private.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(private.current_role() = 'super_admin'::public.user_role, false);
$$;

CREATE OR REPLACE FUNCTION private.current_school_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE
    WHEN private.is_super_admin() THEN (
      SELECT ss.school_id
      FROM public.support_sessions ss
      WHERE ss.super_admin_id = (SELECT auth.uid())
        AND ss.ended_at IS NULL
        AND ss.expires_at > now()
      ORDER BY ss.created_at DESC
      LIMIT 1
    )
    ELSE (
      SELECT p.school_id
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.deleted_at IS NULL
        AND p.status = 'Active'
      LIMIT 1
    )
  END;
$$;

CREATE OR REPLACE FUNCTION private.school_allows_write()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE
    WHEN private.is_super_admin() THEN EXISTS (
      SELECT 1
      FROM public.support_sessions ss
      WHERE ss.super_admin_id = (SELECT auth.uid())
        AND ss.ended_at IS NULL
        AND ss.expires_at > now()
        AND ss.read_only = false
    )
    ELSE EXISTS (
      SELECT 1
      FROM public.schools s
      WHERE s.id = private.current_school_id()
        AND s.deleted_at IS NULL
        AND s.status IN ('trial', 'active', 'past_due')
    )
  END;
$$;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    private.current_role() IN (
      'school_admin'::public.user_role,
      'admin'::public.user_role,
      'principal'::public.user_role
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION private.is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    private.current_role() IN (
      'school_admin'::public.user_role,
      'admin'::public.user_role,
      'principal'::public.user_role,
      'staff'::public.user_role
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION private.has_permission(perm_code text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role public.user_role;
  v_module text;
  v_action text;
  v_allowed boolean := false;
BEGIN
  v_role := private.current_role();
  IF v_role IN ('school_admin'::public.user_role, 'admin'::public.user_role, 'principal'::public.user_role) THEN
    RETURN true;
  END IF;

  IF v_role <> 'staff'::public.user_role THEN
    RETURN false;
  END IF;

  v_module := split_part(perm_code, ':', 1);
  v_action := split_part(perm_code, ':', 2);

  SELECT
    CASE v_action
      WHEN 'view' THEN rp.can_view
      WHEN 'create' THEN rp.can_create
      WHEN 'edit' THEN rp.can_edit
      WHEN 'delete' THEN rp.can_delete
      WHEN 'export' THEN rp.can_export
      ELSE false
    END
  INTO v_allowed
  FROM public.profiles p
  JOIN public.rbac_permissions rp
    ON rp.role_id = p.permission_role_id
   AND rp.school_id = p.school_id
  WHERE p.id = (SELECT auth.uid())
    AND p.deleted_at IS NULL
    AND p.status = 'Active'
    AND lower(rp.module) = lower(v_module)
  LIMIT 1;

  RETURN COALESCE(v_allowed, false);
END;
$$;

REVOKE ALL ON FUNCTION private.current_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.current_role() TO authenticated;
REVOKE ALL ON FUNCTION private.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_super_admin() TO authenticated;
REVOKE ALL ON FUNCTION private.current_school_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.current_school_id() TO authenticated;
REVOKE ALL ON FUNCTION private.school_allows_write() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.school_allows_write() TO authenticated;
REVOKE ALL ON FUNCTION private.has_permission(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_permission(text) TO authenticated;

CREATE OR REPLACE TRIGGER schools_set_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE FUNCTION private.prevent_self_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NOT NULL THEN
    IF NOT private.is_super_admin() THEN
      IF NEW.role = 'super_admin'::public.user_role THEN
        RAISE EXCEPTION 'super_admin assignment is forbidden from client sessions'
          USING ERRCODE = '42501';
      END IF;
      IF NOT private.is_admin() THEN
        IF NEW.role IS DISTINCT FROM OLD.role
           OR NEW.status IS DISTINCT FROM OLD.status
           OR NEW.user_code IS DISTINCT FROM OLD.user_code
           OR NEW.school_id IS DISTINCT FROM OLD.school_id
           OR NEW.sub_role IS DISTINCT FROM OLD.sub_role
           OR NEW.permission_role_id IS DISTINCT FROM OLD.permission_role_id
           OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
          RAISE EXCEPTION 'Only school administrators may modify role, status, school_id, or user_code'
            USING ERRCODE = '42501';
        END IF;
      ELSIF NEW.school_id IS DISTINCT FROM OLD.school_id THEN
        RAISE EXCEPTION 'School administrators cannot reassign users across schools'
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.sync_role_to_auth_app_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object(
      'role', NEW.role::text,
      'status', NEW.status::text,
      'school_id', NEW.school_id::text
    )
  WHERE id = NEW.id
    AND (
      raw_app_meta_data ->> 'role' IS DISTINCT FROM NEW.role::text
      OR raw_app_meta_data ->> 'status' IS DISTINCT FROM NEW.status::text
      OR raw_app_meta_data ->> 'school_id' IS DISTINCT FROM NEW.school_id::text
    );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_sync_role_to_auth
  AFTER INSERT OR UPDATE OF role, status, school_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.sync_role_to_auth_app_metadata();

CREATE OR REPLACE FUNCTION private.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role_text text;
  v_role public.user_role;
  v_full_name text;
  v_initials text;
  v_school_id uuid;
  v_school_raw text;
BEGIN
  v_role_text := NEW.raw_app_meta_data ->> 'role';
  IF v_role_text IN ('super_admin', 'school_admin', 'principal', 'admin', 'teacher', 'student', 'parent', 'staff') THEN
    v_role := v_role_text::public.user_role;
  ELSE
    v_role := 'student'::public.user_role;
  END IF;

  v_school_raw := NULLIF(TRIM(NEW.raw_app_meta_data ->> 'school_id'), '');
  IF v_school_raw IS NOT NULL THEN
    v_school_id := v_school_raw::uuid;
  ELSE
    v_school_id := '11111111-1111-4111-8111-111111111111'::uuid;
  END IF;

  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_app_meta_data ->> 'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
    split_part(COALESCE(NEW.email, 'User'), '@', 1)
  );

  v_initials := UPPER(LEFT(regexp_replace(v_full_name, '[^A-Za-z]', '', 'g'), 2));
  IF LENGTH(v_initials) = 0 THEN
    v_initials := 'EC';
  END IF;

  INSERT INTO public.profiles (id, school_id, email, full_name, role, initials, user_code, subtitle)
  VALUES (
    NEW.id,
    v_school_id,
    COALESCE(NEW.email, NEW.id::text || '@greenwood.edu'),
    v_full_name,
    v_role,
    v_initials,
    NULLIF(TRIM(NEW.raw_app_meta_data ->> 'user_code'), ''),
    COALESCE(NULLIF(TRIM(NEW.raw_app_meta_data ->> 'subtitle'), ''), INITCAP(v_role::text))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.audit_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid;
  v_actor_label text;
  v_record_id text;
  v_module text;
  v_school_id uuid;
BEGIN
  v_actor_id := (SELECT auth.uid());
  v_module := COALESCE(TG_ARGV[0], TG_TABLE_NAME);

  IF v_actor_id IS NOT NULL THEN
    SELECT COALESCE(p.full_name || ' (' || p.role::text || ')', p.email)
    INTO v_actor_label
    FROM public.profiles p
    WHERE p.id = v_actor_id
    LIMIT 1;
  END IF;
  v_actor_label := COALESCE(v_actor_label, 'System / Service');

  IF TG_OP = 'DELETE' THEN
    v_record_id := COALESCE((to_jsonb(OLD) ->> 'id'), '');
    v_school_id := COALESCE(
      NULLIF(to_jsonb(OLD) ->> 'school_id', '')::uuid,
      private.current_school_id(),
      '11111111-1111-4111-8111-111111111111'::uuid
    );
    INSERT INTO public.audit_logs (school_id, actor_id, actor_label, module, action, table_name, record_id, old_data)
    VALUES (v_school_id, v_actor_id, v_actor_label, v_module, TG_OP, TG_TABLE_NAME, v_record_id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    v_record_id := COALESCE((to_jsonb(NEW) ->> 'id'), '');
    v_school_id := COALESCE(
      NULLIF(to_jsonb(NEW) ->> 'school_id', '')::uuid,
      private.current_school_id(),
      '11111111-1111-4111-8111-111111111111'::uuid
    );
    INSERT INTO public.audit_logs (school_id, actor_id, actor_label, module, action, table_name, record_id, old_data, new_data)
    VALUES (v_school_id, v_actor_id, v_actor_label, v_module, TG_OP, TG_TABLE_NAME, v_record_id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSE
    v_record_id := COALESCE((to_jsonb(NEW) ->> 'id'), '');
    v_school_id := COALESCE(
      NULLIF(to_jsonb(NEW) ->> 'school_id', '')::uuid,
      private.current_school_id(),
      '11111111-1111-4111-8111-111111111111'::uuid
    );
    INSERT INTO public.audit_logs (school_id, actor_id, actor_label, module, action, table_name, record_id, new_data)
    VALUES (v_school_id, v_actor_id, v_actor_label, v_module, TG_OP, TG_TABLE_NAME, v_record_id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$;

-- Step 4: Backfill existing rows cleanly into Demo School, enforce NOT NULL & add composite indexes
UPDATE public.profiles SET school_id = '11111111-1111-4111-8111-111111111111' WHERE school_id IS NULL;
UPDATE public.school_settings SET school_id = '11111111-1111-4111-8111-111111111111' WHERE school_id IS NULL;
UPDATE public.academic_years SET school_id = '11111111-1111-4111-8111-111111111111' WHERE school_id IS NULL;
UPDATE public.school_classes SET school_id = '11111111-1111-4111-8111-111111111111' WHERE school_id IS NULL;
UPDATE public.subjects SET school_id = '11111111-1111-4111-8111-111111111111' WHERE school_id IS NULL;
UPDATE public.class_subject_mappings SET school_id = '11111111-1111-4111-8111-111111111111' WHERE school_id IS NULL;
UPDATE public.rbac_roles SET school_id = '11111111-1111-4111-8111-111111111111' WHERE school_id IS NULL;
UPDATE public.rbac_permissions SET school_id = '11111111-1111-4111-8111-111111111111' WHERE school_id IS NULL;
UPDATE public.audit_logs SET school_id = '11111111-1111-4111-8111-111111111111' WHERE school_id IS NULL;

ALTER TABLE public.profiles ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE public.audit_logs ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE public.school_settings ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE public.academic_years ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE public.school_classes ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE public.subjects ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE public.class_subject_mappings ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE public.rbac_roles ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE public.rbac_permissions ALTER COLUMN school_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_school_role_status_idx ON public.profiles (school_id, role, status);
CREATE INDEX IF NOT EXISTS audit_logs_school_created_idx ON public.audit_logs (school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS school_settings_school_idx ON public.school_settings (school_id);
CREATE INDEX IF NOT EXISTS academic_years_school_status_idx ON public.academic_years (school_id, status);
CREATE INDEX IF NOT EXISTS school_classes_school_grade_idx ON public.school_classes (school_id, grade_order);
CREATE INDEX IF NOT EXISTS subjects_school_code_idx ON public.subjects (school_id, code);
CREATE INDEX IF NOT EXISTS csm_school_ay_class_idx ON public.class_subject_mappings (school_id, academic_year_id, class_id);
CREATE INDEX IF NOT EXISTS rbac_roles_school_name_idx ON public.rbac_roles (school_id, name);
CREATE INDEX IF NOT EXISTS rbac_permissions_school_role_idx ON public.rbac_permissions (school_id, role_id, module);

-- Step 5: Introspection RPC (restricted strictly to service_role)
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
  GROUP BY c.relname, c.relrowsecurity
  ORDER BY c.relname;
$$;

REVOKE ALL ON FUNCTION public.get_tenant_rls_audit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_tenant_rls_audit() TO service_role;

-- Step 6: Grants & Strict Tenant-Scoped RLS (using CREATE for new tables & ALTER POLICY for existing tables)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_sessions TO authenticated;

CREATE POLICY schools_select_scoped ON public.schools
  FOR SELECT TO authenticated
  USING ((SELECT private.is_super_admin()) OR id = (SELECT private.current_school_id()));
CREATE POLICY schools_insert_super_admin ON public.schools
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY schools_update_super_admin ON public.schools
  FOR UPDATE TO authenticated
  USING ((SELECT private.is_super_admin()))
  WITH CHECK ((SELECT private.is_super_admin()));
CREATE POLICY schools_delete_super_admin ON public.schools
  FOR DELETE TO authenticated
  USING ((SELECT private.is_super_admin()));

CREATE POLICY support_sessions_super_admin_all ON public.support_sessions
  FOR ALL TO authenticated
  USING ((SELECT private.is_super_admin()))
  WITH CHECK ((SELECT private.is_super_admin()));

ALTER POLICY profiles_select_own_or_admin ON public.profiles
  USING (
    (SELECT auth.uid()) = id
    OR (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()))
  );
ALTER POLICY profiles_insert_admin ON public.profiles
  WITH CHECK (
    school_id = (SELECT private.current_school_id())
    AND (SELECT private.is_admin())
    AND (SELECT private.school_allows_write())
    AND role <> 'super_admin'::public.user_role
  );
ALTER POLICY profiles_update_own_or_admin ON public.profiles
  USING (
    (((SELECT auth.uid()) = id AND deleted_at IS NULL) OR (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin())))
    AND (SELECT private.school_allows_write())
  )
  WITH CHECK (
    (((SELECT auth.uid()) = id AND deleted_at IS NULL) OR (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin())))
    AND (SELECT private.school_allows_write())
    AND role <> 'super_admin'::public.user_role
  );
ALTER POLICY profiles_delete_admin ON public.profiles
  USING (
    school_id = (SELECT private.current_school_id())
    AND (SELECT private.is_admin())
    AND (SELECT private.school_allows_write())
    AND role <> 'super_admin'::public.user_role
  );

ALTER POLICY audit_logs_select_admin ON public.audit_logs
  USING (
    (SELECT private.is_super_admin())
    OR (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()))
  );

ALTER POLICY school_settings_select_auth ON public.school_settings
  USING (school_id = (SELECT private.current_school_id()));
ALTER POLICY school_settings_insert_admin ON public.school_settings
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY school_settings_update_admin ON public.school_settings
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()))
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY school_settings_delete_admin ON public.school_settings
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));

ALTER POLICY academic_years_select_auth ON public.academic_years
  USING (school_id = (SELECT private.current_school_id()) AND (deleted_at IS NULL OR (SELECT private.is_admin())));
ALTER POLICY academic_years_insert_admin ON public.academic_years
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY academic_years_update_admin ON public.academic_years
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()))
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY academic_years_delete_admin ON public.academic_years
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));

ALTER POLICY school_classes_select_auth ON public.school_classes
  USING (school_id = (SELECT private.current_school_id()) AND (deleted_at IS NULL OR (SELECT private.is_admin())));
ALTER POLICY school_classes_insert_admin ON public.school_classes
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY school_classes_update_admin ON public.school_classes
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()))
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY school_classes_delete_admin ON public.school_classes
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));

ALTER POLICY subjects_select_auth ON public.subjects
  USING (school_id = (SELECT private.current_school_id()) AND (deleted_at IS NULL OR (SELECT private.is_admin())));
ALTER POLICY subjects_insert_admin ON public.subjects
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY subjects_update_admin ON public.subjects
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()))
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY subjects_delete_admin ON public.subjects
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));

ALTER POLICY csm_select_auth ON public.class_subject_mappings
  USING (school_id = (SELECT private.current_school_id()));
ALTER POLICY csm_insert_admin ON public.class_subject_mappings
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY csm_update_admin ON public.class_subject_mappings
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()))
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY csm_delete_admin ON public.class_subject_mappings
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));

ALTER POLICY rbac_roles_select_staff_admin ON public.rbac_roles
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_staff_or_admin()));
ALTER POLICY rbac_roles_insert_admin ON public.rbac_roles
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY rbac_roles_update_admin ON public.rbac_roles
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()))
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY rbac_roles_delete_admin ON public.rbac_roles
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));

ALTER POLICY rbac_permissions_select_staff_admin ON public.rbac_permissions
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_staff_or_admin()));
ALTER POLICY rbac_permissions_insert_admin ON public.rbac_permissions
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY rbac_permissions_update_admin ON public.rbac_permissions
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()))
  WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));
ALTER POLICY rbac_permissions_delete_admin ON public.rbac_permissions
  USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()));

ALTER POLICY storage_objects_select_scoped ON storage.objects
  USING (
    (storage.foldername(name))[1] = (SELECT private.current_school_id())::text
    AND (
      (
        bucket_id IN ('avatars', 'documents')
        AND ((storage.foldername(name))[2] = (SELECT auth.uid())::text OR (SELECT private.is_admin()))
      )
      OR (bucket_id = 'study-material')
      OR (
        bucket_id = 'receipts'
        AND ((storage.foldername(name))[2] = (SELECT auth.uid())::text OR (SELECT private.is_staff_or_admin()))
      )
    )
  );

ALTER POLICY storage_objects_insert_scoped ON storage.objects
  WITH CHECK (
    (storage.foldername(name))[1] = (SELECT private.current_school_id())::text
    AND (SELECT private.school_allows_write())
    AND (
      (
        bucket_id = 'avatars'
        AND ((storage.foldername(name))[2] = (SELECT auth.uid())::text OR (SELECT private.is_admin()))
      )
      OR (bucket_id = 'documents' AND (SELECT private.is_admin()))
      OR (
        bucket_id = 'study-material'
        AND (SELECT private.current_role()) IN ('school_admin'::public.user_role, 'admin'::public.user_role, 'principal'::public.user_role, 'teacher'::public.user_role)
      )
      OR (bucket_id = 'receipts' AND (SELECT private.is_staff_or_admin()))
    )
  );

ALTER POLICY storage_objects_update_scoped ON storage.objects
  USING (
    (storage.foldername(name))[1] = (SELECT private.current_school_id())::text
    AND (SELECT private.school_allows_write())
    AND (
      (
        bucket_id = 'avatars'
        AND ((storage.foldername(name))[2] = (SELECT auth.uid())::text OR (SELECT private.is_admin()))
      )
      OR (bucket_id = 'documents' AND (SELECT private.is_admin()))
      OR (
        bucket_id = 'study-material'
        AND (SELECT private.current_role()) IN ('school_admin'::public.user_role, 'admin'::public.user_role, 'principal'::public.user_role, 'teacher'::public.user_role)
      )
      OR (bucket_id = 'receipts' AND (SELECT private.is_staff_or_admin()))
    )
  )
  WITH CHECK (
    (storage.foldername(name))[1] = (SELECT private.current_school_id())::text
    AND (SELECT private.school_allows_write())
  );

ALTER POLICY storage_objects_delete_scoped ON storage.objects
  USING (
    (storage.foldername(name))[1] = (SELECT private.current_school_id())::text
    AND (SELECT private.school_allows_write())
    AND (
      (
        bucket_id = 'avatars'
        AND ((storage.foldername(name))[2] = (SELECT auth.uid())::text OR (SELECT private.is_admin()))
      )
      OR (bucket_id = 'documents' AND (SELECT private.is_admin()))
      OR (
        bucket_id = 'study-material'
        AND (SELECT private.current_role()) IN ('school_admin'::public.user_role, 'admin'::public.user_role, 'principal'::public.user_role, 'teacher'::public.user_role)
      )
      OR (bucket_id = 'receipts' AND (SELECT private.is_staff_or_admin()))
    )
  );;
