-- Module 2: School Setup (School Profile, Academic Years, Classes, Subjects, Mappings, RBAC)

CREATE TABLE IF NOT EXISTS public.school_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key text NOT NULL UNIQUE DEFAULT 'default',
  school_name text NOT NULL,
  affiliation_code text NOT NULL,
  principal_name text NOT NULL,
  official_email text NOT NULL,
  phone text NOT NULL,
  timezone_currency text NOT NULL,
  address text NOT NULL,
  grading_mode text NOT NULL,
  logo_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  start_label text NOT NULL,
  end_label text NOT NULL,
  students_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Active', 'Upcoming', 'Archived')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS academic_years_status_idx ON public.academic_years (status);
CREATE INDEX IF NOT EXISTS academic_years_active_idx ON public.academic_years (id) WHERE deleted_at IS NULL;

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.school_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  grade_order integer NOT NULL CHECK (grade_order BETWEEN 1 AND 12),
  wing text NOT NULL,
  sections text[] NOT NULL DEFAULT ARRAY['A'],
  class_teachers text NOT NULL DEFAULT '',
  strength integer NOT NULL DEFAULT 0,
  capacity integer NOT NULL DEFAULT 40,
  room_block text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS school_classes_grade_order_idx ON public.school_classes (grade_order);
CREATE INDEX IF NOT EXISTS school_classes_wing_idx ON public.school_classes (wing);
CREATE INDEX IF NOT EXISTS school_classes_status_idx ON public.school_classes (status);

ALTER TABLE public.school_classes ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  max_theory integer NOT NULL DEFAULT 80,
  max_practical integer NOT NULL DEFAULT 20,
  periods_per_week integer NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subjects_category_idx ON public.subjects (category);
CREATE INDEX IF NOT EXISTS subjects_status_idx ON public.subjects (status);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.class_subject_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  periods_per_week integer NOT NULL DEFAULT 5,
  is_mandatory boolean NOT NULL DEFAULT true,
  mapped boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, class_id, subject_id)
);

CREATE INDEX IF NOT EXISTS csm_academic_year_idx ON public.class_subject_mappings (academic_year_id);
CREATE INDEX IF NOT EXISTS csm_class_id_idx ON public.class_subject_mappings (class_id);
CREATE INDEX IF NOT EXISTS csm_subject_id_idx ON public.class_subject_mappings (subject_id);

ALTER TABLE public.class_subject_mappings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.rbac_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rbac_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.rbac_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.rbac_roles(id) ON DELETE CASCADE,
  module text NOT NULL,
  can_view boolean NOT NULL DEFAULT false,
  can_create boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  can_export boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, module)
);

CREATE INDEX IF NOT EXISTS rbac_permissions_role_id_idx ON public.rbac_permissions (role_id);

ALTER TABLE public.rbac_permissions ENABLE ROW LEVEL SECURITY;

-- Grants for authenticated API role (RLS restricts rows)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_years TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_classes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_subject_mappings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rbac_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rbac_permissions TO authenticated;

-- Updated-at & Audit Triggers
CREATE OR REPLACE TRIGGER school_settings_set_updated_at
  BEFORE UPDATE ON public.school_settings
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE TRIGGER academic_years_set_updated_at
  BEFORE UPDATE ON public.academic_years
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE TRIGGER school_classes_set_updated_at
  BEFORE UPDATE ON public.school_classes
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE TRIGGER subjects_set_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE TRIGGER csm_set_updated_at
  BEFORE UPDATE ON public.class_subject_mappings
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE TRIGGER rbac_roles_set_updated_at
  BEFORE UPDATE ON public.rbac_roles
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE TRIGGER rbac_permissions_set_updated_at
  BEFORE UPDATE ON public.rbac_permissions
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE TRIGGER rbac_roles_audit_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.rbac_roles
  FOR EACH ROW EXECUTE FUNCTION private.audit_row_change('RBAC');

CREATE OR REPLACE TRIGGER rbac_permissions_audit_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.rbac_permissions
  FOR EACH ROW EXECUTE FUNCTION private.audit_row_change('RBAC');

-- RLS Policies (default deny; single permissive policy per command)
CREATE POLICY school_settings_select_auth ON public.school_settings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY school_settings_insert_admin ON public.school_settings
  FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY school_settings_update_admin ON public.school_settings
  FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY school_settings_delete_admin ON public.school_settings
  FOR DELETE TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY academic_years_select_auth ON public.academic_years
  FOR SELECT TO authenticated USING (deleted_at IS NULL OR (SELECT private.is_admin()));
CREATE POLICY academic_years_insert_admin ON public.academic_years
  FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY academic_years_update_admin ON public.academic_years
  FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY academic_years_delete_admin ON public.academic_years
  FOR DELETE TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY school_classes_select_auth ON public.school_classes
  FOR SELECT TO authenticated USING (deleted_at IS NULL OR (SELECT private.is_admin()));
CREATE POLICY school_classes_insert_admin ON public.school_classes
  FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY school_classes_update_admin ON public.school_classes
  FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY school_classes_delete_admin ON public.school_classes
  FOR DELETE TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY subjects_select_auth ON public.subjects
  FOR SELECT TO authenticated USING (deleted_at IS NULL OR (SELECT private.is_admin()));
CREATE POLICY subjects_insert_admin ON public.subjects
  FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY subjects_update_admin ON public.subjects
  FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY subjects_delete_admin ON public.subjects
  FOR DELETE TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY csm_select_auth ON public.class_subject_mappings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY csm_insert_admin ON public.class_subject_mappings
  FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY csm_update_admin ON public.class_subject_mappings
  FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY csm_delete_admin ON public.class_subject_mappings
  FOR DELETE TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY rbac_roles_select_staff_admin ON public.rbac_roles
  FOR SELECT TO authenticated USING ((SELECT private.is_staff_or_admin()));
CREATE POLICY rbac_roles_insert_admin ON public.rbac_roles
  FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY rbac_roles_update_admin ON public.rbac_roles
  FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY rbac_roles_delete_admin ON public.rbac_roles
  FOR DELETE TO authenticated USING ((SELECT private.is_admin()));

CREATE POLICY rbac_permissions_select_staff_admin ON public.rbac_permissions
  FOR SELECT TO authenticated USING ((SELECT private.is_staff_or_admin()));
CREATE POLICY rbac_permissions_insert_admin ON public.rbac_permissions
  FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY rbac_permissions_update_admin ON public.rbac_permissions
  FOR UPDATE TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY rbac_permissions_delete_admin ON public.rbac_permissions
  FOR DELETE TO authenticated USING ((SELECT private.is_admin()));
