-- Module 1: Auth, Profiles, Role Helpers, Audit Logs & Private Storage Buckets

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.user_role AS ENUM ('admin', 'teacher', 'student', 'parent', 'staff');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.account_status AS ENUM ('Active', 'Suspended');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_code text UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  role public.user_role NOT NULL DEFAULT 'student',
  subtitle text NOT NULL DEFAULT '',
  initials text NOT NULL DEFAULT 'EC',
  avatar_path text,
  preferred_language text NOT NULL DEFAULT 'en-IN',
  two_factor_enabled boolean NOT NULL DEFAULT false,
  must_change_password boolean NOT NULL DEFAULT false,
  security_question text,
  security_answer_hash text,
  status public.account_status NOT NULL DEFAULT 'Active',
  last_login_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles (status);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
CREATE INDEX IF NOT EXISTS profiles_user_code_idx ON public.profiles (user_code);
CREATE INDEX IF NOT EXISTS profiles_active_idx ON public.profiles (id) WHERE deleted_at IS NULL;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_label text NOT NULL,
  module text NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address text NOT NULL DEFAULT 'server',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_module_idx ON public.audit_logs (module);
CREATE INDEX IF NOT EXISTS audit_logs_table_name_idx ON public.audit_logs (table_name);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security-definer helper functions in private schema with fixed search_path
CREATE OR REPLACE FUNCTION private.current_user_role()
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

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(private.current_user_role() = 'admin'::public.user_role, false);
$$;

CREATE OR REPLACE FUNCTION private.is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    private.current_user_role() IN ('admin'::public.user_role, 'staff'::public.user_role),
    false
  );
$$;

REVOKE ALL ON FUNCTION private.current_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.current_user_role() TO authenticated;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

REVOKE ALL ON FUNCTION private.is_staff_or_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_staff_or_admin() TO authenticated;

-- Timestamp & role integrity triggers
CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.prevent_self_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NOT NULL AND NOT private.is_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.user_code IS DISTINCT FROM OLD.user_code
       OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
      RAISE EXCEPTION 'Only administrators may modify role, status, user_code, or deletion state'
        USING ERRCODE = '42501';
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
    jsonb_build_object('role', NEW.role::text, 'status', NEW.status::text)
  WHERE id = NEW.id
    AND (
      raw_app_meta_data ->> 'role' IS DISTINCT FROM NEW.role::text
      OR raw_app_meta_data ->> 'status' IS DISTINCT FROM NEW.status::text
    );
  RETURN NEW;
END;
$$;

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
BEGIN
  v_role_text := NEW.raw_app_meta_data ->> 'role';
  IF v_role_text IN ('admin', 'teacher', 'student', 'parent', 'staff') THEN
    v_role := v_role_text::public.user_role;
  ELSE
    v_role := 'student'::public.user_role;
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

  INSERT INTO public.profiles (id, email, full_name, role, initials, user_code, subtitle)
  VALUES (
    NEW.id,
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
    INSERT INTO public.audit_logs (actor_id, actor_label, module, action, table_name, record_id, old_data)
    VALUES (v_actor_id, v_actor_label, v_module, TG_OP, TG_TABLE_NAME, v_record_id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    v_record_id := COALESCE((to_jsonb(NEW) ->> 'id'), '');
    INSERT INTO public.audit_logs (actor_id, actor_label, module, action, table_name, record_id, old_data, new_data)
    VALUES (v_actor_id, v_actor_label, v_module, TG_OP, TG_TABLE_NAME, v_record_id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSE
    v_record_id := COALESCE((to_jsonb(NEW) ->> 'id'), '');
    INSERT INTO public.audit_logs (actor_id, actor_label, module, action, table_name, record_id, new_data)
    VALUES (v_actor_id, v_actor_label, v_module, TG_OP, TG_TABLE_NAME, v_record_id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE TRIGGER profiles_prevent_self_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.prevent_self_role_escalation();

CREATE OR REPLACE TRIGGER profiles_sync_role_to_auth
  AFTER INSERT OR UPDATE OF role, status ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.sync_role_to_auth_app_metadata();

CREATE OR REPLACE TRIGGER profiles_audit_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.audit_row_change('Users');

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_auth_user();

-- RLS Policies for public.profiles (single permissive policy per command)
CREATE POLICY profiles_select_own_or_admin
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id OR (SELECT private.is_admin()));

CREATE POLICY profiles_insert_admin
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY profiles_update_own_or_admin
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (((SELECT auth.uid()) = id AND deleted_at IS NULL) OR (SELECT private.is_admin()))
  WITH CHECK (((SELECT auth.uid()) = id AND deleted_at IS NULL) OR (SELECT private.is_admin()));

CREATE POLICY profiles_delete_admin
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING ((SELECT private.is_admin()));

-- RLS Policies for public.audit_logs (Admin read only; writes via triggers/service_role)
CREATE POLICY audit_logs_select_admin
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

-- Private Storage Buckets (never public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg']),
  ('avatars', 'avatars', false, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('study-material', 'study-material', false, 26214400, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'text/plain']),
  ('receipts', 'receipts', false, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies on storage.objects (scoped per bucket + action to avoid duplicate permissive policies)
CREATE POLICY storage_objects_select_scoped
  ON storage.objects FOR SELECT TO authenticated
  USING (
    (
      bucket_id = 'avatars'
      AND ((storage.foldername(name))[1] = (SELECT auth.uid())::text OR (SELECT private.is_admin()))
    )
    OR (
      bucket_id = 'documents'
      AND ((storage.foldername(name))[1] = (SELECT auth.uid())::text OR (SELECT private.is_admin()))
    )
    OR (
      bucket_id = 'study-material'
    )
    OR (
      bucket_id = 'receipts'
      AND ((storage.foldername(name))[1] = (SELECT auth.uid())::text OR (SELECT private.is_staff_or_admin()))
    )
  );

CREATE POLICY storage_objects_insert_scoped
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    (
      bucket_id = 'avatars'
      AND ((storage.foldername(name))[1] = (SELECT auth.uid())::text OR (SELECT private.is_admin()))
    )
    OR (
      bucket_id = 'documents'
      AND (SELECT private.is_admin())
    )
    OR (
      bucket_id = 'study-material'
      AND (SELECT private.current_user_role()) IN ('admin'::public.user_role, 'teacher'::public.user_role)
    )
    OR (
      bucket_id = 'receipts'
      AND (SELECT private.is_staff_or_admin())
    )
  );

CREATE POLICY storage_objects_update_scoped
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    (
      bucket_id = 'avatars'
      AND ((storage.foldername(name))[1] = (SELECT auth.uid())::text OR (SELECT private.is_admin()))
    )
    OR (
      bucket_id = 'documents'
      AND (SELECT private.is_admin())
    )
    OR (
      bucket_id = 'study-material'
      AND (SELECT private.current_user_role()) IN ('admin'::public.user_role, 'teacher'::public.user_role)
    )
    OR (
      bucket_id = 'receipts'
      AND (SELECT private.is_staff_or_admin())
    )
  )
  WITH CHECK (
    (
      bucket_id = 'avatars'
      AND ((storage.foldername(name))[1] = (SELECT auth.uid())::text OR (SELECT private.is_admin()))
    )
    OR (
      bucket_id = 'documents'
      AND (SELECT private.is_admin())
    )
    OR (
      bucket_id = 'study-material'
      AND (SELECT private.current_user_role()) IN ('admin'::public.user_role, 'teacher'::public.user_role)
    )
    OR (
      bucket_id = 'receipts'
      AND (SELECT private.is_staff_or_admin())
    )
  );

CREATE POLICY storage_objects_delete_scoped
  ON storage.objects FOR DELETE TO authenticated
  USING (
    (
      bucket_id = 'avatars'
      AND ((storage.foldername(name))[1] = (SELECT auth.uid())::text OR (SELECT private.is_admin()))
    )
    OR (
      bucket_id = 'documents'
      AND (SELECT private.is_admin())
    )
    OR (
      bucket_id = 'study-material'
      AND (SELECT private.current_user_role()) IN ('admin'::public.user_role, 'teacher'::public.user_role)
    )
    OR (
      bucket_id = 'receipts'
      AND (SELECT private.is_staff_or_admin())
    )
  );
