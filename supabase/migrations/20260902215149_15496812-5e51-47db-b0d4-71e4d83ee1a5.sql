create or replace function public.get_showcase_profiles(_lat numeric default null, _lon numeric default null, _limit integer default 8)
returns table (
  first_name text,
  age integer,
  photo_url text,
  bio text,
  is_premium boolean,
  nearby boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    split_part(p.full_name, ' ', 1) as first_name,
    date_part('year', age(p.birth_date))::int as age,
    p.profile_photo_url as photo_url,
    left(coalesce(p.bio, ''), 120) as bio,
    coalesce(p.is_premium, false) as is_premium,
    case
      when _lat is null or _lon is null or p.location_lat is null or p.location_lon is null then false
      else public.calculate_distance(_lat, _lon, p.location_lat, p.location_lon) <= 50
    end as nearby
  from public.profiles p
  where p.gender = 'female'
    and coalesce(p.is_blocked, false) = false
    and coalesce(p.is_paused, false) = false
    and p.profile_photo_url is not null
  order by
    case
      when _lat is null or _lon is null or p.location_lat is null or p.location_lon is null then 99999
      else public.calculate_distance(_lat, _lon, p.location_lat, p.location_lon)
    end asc,
    p.created_at desc
  limit least(coalesce(_limit, 8), 12)
$$;

grant execute on function public.get_showcase_profiles(numeric, numeric, integer) to anon, authenticated;