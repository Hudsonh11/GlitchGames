REVOKE EXECUTE ON FUNCTION public.adjust_currency(integer, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_daily_reward() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_currency(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_daily_reward() TO authenticated;