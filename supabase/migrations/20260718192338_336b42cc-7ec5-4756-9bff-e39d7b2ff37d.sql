
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_full_name text := NULLIF(meta->>'full_name', '');
  v_gender text := NULLIF(meta->>'gender', '');
  v_birth_date text := NULLIF(meta->>'birth_date', '');
  v_language text := COALESCE(NULLIF(meta->>'preferred_language',''), 'it');
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  IF v_full_name IS NOT NULL AND v_gender IS NOT NULL AND v_birth_date IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name, gender, birth_date, preferred_language,
      min_age_preference, max_age_preference, age_preferences_unlocked)
    VALUES (
      NEW.id,
      v_full_name,
      v_gender::public.gender,
      v_birth_date::date,
      v_language,
      CASE WHEN v_gender = 'male' THEN 18 ELSE NULL END,
      CASE WHEN v_gender = 'male' THEN 100 ELSE NULL END,
      CASE WHEN v_gender = 'male' THEN false ELSE NULL END
    )
    ON CONFLICT (id) DO NOTHING;

    IF v_gender = 'male' THEN
      INSERT INTO public.tokens (user_id, amount)
      VALUES (NEW.id, 1)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
