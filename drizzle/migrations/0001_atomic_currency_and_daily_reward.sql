CREATE OR REPLACE FUNCTION public.adjust_currency(_coins integer, _gems integer)
RETURNS TABLE(coins integer, gems integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  RETURN QUERY
  UPDATE public.profiles p
     SET coins = p.coins + _coins, gems = p.gems + _gems
   WHERE p.user_id = uid AND p.coins + _coins >= 0 AND p.gems + _gems >= 0
  RETURNING p.coins, p.gems;
END; $$;
REVOKE ALL ON FUNCTION public.adjust_currency(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.adjust_currency(integer, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_daily_reward()
RETURNS TABLE(streak integer, coins integer, gems integer, claim_date date)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); r record; today date := (now() AT TIME ZONE 'utc')::date;
  new_streak int; cyc int; d int; mult numeric; c int; g int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO r FROM public.daily_rewards dr WHERE dr.user_id = uid FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.daily_rewards(user_id) VALUES (uid);
    SELECT * INTO r FROM public.daily_rewards dr WHERE dr.user_id = uid FOR UPDATE;
  END IF;
  IF r.last_claim_date = today THEN RETURN; END IF;
  IF r.last_claim_date = today - 1 THEN new_streak := r.streak + 1; ELSE new_streak := 1; END IF;
  cyc := (new_streak - 1) / 7; d := (new_streak - 1) % 7 + 1; mult := 1 + cyc * 0.1;
  c := floor((ARRAY[100,150,200,250,300,400,500])[d] * mult);
  g := floor((ARRAY[0,0,5,0,10,0,25])[d] * mult);
  UPDATE public.daily_rewards dr SET last_claim_date = today, streak = new_streak WHERE dr.user_id = uid;
  UPDATE public.profiles p SET coins = p.coins + c, gems = p.gems + g WHERE p.user_id = uid;
  RETURN QUERY SELECT new_streak, c, g, today;
END; $$;
REVOKE ALL ON FUNCTION public.claim_daily_reward() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_daily_reward() TO authenticated;