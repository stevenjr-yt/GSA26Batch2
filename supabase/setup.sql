-- Run once in the SQL Editor of YOUR Supabase project.
-- Uploaded files are public for viewing/downloading. Only our server may write.
create table if not exists public.community_moments (
  id uuid primary key,
  title text not null check (char_length(title) between 1 and 100),
  description text check (char_length(description) <= 2000),
  tags text[] not null default '{}' check (cardinality(tags) <= 8),
  storage_path text not null unique,
  image_bytes integer not null check (image_bytes between 1 and 100000),
  width integer not null check (width between 1 and 1600),
  height integer not null check (height between 1 and 1600),
  submitter_hash text not null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists community_moments_feed on public.community_moments (created_at desc, id desc) where published;
create index if not exists community_moments_limits on public.community_moments (submitter_hash, created_at);
alter table public.community_moments enable row level security;
revoke all on public.community_moments from anon, authenticated;
grant select, insert, update, delete on public.community_moments to service_role;

create or replace function public.reserve_community_moment(
  p_id uuid, p_title text, p_description text, p_tags text[], p_path text,
  p_bytes integer, p_width integer, p_height integer, p_submitter_hash text
) returns uuid language plpgsql security invoker set search_path = public, pg_catalog as $$
begin
  -- ponytail: serialize this tiny reservation; per-submitter locks if upload volume grows.
  perform pg_advisory_xact_lock(20261031);
  if (select count(*) from public.community_moments
      where submitter_hash = p_submitter_hash and created_at > now() - interval '24 hours') >= 20 then
    raise exception using errcode = 'P0001', message = 'MOMENT_RATE_LIMIT';
  end if;
  insert into public.community_moments
    (id,title,description,tags,storage_path,image_bytes,width,height,submitter_hash)
    values (p_id,p_title,p_description,p_tags,p_path,p_bytes,p_width,p_height,p_submitter_hash);
  return p_id;
end;
$$;
revoke all on function public.reserve_community_moment(uuid,text,text,text[],text,integer,integer,integer,text) from public, anon, authenticated;
grant execute on function public.reserve_community_moment(uuid,text,text,text[],text,integer,integer,integer,text) to service_role;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('gsa-moments','gsa-moments',true,100000,array['image/webp'])
on conflict (id) do update set public=true,file_size_limit=100000,allowed_mime_types=array['image/webp'];
-- No public INSERT/UPDATE/DELETE storage policy is created. The server uses its secret key.
