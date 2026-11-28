-- D5 Attendance & Timetable, D6 Exams/Marks/QR, D7 Fees/Receipts/Refunds, D8 Communication, D9 LMS, D11 Library/Transport/Hostel, D12 Inventory/Certificates

CREATE TABLE IF NOT EXISTS public.student_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  class_id uuid NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  section_name text NOT NULL DEFAULT 'A',
  attendance_date date NOT NULL,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')),
  remarks text NOT NULL DEFAULT '',
  marked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  locked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS student_attendance_uniq ON public.student_attendance (school_id, student_id, attendance_date);
CREATE INDEX IF NOT EXISTS student_attendance_school_date_idx ON public.student_attendance (school_id, attendance_date, class_id, section_name);

CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  staff_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'On Leave')),
  check_in_time text NOT NULL DEFAULT '08:15 AM',
  marked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS staff_attendance_uniq ON public.staff_attendance (school_id, staff_id, attendance_date);
CREATE INDEX IF NOT EXISTS staff_attendance_school_date_idx ON public.staff_attendance (school_id, attendance_date);

CREATE TABLE IF NOT EXISTS public.timetable_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  class_id uuid NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  section_name text NOT NULL DEFAULT 'A',
  day_of_week text NOT NULL CHECK (day_of_week IN ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat')),
  period_number integer NOT NULL CHECK (period_number BETWEEN 1 AND 12),
  start_time text NOT NULL,
  end_time text NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  room_no text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS timetable_slots_class_uniq ON public.timetable_slots (school_id, class_id, section_name, day_of_week, period_number);
CREATE INDEX IF NOT EXISTS timetable_slots_school_teacher_idx ON public.timetable_slots (school_id, teacher_id, day_of_week, period_number);

CREATE TABLE IF NOT EXISTS public.timetable_substitutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  slot_id uuid NOT NULL REFERENCES public.timetable_slots(id) ON DELETE CASCADE,
  sub_date date NOT NULL,
  original_teacher_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  substitute_teacher_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  reason text NOT NULL DEFAULT 'Leave / Duty',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS timetable_subs_school_date_idx ON public.timetable_substitutions (school_id, sub_date);

-- D6: Exams, Terms, Grade Scales, Marks & QR Report Cards
CREATE TABLE IF NOT EXISTS public.grade_scales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  grade text NOT NULL,
  min_percent numeric(5,2) NOT NULL,
  max_percent numeric(5,2) NOT NULL,
  grade_point numeric(4,2) NOT NULL DEFAULT 0,
  remark text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS grade_scales_school_idx ON public.grade_scales (school_id, min_percent DESC);

CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  name text NOT NULL,
  term_name text NOT NULL DEFAULT 'Term 1',
  weightage_pct numeric(5,2) NOT NULL DEFAULT 100,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL DEFAULT (CURRENT_DATE + 14),
  status text NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Draft', 'Scheduled', 'Ongoing', 'Published')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS exams_school_status_idx ON public.exams (school_id, status, start_date DESC);

CREATE TABLE IF NOT EXISTS public.exam_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_date date NOT NULL,
  start_time text NOT NULL DEFAULT '09:00 AM',
  max_marks numeric(6,2) NOT NULL DEFAULT 100,
  room_no text NOT NULL DEFAULT 'Hall A',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS exam_schedules_school_exam_idx ON public.exam_schedules (school_id, exam_id, class_id);

CREATE TABLE IF NOT EXISTS public.exam_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  theory_marks numeric(6,2) NOT NULL DEFAULT 0,
  practical_marks numeric(6,2) NOT NULL DEFAULT 0,
  max_marks numeric(6,2) NOT NULL DEFAULT 100,
  grade text NOT NULL DEFAULT 'A1',
  is_absent boolean NOT NULL DEFAULT false,
  is_locked boolean NOT NULL DEFAULT false,
  unlocked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  unlock_reason text,
  entered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS exam_marks_uniq ON public.exam_marks (school_id, exam_id, student_id, subject_id);
CREATE INDEX IF NOT EXISTS exam_marks_school_stu_idx ON public.exam_marks (school_id, student_id, exam_id);

CREATE TABLE IF NOT EXISTS public.qr_verification_tokens (
  token uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  doc_type text NOT NULL CHECK (doc_type IN ('report_card', 'id_card', 'certificate', 'tc')),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  reference_code text NOT NULL,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS qr_tokens_school_stu_idx ON public.qr_verification_tokens (school_id, student_id);

-- D7: Fees, Installments, Concessions, Gapless Receipts & Refunds
CREATE TABLE IF NOT EXISTS public.fee_heads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  frequency text NOT NULL DEFAULT 'Quarterly' CHECK (frequency IN ('Monthly', 'Quarterly', 'Annual', 'One-Time')),
  is_refundable boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS fee_heads_uniq ON public.fee_heads (school_id, code);

CREATE TABLE IF NOT EXISTS public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  class_id uuid NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  fee_head_id uuid NOT NULL REFERENCES public.fee_heads(id) ON DELETE CASCADE,
  amount_inr numeric(12,2) NOT NULL CHECK (amount_inr >= 0),
  due_date date NOT NULL DEFAULT CURRENT_DATE,
  late_fee_per_day_inr numeric(8,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fee_structures_school_cls_idx ON public.fee_structures (school_id, class_id);

CREATE TABLE IF NOT EXISTS public.fee_concessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  title text NOT NULL,
  concession_type text NOT NULL CHECK (concession_type IN ('percent', 'amount')),
  concession_value numeric(12,2) NOT NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Revoked')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fee_concessions_school_stu_idx ON public.fee_concessions (school_id, student_id);

CREATE TABLE IF NOT EXISTS public.fee_receipt_sequences (
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  financial_year text NOT NULL,
  last_number integer NOT NULL DEFAULT 0,
  PRIMARY KEY (school_id, financial_year)
);

CREATE TABLE IF NOT EXISTS public.fee_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  receipt_number text NOT NULL,
  financial_year text NOT NULL,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  amount_inr numeric(12,2) NOT NULL CHECK (amount_inr > 0),
  concession_inr numeric(12,2) NOT NULL DEFAULT 0,
  late_fee_inr numeric(12,2) NOT NULL DEFAULT 0,
  payment_mode text NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'OnlineStub')),
  reference_no text NOT NULL DEFAULT '',
  breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  collected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS fee_receipts_school_num_uniq ON public.fee_receipts (school_id, receipt_number);
CREATE INDEX IF NOT EXISTS fee_receipts_school_stu_idx ON public.fee_receipts (school_id, student_id, paid_at DESC);

CREATE TABLE IF NOT EXISTS public.fee_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  receipt_id uuid NOT NULL REFERENCES public.fee_receipts(id) ON DELETE RESTRICT,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  amount_inr numeric(12,2) NOT NULL CHECK (amount_inr > 0),
  reason text NOT NULL,
  refunded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  refunded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fee_refunds_school_idx ON public.fee_refunds (school_id, refunded_at DESC);

CREATE OR REPLACE FUNCTION public.next_fee_receipt_number(p_school_id uuid, p_fy text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_code text;
  v_next integer;
BEGIN
  SELECT s.school_code INTO v_code FROM public.schools s WHERE s.id = p_school_id;
  v_code := COALESCE(v_code, 'SCH');

  INSERT INTO public.fee_receipt_sequences (school_id, financial_year, last_number)
  VALUES (p_school_id, p_fy, 1)
  ON CONFLICT (school_id, financial_year)
  DO UPDATE SET last_number = public.fee_receipt_sequences.last_number + 1
  RETURNING last_number INTO v_next;

  RETURN 'RCP-' || v_code || '-' || p_fy || '-' || LPAD(v_next::text, 4, '0');
END;
$$;
REVOKE ALL ON FUNCTION public.next_fee_receipt_number(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_fee_receipt_number(uuid, text) TO service_role;

-- D8: Communication (Notices, Events, Complaints, Messages, Notifications & Delivery Log)
CREATE TABLE IF NOT EXISTS public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  target_roles text[] NOT NULL DEFAULT ARRAY['admin', 'teacher', 'student', 'parent'],
  target_class_id uuid REFERENCES public.school_classes(id) ON DELETE SET NULL,
  is_public boolean NOT NULL DEFAULT false,
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notices_school_pub_idx ON public.notices (school_id, published_at DESC);

CREATE TABLE IF NOT EXISTS public.campus_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Academic',
  event_date date NOT NULL,
  location text NOT NULL DEFAULT 'Main Auditorium',
  description text NOT NULL DEFAULT '',
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS campus_events_school_date_idx ON public.campus_events (school_id, event_date);

CREATE TABLE IF NOT EXISTS public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  submitter_name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  subject text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Review', 'Resolved')),
  resolution_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS complaints_school_status_idx ON public.complaints (school_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name text NOT NULL,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_school_rec_idx ON public.messages (school_id, recipient_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'System',
  href text NOT NULL DEFAULT '/notifications',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_school_user_idx ON public.notifications (school_id, user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS public.communication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('Email', 'SMS', 'WhatsApp', 'In-App')),
  recipient text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'Queued' CHECK (status IN ('Queued', 'Sent', 'Stubbed', 'Failed')),
  provider_ref text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comm_logs_school_idx ON public.communication_logs (school_id, created_at DESC);

-- D9: LMS (Homework, Submissions, Study Material, Student Leave)
CREATE TABLE IF NOT EXISTS public.homework_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.school_classes(id) ON DELETE CASCADE,
  section_name text NOT NULL DEFAULT 'A',
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  title text NOT NULL,
  instructions text NOT NULL DEFAULT '',
  due_date date NOT NULL,
  max_score integer NOT NULL DEFAULT 20,
  attachment_path text,
  status text NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS homework_school_cls_idx ON public.homework_assignments (school_id, class_id, due_date DESC);

CREATE TABLE IF NOT EXISTS public.homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  assignment_id uuid NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  submission_text text NOT NULL DEFAULT '',
  attachment_path text,
  score integer,
  feedback text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Graded', 'Late')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  graded_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS homework_submissions_uniq ON public.homework_submissions (school_id, assignment_id, student_id);

CREATE TABLE IF NOT EXISTS public.study_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.school_classes(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  title text NOT NULL,
  material_type text NOT NULL DEFAULT 'Notes',
  storage_path text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS study_materials_school_cls_idx ON public.study_materials (school_id, class_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.student_leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  from_date date NOT NULL,
  to_date date NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS student_leave_school_stu_idx ON public.student_leave_requests (school_id, student_id, status);

-- D11: Library, Transport & Hostel
CREATE TABLE IF NOT EXISTS public.library_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  isbn text NOT NULL DEFAULT '',
  accession_no text NOT NULL,
  title text NOT NULL,
  author text NOT NULL,
  category text NOT NULL DEFAULT 'Academic',
  total_copies integer NOT NULL DEFAULT 1,
  available_copies integer NOT NULL DEFAULT 1,
  shelf_code text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS library_books_uniq ON public.library_books (school_id, accession_no);

CREATE TABLE IF NOT EXISTS public.library_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.library_books(id) ON DELETE RESTRICT,
  member_type text NOT NULL CHECK (member_type IN ('Student', 'Staff')),
  member_id uuid NOT NULL,
  member_name text NOT NULL,
  issued_on date NOT NULL DEFAULT CURRENT_DATE,
  due_on date NOT NULL DEFAULT (CURRENT_DATE + 14),
  returned_on date,
  fine_inr numeric(8,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Issued' CHECK (status IN ('Issued', 'Returned', 'Overdue')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS library_issues_school_status_idx ON public.library_issues (school_id, status, due_on);

CREATE TABLE IF NOT EXISTS public.transport_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  vehicle_no text NOT NULL,
  driver_name text NOT NULL,
  driver_phone text NOT NULL,
  capacity integer NOT NULL DEFAULT 40,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance', 'Inactive')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS transport_vehicles_uniq ON public.transport_vehicles (school_id, vehicle_no);

CREATE TABLE IF NOT EXISTS public.transport_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  route_code text NOT NULL,
  name text NOT NULL,
  vehicle_id uuid REFERENCES public.transport_vehicles(id) ON DELETE SET NULL,
  stops text[] NOT NULL DEFAULT ARRAY[]::text[],
  monthly_fee_inr numeric(10,2) NOT NULL DEFAULT 1500,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS transport_routes_uniq ON public.transport_routes (school_id, route_code);

CREATE TABLE IF NOT EXISTS public.transport_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  route_id uuid NOT NULL REFERENCES public.transport_routes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  pickup_stop text NOT NULL,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Paused')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS transport_assignments_uniq ON public.transport_assignments (school_id, student_id);

CREATE TABLE IF NOT EXISTS public.hostel_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  hostel_block text NOT NULL,
  room_no text NOT NULL,
  room_type text NOT NULL DEFAULT '4-Bed Shared',
  capacity integer NOT NULL DEFAULT 4,
  occupied integer NOT NULL DEFAULT 0,
  monthly_fee_inr numeric(10,2) NOT NULL DEFAULT 4500,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS hostel_rooms_uniq ON public.hostel_rooms (school_id, hostel_block, room_no);

CREATE TABLE IF NOT EXISTS public.hostel_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.hostel_rooms(id) ON DELETE RESTRICT,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  bed_label text NOT NULL DEFAULT 'Bed A',
  allocated_on date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Allocated' CHECK (status IN ('Allocated', 'Vacated')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hostel_allocs_school_stu_idx ON public.hostel_allocations (school_id, student_id);

-- D12: Inventory & Issued Certificates (+ G Error Logs)
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sku text NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Lab & Classroom',
  quantity integer NOT NULL DEFAULT 0,
  reorder_level integer NOT NULL DEFAULT 5,
  unit_cost_inr numeric(10,2) NOT NULL DEFAULT 0,
  location text NOT NULL DEFAULT 'Central Store',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS inventory_items_uniq ON public.inventory_items (school_id, sku);

CREATE TABLE IF NOT EXISTS public.issued_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  certificate_no text NOT NULL,
  doc_type text NOT NULL CHECK (doc_type IN ('Transfer Certificate', 'Bonafide Certificate', 'Character Certificate', 'Study Certificate')),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  verification_token uuid REFERENCES public.qr_verification_tokens(token) ON DELETE SET NULL,
  issued_on date NOT NULL DEFAULT CURRENT_DATE,
  remarks text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS issued_certs_uniq ON public.issued_certificates (school_id, certificate_no);

CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'server',
  severity text NOT NULL DEFAULT 'error',
  message text NOT NULL,
  route text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Triggers
CREATE OR REPLACE TRIGGER student_attendance_upd BEFORE UPDATE ON public.student_attendance FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER timetable_slots_upd BEFORE UPDATE ON public.timetable_slots FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER exams_upd BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER exam_marks_upd BEFORE UPDATE ON public.exam_marks FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE OR REPLACE TRIGGER fee_receipts_audit AFTER INSERT OR UPDATE OR DELETE ON public.fee_receipts FOR EACH ROW EXECUTE FUNCTION private.audit_row_change('fees');
CREATE OR REPLACE TRIGGER fee_refunds_audit AFTER INSERT OR UPDATE OR DELETE ON public.fee_refunds FOR EACH ROW EXECUTE FUNCTION private.audit_row_change('fees');
CREATE OR REPLACE TRIGGER exam_marks_audit AFTER INSERT OR UPDATE OR DELETE ON public.exam_marks FOR EACH ROW EXECUTE FUNCTION private.audit_row_change('exams');
CREATE OR REPLACE TRIGGER issued_certificates_audit AFTER INSERT OR UPDATE OR DELETE ON public.issued_certificates FOR EACH ROW EXECUTE FUNCTION private.audit_row_change('certificates');

-- Tenant RLS across all 26 new tenant tables (school_id = private.current_school_id())
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'student_attendance','staff_attendance','timetable_slots','timetable_substitutions',
    'grade_scales','exams','exam_schedules','exam_marks','qr_verification_tokens',
    'fee_heads','fee_structures','fee_concessions','fee_receipt_sequences','fee_receipts','fee_refunds',
    'notices','campus_events','complaints','messages','notifications','communication_logs',
    'homework_assignments','homework_submissions','study_materials','student_leave_requests',
    'library_books','library_issues','transport_vehicles','transport_routes','transport_assignments',
    'hostel_rooms','hostel_allocations','inventory_items','issued_certificates'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (school_id = (SELECT private.current_school_id()))',
      t || '_tenant_select', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.school_allows_write()))',
      t || '_tenant_insert', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (school_id = (SELECT private.current_school_id()) AND (SELECT private.school_allows_write())) WITH CHECK (school_id = (SELECT private.current_school_id()) AND (SELECT private.school_allows_write()))',
      t || '_tenant_update', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (school_id = (SELECT private.current_school_id()) AND ((SELECT private.is_admin()) OR (SELECT private.is_staff_or_admin())) AND (SELECT private.school_allows_write()))',
      t || '_tenant_delete', t
    );
  END LOOP;
END;
$$;
;
