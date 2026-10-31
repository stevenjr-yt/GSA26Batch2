-- Existing photo uploads are preserved. Run once after the initial setup.
begin;
alter table public.community_moments
  add column if not exists kind text not null default 'image',
  add column if not exists drive_url text;
alter table public.community_moments
  alter column storage_path drop not null,
  alter column image_bytes drop not null,
  alter column width drop not null,
  alter column height drop not null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname='community_moments_media_type' and conrelid='public.community_moments'::regclass) then
    alter table public.community_moments add constraint community_moments_media_type check (
      (kind='image' and storage_path is not null and image_bytes is not null and width is not null and height is not null and drive_url is null)
      or
      (kind='drive_video' and storage_path is null and image_bytes is null and width is null and height is null
       and drive_url is not null and drive_url ~ '^https://drive\.google\.com/file/d/[A-Za-z0-9_-]{10,200}/view(\?resourcekey=[A-Za-z0-9_-]{1,200})?$')
    );
  end if;
end $$;
drop function if exists public.reserve_community_moment(uuid,text,text,text[],text,integer,integer,integer,text);
create or replace function public.reserve_community_moment(
  p_id uuid, p_title text, p_description text, p_tags text[], p_path text,
  p_bytes integer, p_width integer, p_height integer, p_submitter_hash text,
  p_kind text default 'image', p_drive_url text default null
) returns uuid language plpgsql security invoker set search_path = public, pg_catalog as $$
begin
  -- ponytail: one short reservation lock; use per-submitter locks if volume grows.
  perform pg_advisory_xact_lock(20261031);
  if (select count(*) from public.community_moments
      where submitter_hash=p_submitter_hash and created_at>now()-interval '24 hours')>=20 then
    raise exception using errcode='P0001',message='MOMENT_RATE_LIMIT';
  end if;
  insert into public.community_moments
    (id,title,description,tags,storage_path,image_bytes,width,height,submitter_hash,kind,drive_url)
    values (p_id,p_title,p_description,p_tags,p_path,p_bytes,p_width,p_height,p_submitter_hash,p_kind,p_drive_url);
  return p_id;
end;
$$;
revoke all on function public.reserve_community_moment(uuid,text,text,text[],text,integer,integer,integer,text,text,text) from public, anon, authenticated;
grant execute on function public.reserve_community_moment(uuid,text,text,text[],text,integer,integer,integer,text,text,text) to service_role;
commit;
