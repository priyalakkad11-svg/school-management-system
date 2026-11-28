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
