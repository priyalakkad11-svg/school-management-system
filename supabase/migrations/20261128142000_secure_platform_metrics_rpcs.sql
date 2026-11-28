REVOKE ALL ON FUNCTION public.get_platform_dashboard_metrics() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_dashboard_metrics() TO service_role;

REVOKE ALL ON FUNCTION public.get_school_usage_summary(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_school_usage_summary(uuid) TO service_role;
