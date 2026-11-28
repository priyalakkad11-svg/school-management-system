-- Section A (Part 1): Add SaaS Multi-School Roles to public.user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'school_admin';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'principal';
