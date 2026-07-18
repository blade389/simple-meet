
DO $$
DECLARE
  u record;
  meta jsonb;
  v_full_name text;
  v_gender text;
  v_birth_date text;
  v_language text;
BEGIN
  FOR u IN
    SELECT au.id, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE p.id IS NULL
  LOOP
    meta := COALESCE(u.raw_user_meta_data, '{}'::jsonb);
    v_full_name := NULLIF(meta->>'full_name', '');
    v_gender := NULLIF(meta->>'gender', '');
    v_birth_date := NULLIF(meta->>'birth_date', '');
    v_language := COALESCE(NULLIF(meta->>'preferred_language',''), 'it');

    IF v_full_name IS NOT NULL AND v_gender IS NOT NULL AND v_birth_date IS NOT NULL THEN
      INSERT INTO public.profiles (id, full_name, gender, birth_date, preferred_language,
        min_age_preference, max_age_preference, age_preferences_unlocked)
      VALUES (
        u.id, v_full_name, v_gender::public.gender, v_birth_date::date, v_language,
        CASE WHEN v_gender = 'male' THEN 18 ELSE NULL END,
        CASE WHEN v_gender = 'male' THEN 100 ELSE NULL END,
        CASE WHEN v_gender = 'male' THEN false ELSE NULL END
      )
      ON CONFLICT (id) DO NOTHING;

      IF v_gender = 'male' THEN
        INSERT INTO public.tokens (user_id, amount) VALUES (u.id, 1)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;
END $$;
