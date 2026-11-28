-- Section C (Onboarding, Flexible Sections, Bulk Import) + D3 (Students, Guardians, Admissions) + D4 (Teachers & Staff)

CREATE TABLE IF NOT EXISTS public.school_onboarding (
  school_id uuid PRIMARY KEY REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_done boolean NOT NULL DEFAULT false,
  academic_year_done boolean NOT NULL DEFAULT false,
  classes_sections_done boolean NOT NULL DEFAULT false,
  subjects_done boolean NOT NULL DEFAULT false,
  fee_structure_done boolean NOT NULL DEFAULT false,
  teachers_imported_done boolean NOT NULL DEFAULT false,
  students_imported_done boolean NOT NULL DEFAULT false,
  parents_invited_done boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.school_onboarding (school_id, profile_done, academic_year_done, classes_sections_done, subjects_done)
VALUES ('11111111-1111-4111-8111-111111111111', true, true, true, true)
ON CONFLICT (school_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  employee_code text NOT NULL,
  full_name text NOT NULL,
  category text NOT NULL DEFAULT 'Teacher' CHECK (category IN ('Teacher', 'Staff')),
  sub_role text,
  department text NOT NULL DEFAULT 'General',
  designation text NOT NULL DEFAULT 'Faculty',
  qualification text NOT NULL DEFAULT '',
  experience_years integer NOT NULL DEFAULT 0,
  joining_date date NOT NULL DEFAULT CURRENT_DATE,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  base_salary_inr numeric(12,2) NOT NULL DEFAULT 0,
  allowances_inr numeric(12,2) NOT NULL DEFAULT 0,
  deductions_inr numeric(12,2) NOT NULL DEFAULT 0,
  leave_balance_days integer NOT NULL DEFAULT 12,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Inactive')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS staff_members_school_emp_uniq ON public.staff_members (school_id, employee_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS staff_members_school_cat_idx ON public.staff_members (school_id, category, status);

CREATE TABLE IF NOT EXISTS public.school_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  section_name text NOT NULL,
  capacity integer NOT NULL DEFAULT 40,
  room_no text NOT NULL DEFAULT '',
  class_teacher_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS school_sections_uniq ON public.school_sections (school_id, academic_year_id, class_id, section_name);
CREATE INDEX IF NOT EXISTS school_sections_school_class_idx ON public.school_sections (school_id, class_id);

CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  admission_no text NOT NULL,
  roll_no text NOT NULL DEFAULT '',
  full_name text NOT NULL,
  gender text NOT NULL DEFAULT 'Unspecified' CHECK (gender IN ('Male', 'Female', 'Other', 'Unspecified')),
  dob date,
  blood_group text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  admission_date date NOT NULL DEFAULT CURRENT_DATE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.school_classes(id) ON DELETE SET NULL,
  section_name text NOT NULL DEFAULT 'A',
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Alumni', 'Transferred', 'Detained', 'Inactive')),
  photo_path text,
  address text NOT NULL DEFAULT '',
  medical_notes text NOT NULL DEFAULT '',
  emergency_contact text NOT NULL DEFAULT '',
  previous_school text NOT NULL DEFAULT '',
  fee_balance_inr numeric(12,2) NOT NULL DEFAULT 0,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS students_school_adm_uniq ON public.students (school_id, admission_no) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS students_school_class_idx ON public.students (school_id, class_id, section_name, status);
CREATE INDEX IF NOT EXISTS students_school_name_idx ON public.students (school_id, full_name);

CREATE TABLE IF NOT EXISTS public.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  relation text NOT NULL DEFAULT 'Father',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  occupation text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  consent_sms boolean NOT NULL DEFAULT true,
  consent_whatsapp boolean NOT NULL DEFAULT true,
  consent_photos boolean NOT NULL DEFAULT true,
  consent_medical boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS guardians_school_phone_idx ON public.guardians (school_id, phone);
CREATE INDEX IF NOT EXISTS guardians_school_email_idx ON public.guardians (school_id, email);

CREATE TABLE IF NOT EXISTS public.parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  guardian_id uuid NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT true,
  sibling_group_key text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS parent_students_uniq ON public.parent_students (school_id, guardian_id, student_id);
CREATE INDEX IF NOT EXISTS parent_students_student_idx ON public.parent_students (school_id, student_id);

CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.school_classes(id) ON DELETE SET NULL,
  section_name text NOT NULL DEFAULT 'A',
  roll_no text NOT NULL DEFAULT '',
  promotion_status text NOT NULL DEFAULT 'Active' CHECK (promotion_status IN ('Active', 'Promoted', 'Detained', 'Transferred')),
  carried_fee_balance_inr numeric(12,2) NOT NULL DEFAULT 0,
  is_read_only boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS student_enrollments_uniq ON public.student_enrollments (school_id, student_id, academic_year_id);
CREATE INDEX IF NOT EXISTS student_enrollments_school_ay_idx ON public.student_enrollments (school_id, academic_year_id, class_id);

CREATE TABLE IF NOT EXISTS public.admission_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  enquiry_no text NOT NULL,
  applicant_name text NOT NULL,
  parent_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL DEFAULT '',
  applying_grade text NOT NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'Online Portal',
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Assessment Scheduled', 'Approved', 'Rejected', 'Enrolled')),
  notes text NOT NULL DEFAULT '',
  follow_up_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admission_enquiries_school_status_idx ON public.admission_enquiries (school_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.student_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS student_documents_school_stu_idx ON public.student_documents (school_id, student_id);

CREATE TABLE IF NOT EXISTS public.student_remarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  category text NOT NULL DEFAULT 'Academic' CHECK (category IN ('Academic', 'Discipline', 'Achievement', 'Medical')),
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS student_remarks_school_stu_idx ON public.student_remarks (school_id, student_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  teacher_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  section_name text NOT NULL DEFAULT 'A',
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  is_class_teacher boolean NOT NULL DEFAULT false,
  periods_per_week integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS teacher_assignments_school_idx ON public.teacher_assignments (school_id, teacher_id, class_id);

CREATE TABLE IF NOT EXISTS public.staff_leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  leave_type text NOT NULL DEFAULT 'Casual Leave',
  from_date date NOT NULL,
  to_date date NOT NULL,
  days_count integer NOT NULL DEFAULT 1,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS staff_leave_requests_school_idx ON public.staff_leave_requests (school_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.payroll_slips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  month_label text NOT NULL,
  gross_inr numeric(12,2) NOT NULL DEFAULT 0,
  deductions_inr numeric(12,2) NOT NULL DEFAULT 0,
  net_inr numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Processed', 'Paid')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS payroll_slips_uniq ON public.payroll_slips (school_id, staff_id, month_label);

CREATE TABLE IF NOT EXISTS public.bulk_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('students', 'guardians', 'teachers', 'staff', 'fees')),
  file_name text NOT NULL,
  idempotency_hash text NOT NULL,
  total_rows integer NOT NULL DEFAULT 0,
  created_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  row_errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bulk_import_jobs_school_idx ON public.bulk_import_jobs (school_id, created_at DESC);

-- Triggers
CREATE OR REPLACE TRIGGER school_onboarding_upd BEFORE UPDATE ON public.school_onboarding FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER school_sections_upd BEFORE UPDATE ON public.school_sections FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER staff_members_upd BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER students_upd BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER guardians_upd BEFORE UPDATE ON public.guardians FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER student_enrollments_upd BEFORE UPDATE ON public.student_enrollments FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER admission_enquiries_upd BEFORE UPDATE ON public.admission_enquiries FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER staff_leave_requests_upd BEFORE UPDATE ON public.staff_leave_requests FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE TRIGGER students_audit AFTER INSERT OR UPDATE OR DELETE ON public.students FOR EACH ROW EXECUTE FUNCTION private.audit_row_change('students');
CREATE OR REPLACE TRIGGER staff_members_audit AFTER INSERT OR UPDATE OR DELETE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION private.audit_row_change('staff');
CREATE OR REPLACE TRIGGER admission_enquiries_audit AFTER INSERT OR UPDATE OR DELETE ON public.admission_enquiries FOR EACH ROW EXECUTE FUNCTION private.audit_row_change('admissions');

-- Enable RLS + Grants + Policies on all 14 new tables
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'school_onboarding','school_sections','staff_members','students','guardians',
    'parent_students','student_enrollments','admission_enquiries','student_documents',
    'student_remarks','teacher_assignments','staff_leave_requests','payroll_slips','bulk_import_jobs'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (school_id = (SELECT private.current_school_id()))',
      t || '_tenant_select', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (school_id = (SELECT private.current_school_id()) AND ((SELECT private.is_admin()) OR (SELECT private.is_staff_or_admin())) AND (SELECT private.school_allows_write()))',
      t || '_tenant_insert', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (school_id = (SELECT private.current_school_id()) AND ((SELECT private.is_admin()) OR (SELECT private.is_staff_or_admin())) AND (SELECT private.school_allows_write())) WITH CHECK (school_id = (SELECT private.current_school_id()) AND ((SELECT private.is_admin()) OR (SELECT private.is_staff_or_admin())) AND (SELECT private.school_allows_write()))',
      t || '_tenant_update', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()) AND (SELECT private.school_allows_write()))',
      t || '_tenant_delete', t
    );
  END LOOP;
END;
$$;
;
