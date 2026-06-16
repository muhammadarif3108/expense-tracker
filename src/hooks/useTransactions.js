import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  createCategory,
  deleteCategory,
} from '../services/transactions';

const TRANSACTIONS_KEY = 'transactions';
const CATEGORIES_KEY = 'categories';

/**
 * Fetch transactions with optional filters.
 */
export function useTransactions(filters = {}) {
  return useQuery({
    queryKey: [TRANSACTIONS_KEY, filters],
    queryFn: () => getTransactions(filters),
  });
}

/**
 * Fetch distinct categories.
 */
export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: getCategories,
  });
}

/**
 * Create a new transaction.
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
}

/**
 * Update an existing transaction.
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }) => updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
}

/**
 * Delete a transaction.
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
}

/**
 * Create a new custom category.
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
}

/**
 * Delete a custom category.
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
}
