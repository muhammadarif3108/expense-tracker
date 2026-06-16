-- ============================================
-- Expense Tracker — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create the transactions table
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  category text not null,
  note text,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table transactions enable row level security;

-- 3. RLS Policies — users can only access their own data

-- SELECT: users can read their own transactions
create policy "Users can view own transactions"
  on transactions for select
  using (auth.uid() = user_id);

-- INSERT: users can insert their own transactions
create policy "Users can insert own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

-- UPDATE: users can update their own transactions
create policy "Users can update own transactions"
  on transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: users can delete their own transactions
create policy "Users can delete own transactions"
  on transactions for delete
  using (auth.uid() = user_id);

-- 4. Create an index for faster queries by user
create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_transactions_created_at on transactions(created_at desc);
