-- Hotemin Meme Bank database + storage setup
-- Run this in Supabase Dashboard > SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.memes (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null check (char_length(sender_name) between 1 and 60),
  image_url text not null,
  file_path text not null,
  created_at timestamptz not null default now()
);

alter table public.memes enable row level security;

drop policy if exists "Public can view memes" on public.memes;
create policy "Public can view memes"
on public.memes
for select
using (true);

drop policy if exists "Public can submit memes" on public.memes;
create policy "Public can submit memes"
on public.memes
for insert
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memes',
  'memes',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view meme files" on storage.objects;
create policy "Public can view meme files"
on storage.objects
for select
using (bucket_id = 'memes');

drop policy if exists "Public can upload meme files" on storage.objects;
create policy "Public can upload meme files"
on storage.objects
for insert
with check (
  bucket_id = 'memes'
  and lower((storage.foldername(name))[1]) = 'public'
);
