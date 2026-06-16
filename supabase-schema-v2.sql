-- ============================================
-- Expense Tracker — Schema V2 (Categories)
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create the categories table
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz default now(),
  unique(user_id, name, type)
);

-- 2. Enable Row Level Security
alter table categories enable row level security;

-- 3. RLS Policies — users can only access their own data

-- SELECT: users can read their own categories
create policy "Users can view own categories"
  on categories for select
  using (auth.uid() = user_id);

-- INSERT: users can insert their own categories
create policy "Users can insert own categories"
  on categories for insert
  with check (auth.uid() = user_id);

-- DELETE: users can delete their own categories
create policy "Users can delete own categories"
  on categories for delete
  using (auth.uid() = user_id);

-- 4. Create an index for faster queries
create index if not exists idx_categories_user_id on categories(user_id);
