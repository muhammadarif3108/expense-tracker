import { supabase } from '../lib/supabase';

/**
 * Fetch transactions for the current user with optional filters.
 * @param {Object} filters
 * @param {string} [filters.category] - Filter by category
 * @param {string} [filters.startDate] - Filter by start date (ISO string)
 * @param {string} [filters.endDate] - Filter by end date (ISO string)
 * @param {string} [filters.type] - Filter by type ('income' | 'expense')
 */
export async function getTransactions(filters = {}) {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    // Add end-of-day to include the full end date
    const endOfDay = new Date(filters.endDate);
    endOfDay.setHours(23, 59, 59, 999);
    query = query.lte('created_at', endOfDay.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Create a new transaction.
 */
export async function createTransaction({ type, amount, category, note, user_id, date }) {
  const payload = { type, amount: Number(amount), category, note, user_id };
  if (date) {
    payload.created_at = date;
  }
  const { data, error } = await supabase
    .from('transactions')
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update an existing transaction by id.
 */
export async function updateTransaction(id, updates) {
  const updatePayload = {
    type: updates.type,
    amount: Number(updates.amount),
    category: updates.category,
    note: updates.note,
  };
  if (updates.date) {
    updatePayload.created_at = updates.date;
  }
  const { data, error } = await supabase
    .from('transactions')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Delete a transaction by id.
 */
export async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/**
 * Get custom categories for the current user.
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

/**
 * Create a new custom category.
 */
export async function createCategory({ name, user_id, type }) {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, user_id, type }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Delete a custom category by id.
 */
export async function deleteCategory(id) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
