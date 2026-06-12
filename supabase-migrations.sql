-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- or save as supabase/migrations/001_init.sql and run via Supabase CLI

-- Profiles table (extends the built-in auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can only read and update their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- GitHub OAuth columns: add to profiles so each user can store their own token
alter table public.profiles add column github_token text;
alter table public.profiles add column github_owner text;
alter table public.profiles add column github_repo text;
