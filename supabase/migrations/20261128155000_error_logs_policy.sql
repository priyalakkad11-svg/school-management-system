GRANT SELECT ON public.error_logs TO authenticated;
CREATE POLICY error_logs_select_scoped ON public.error_logs
  FOR SELECT TO authenticated
  USING (
    (SELECT private.is_super_admin())
    OR (school_id = (SELECT private.current_school_id()) AND (SELECT private.is_admin()))
  );
