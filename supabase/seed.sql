-- EduCore (Greenwood International Academy) Seed Data
-- Appended incrementally per module. Idempotent inserts (ON CONFLICT DO NOTHING).


-- Module 2: School Setup Seed Data
INSERT INTO public.school_settings (
  singleton_key, school_name, affiliation_code, principal_name,
  official_email, phone, timezone_currency, address, grading_mode
)
VALUES (
  'default',
  'Greenwood International Academy',
  'CBSE-1130492 • Est. 2004',
  'Dr. Meenakshi Deshmukh',
  'office@greenwood.edu.in',
  '+91 20 2748 9900',
  'IST (UTC+05:30) • INR (₹)',
  'Plot 18, Knowledge Park, Baner Road, Pune 411045',
  'CBSE 9-Point + Percentage'
)
ON CONFLICT (singleton_key) DO NOTHING;

INSERT INTO public.academic_years (code, name, start_date, end_date, start_label, end_label, students_count, status)
VALUES
  ('AY-2026-27', 'AY 2026–27 (Current)', '2026-04-01', '2027-03-31', '01 Apr 2026', '31 Mar 2027', 2480, 'Active'),
  ('AY-2027-28', 'AY 2027–28 (Draft)', '2027-04-01', '2028-03-31', '01 Apr 2027', '31 Mar 2028', 0, 'Upcoming'),
  ('AY-2025-26', 'AY 2025–26', '2025-04-01', '2026-03-31', '01 Apr 2025', '31 Mar 2026', 2356, 'Archived'),
  ('AY-2024-25', 'AY 2024–25', '2024-04-01', '2025-03-31', '01 Apr 2024', '31 Mar 2025', 2210, 'Archived')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.school_classes (code, name, grade_order, wing, sections, class_teachers, strength, capacity, room_block, status)
VALUES
  ('CLS-10', 'Class 10', 10, 'Senior Wing', ARRAY['A','B','C','D'], 'Mrs. Kavita Nair (+3)', 156, 160, 'Senior Block', 'Active'),
  ('CLS-9', 'Class 9', 9, 'Senior Wing', ARRAY['A','B','C'], 'Mr. Arjun Menon (+2)', 114, 120, 'Senior Block', 'Active'),
  ('CLS-12-SCI', 'Class 12 (Science)', 12, 'Lab Wing', ARRAY['A','B'], 'Dr. S. Kulkarni (+1)', 72, 80, 'Lab Wing', 'Active'),
  ('CLS-6', 'Class 6', 6, 'Middle Wing', ARRAY['A','B','C','D'], 'Ms. Ritu Kapoor (+3)', 152, 160, 'Middle Wing', 'Active')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (code, name, category, max_theory, max_practical, periods_per_week, status)
VALUES
  ('MATH-041', 'Mathematics', 'Core Theory', 80, 20, 6, 'Active'),
  ('SCI-086', 'Science (Phy/Chem/Bio)', 'Theory + Lab', 80, 20, 7, 'Active'),
  ('PHY-042', 'Physics', 'Theory + Lab', 70, 30, 5, 'Active'),
  ('CS-083', 'Computer Science', 'Theory + Lab', 50, 50, 4, 'Active'),
  ('ENG-184', 'English Lang & Lit', 'Core Theory', 80, 20, 5, 'Active'),
  ('FRN-018', 'French Language', 'Elective', 80, 20, 3, 'Active')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.class_subject_mappings (academic_year_id, class_id, subject_id, periods_per_week, is_mandatory, mapped)
SELECT ay.id, sc.id, sub.id, sub.periods_per_week, (sub.category <> 'Elective'), true
FROM public.academic_years ay
JOIN public.school_classes sc ON sc.code IN ('CLS-10', 'CLS-9', 'CLS-12-SCI')
JOIN public.subjects sub ON sub.code IN ('MATH-041', 'SCI-086', 'ENG-184', 'CS-083', 'FRN-018')
WHERE ay.code = 'AY-2026-27'
ON CONFLICT (academic_year_id, class_id, subject_id) DO NOTHING;

INSERT INTO public.rbac_roles (name, description, is_system)
VALUES
  ('School Accountant', 'Manages fee structures, receipts, defaulters, and payroll', true),
  ('Exam Controller', 'Schedules exams, verifies marks, and locks term report cards', true),
  ('Head Librarian', 'Maintains library catalog, circulation, and member fines', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.rbac_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_export)
SELECT r.id, m.module, m.can_view, m.can_create, m.can_edit, m.can_delete, m.can_export
FROM public.rbac_roles r
JOIN (
  VALUES
    ('School Accountant', 'Fees & Receipts', true, true, true, false, true),
    ('School Accountant', 'Payroll & Salary Slips', true, true, true, false, true),
    ('School Accountant', 'Student Directory', true, false, false, false, true),
    ('School Accountant', 'Exams & Marks', false, false, false, false, false),
    ('Exam Controller', 'Fees & Receipts', false, false, false, false, false),
    ('Exam Controller', 'Payroll & Salary Slips', false, false, false, false, false),
    ('Exam Controller', 'Student Directory', true, false, true, false, true),
    ('Exam Controller', 'Exams & Marks', true, true, true, false, true),
    ('Head Librarian', 'Fees & Receipts', false, false, false, false, false),
    ('Head Librarian', 'Payroll & Salary Slips', false, false, false, false, false),
    ('Head Librarian', 'Student Directory', true, false, false, false, false),
    ('Head Librarian', 'Exams & Marks', false, false, false, false, false)
) AS m(role_name, module, can_view, can_create, can_edit, can_delete, can_export)
  ON r.name = m.role_name
ON CONFLICT (role_id, module) DO NOTHING;
