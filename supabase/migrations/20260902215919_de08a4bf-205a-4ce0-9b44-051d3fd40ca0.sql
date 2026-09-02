alter table public.profiles drop constraint if exists profiles_verified_badge_source_check;
alter table public.profiles add constraint profiles_verified_badge_source_check
  check (verified_badge_source is null or verified_badge_source = any (array['subscription','admin','founder']));

create or replace function public.grant_founder_premium()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  female_count integer;
begin
  if new.gender = 'female' then
    select count(*) into female_count from public.profiles where gender = 'female';
    if female_count < 200 then
      new.is_premium := true;
      new.subscription_status := 'active';
      new.subscription_end := null;
      new.verified_badge_status := 'active';
      new.verified_badge_source := 'founder';
      new.verified_badge_activated_at := now();
      new.verified_badge_expires_at := null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists grant_founder_premium_trigger on public.profiles;
create trigger grant_founder_premium_trigger
before insert on public.profiles
for each row execute function public.grant_founder_premium();

update public.profiles
set is_premium = true,
    subscription_status = 'active',
    subscription_end = null,
    verified_badge_status = 'active',
    verified_badge_source = 'founder',
    verified_badge_activated_at = coalesce(verified_badge_activated_at, now()),
    verified_badge_expires_at = null
where gender = 'female'
  and coalesce(verified_badge_source, '') <> 'founder';

create or replace function public.get_founder_spots_left()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select greatest(0, 200 - (select count(*)::int from public.profiles where gender = 'female'))
$$;

grant execute on function public.get_founder_spots_left() to anon, authenticated;