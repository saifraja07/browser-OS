-- Community app: "guestbook" table + Row Level Security policies.
--
-- Run this in the Supabase SQL Editor (or via `supabase db push` /
-- `supabase migration up` if you're using the CLI) against your project.
--
-- What this does:
--   1. Creates the guestbook table with server-level constraints on
--      length/emptiness — these hold even if a client bypasses the React
--      app entirely and calls the REST API directly.
--   2. Enables Row Level Security and adds exactly two policies:
--      public SELECT and public INSERT. There is no UPDATE or DELETE
--      policy at all, which means those operations are denied by default
--      for every role that isn't the service role — not just hidden in
--      the UI, but impossible at the database layer.

create extension if not exists pgcrypto; -- for gen_random_uuid()

create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  created_at timestamptz not null default now(),

  constraint guestbook_name_length check (
    char_length(trim(name)) between 1 and 50
  ),
  constraint guestbook_message_length check (
    char_length(trim(message)) between 1 and 500
  )
);

-- Newest-first is the app's only query pattern.
create index if not exists guestbook_created_at_idx
  on public.guestbook (created_at desc);

alter table public.guestbook enable row level security;

-- Anyone (including anonymous visitors) can read every post.
drop policy if exists "guestbook_public_select" on public.guestbook;
create policy "guestbook_public_select"
  on public.guestbook
  for select
  to anon, authenticated
  using (true);

-- Anyone can create a post, subject to the same length constraints above.
-- (The submit-post Edge Function is the recommended path in — it adds
-- server-side moderation and rate limiting before the row is written —
-- but this policy is what actually enforces "insert only" at the
-- database level regardless of which client calls it.)
drop policy if exists "guestbook_public_insert" on public.guestbook;
create policy "guestbook_public_insert"
  on public.guestbook
  for insert
  to anon, authenticated
  with check (
    char_length(trim(name)) between 1 and 50
    and char_length(trim(message)) between 1 and 500
  );

-- Deliberately no UPDATE or DELETE policy for anon/authenticated —
-- Postgres RLS denies by default when no policy grants an operation, so
-- posts can never be edited or removed by a normal visitor. The service
-- role (used only by trusted server-side code, never the browser) bypasses
-- RLS entirely and is the only way to modify/remove rows, e.g. for manual
-- moderation cleanup from the Supabase dashboard.
