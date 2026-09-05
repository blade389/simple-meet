-- Recreate profiles for auth users whose profile was deleted in the reset.
-- Uses signup metadata when available, safe defaults otherwise.
INSERT INTO public.profiles (id, full_name, gender, birth_date, preferred_language, min_age_preference, max_age_preference, age_preferences_unlocked)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'gender', 'male')::public.gender,
  COALESCE(NULLIF(u.raw_user_meta_data->>'birth_date', '')::date, '1995-01-01'::date),
  COALESCE(NULLIF(u.raw_user_meta_data->>'preferred_language', ''), 'it'),
  CASE WHEN COALESCE(u.raw_user_meta_data->>'gender', 'male') = 'male' THEN 18 ELSE NULL END,
  CASE WHEN COALESCE(u.raw_user_meta_data->>'gender', 'male') = 'male' THEN 100 ELSE NULL END,
  CASE WHEN COALESCE(u.raw_user_meta_data->>'gender', 'male') = 'male' THEN false ELSE NULL END
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Ensure every user has a role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user' FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id);

-- Give male users their starting token if they have none
INSERT INTO public.tokens (user_id, amount)
SELECT p.id, 1 FROM public.profiles p
WHERE p.gender = 'male'
  AND NOT EXISTS (SELECT 1 FROM public.tokens t WHERE t.user_id = p.id);