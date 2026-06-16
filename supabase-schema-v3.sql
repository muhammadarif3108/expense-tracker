-- ============================================
-- Expense Tracker — Schema V3 (Category Types)
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Add 'type' column with a check constraint and default value 'expense'
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'expense' 
CHECK (type IN ('income', 'expense'));

-- 2. Update the unique constraint to include the 'type' column
-- First, drop the old unique constraint
ALTER TABLE categories 
DROP CONSTRAINT IF EXISTS categories_user_id_name_key;

-- Add the new composite unique constraint
ALTER TABLE categories 
ADD CONSTRAINT categories_user_id_name_type_key UNIQUE (user_id, name, type);
