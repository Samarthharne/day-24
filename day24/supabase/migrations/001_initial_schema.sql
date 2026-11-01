-- Day24 Time Tracking App - Initial Schema
-- Run this in your Supabase SQL Editor

-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  onboarding_completed boolean default false,
  onboarding_goals text[] default '{}',
  theme_preference text default 'system',
  created_at timestamptz default now()
);

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  icon text default '📌',
  color text default '#6366F1',
  is_productive boolean default false,
  created_at timestamptz default now(),
  unique(user_id, name)
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text,
  priority text check (priority in ('high', 'medium', 'low')) default 'medium',
  due_date date,
  estimated_duration_minutes integer,
  actual_duration_minutes integer default 0,
  status text check (status in ('pending', 'completed', 'cancelled')) default 'pending',
  is_recurring boolean default false,
  recurrence_rule text,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activities
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  duration_minutes integer not null default 0,
  productivity_rating integer check (productivity_rating between 1 and 5),
  is_planned boolean default false,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint valid_time_range check (end_time > start_time)
);

-- Goals
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  target_minutes integer not null,
  period_type text check (period_type in ('daily', 'weekly', 'monthly')) not null,
  start_date date not null,
  end_date date,
  created_at timestamptz default now()
);

-- Planned blocks
create table if not exists public.planned_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  planned_date date not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz default now(),
  constraint valid_planned_range check (end_time > start_time)
);

-- Notification settings
create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null unique,
  morning_reminder boolean default true,
  morning_time time default '08:00',
  afternoon_reminder boolean default true,
  afternoon_time time default '14:00',
  evening_reminder boolean default true,
  evening_time time default '21:00',
  task_reminders boolean default true,
  created_at timestamptz default now()
);

-- Activity suggestions for quick log
create table if not exists public.activity_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category_id uuid references public.categories(id) on delete set null,
  use_count integer default 1,
  last_used_at timestamptz default now(),
  unique(user_id, title)
);

-- Indexes
create index if not exists idx_activities_user_start on public.activities(user_id, start_time);
create index if not exists idx_activities_user_end on public.activities(user_id, end_time);
create index if not exists idx_tasks_user_status on public.tasks(user_id, status);
create index if not exists idx_goals_user on public.goals(user_id);
create index if not exists idx_planned_blocks_date on public.planned_blocks(user_id, planned_date);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger activities_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Duration calculation trigger
create or replace function public.set_activity_duration()
returns trigger as $$
begin
  new.duration_minutes = greatest(0, (extract(epoch from (new.end_time - new.start_time)) / 60)::integer);
  return new;
end;
$$ language plpgsql;

create trigger activities_duration
  before insert or update on public.activities
  for each row execute function public.set_activity_duration();

-- Seed default categories for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));

  insert into public.notification_settings (user_id) values (new.id);

  insert into public.categories (user_id, name, icon, color, is_productive) values
    (new.id, 'Work', '💼', '#6366F1', true),
    (new.id, 'Study', '📚', '#8B5CF6', true),
    (new.id, 'Sleep', '😴', '#3B82F6', false),
    (new.id, 'Exercise', '🏋️', '#10B981', true),
    (new.id, 'Health', '❤️', '#EF4444', true),
    (new.id, 'Personal', '🏠', '#F59E0B', false),
    (new.id, 'Family', '👨‍👩‍👧', '#EC4899', false),
    (new.id, 'Friends', '🤝', '#14B8A6', false),
    (new.id, 'Entertainment', '🎬', '#F97316', false),
    (new.id, 'Social Media', '📱', '#A855F7', false),
    (new.id, 'Travel', '✈️', '#0EA5E9', false),
    (new.id, 'Food', '🍽️', '#84CC16', false),
    (new.id, 'Meditation', '🧘', '#6366F1', true),
    (new.id, 'Reading', '📖', '#7C3AED', true),
    (new.id, 'Gaming', '🎮', '#DC2626', false),
    (new.id, 'Other', '📌', '#6B7280', false);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.planned_blocks enable row level security;
alter table public.notification_settings enable row level security;
alter table public.activity_suggestions enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Categories policies
create policy "Users can view own categories" on public.categories for select using (auth.uid() = user_id);
create policy "Users can insert own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on public.categories for delete using (auth.uid() = user_id);

-- Activities policies
create policy "Users can view own activities" on public.activities for select using (auth.uid() = user_id);
create policy "Users can insert own activities" on public.activities for insert with check (auth.uid() = user_id);
create policy "Users can update own activities" on public.activities for update using (auth.uid() = user_id);
create policy "Users can delete own activities" on public.activities for delete using (auth.uid() = user_id);

-- Tasks policies
create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

-- Goals policies
create policy "Users can view own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on public.goals for delete using (auth.uid() = user_id);

-- Planned blocks policies
create policy "Users can view own planned blocks" on public.planned_blocks for select using (auth.uid() = user_id);
create policy "Users can insert own planned blocks" on public.planned_blocks for insert with check (auth.uid() = user_id);
create policy "Users can update own planned blocks" on public.planned_blocks for update using (auth.uid() = user_id);
create policy "Users can delete own planned blocks" on public.planned_blocks for delete using (auth.uid() = user_id);

-- Notification settings policies
create policy "Users can view own notification settings" on public.notification_settings for select using (auth.uid() = user_id);
create policy "Users can insert own notification settings" on public.notification_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own notification settings" on public.notification_settings for update using (auth.uid() = user_id);

-- Activity suggestions policies
create policy "Users can view own suggestions" on public.activity_suggestions for select using (auth.uid() = user_id);
create policy "Users can insert own suggestions" on public.activity_suggestions for insert with check (auth.uid() = user_id);
create policy "Users can update own suggestions" on public.activity_suggestions for update using (auth.uid() = user_id);
create policy "Users can delete own suggestions" on public.activity_suggestions for delete using (auth.uid() = user_id);
