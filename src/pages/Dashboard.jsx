import { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  useTransactions,
  useCategories,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '../hooks/useTransactions';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import TransactionForm, { PRESET_CATEGORIES } from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import ExpenseChart from '../components/ExpenseChart';
import CategoryDropdown from '../components/CategoryDropdown';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [chartType, setChartType] = useState('expense');

  const { data: transactions = [], isLoading } = useTransactions(filters);
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  // Compute summary
  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [transactions]);

  // Combine preset, custom, and transaction categories for the filter
  const allCategories = useMemo(() => {
    const customNames = (categories || []).map((c) => c.name);
    const transactionCategories = (transactions || []).map((t) => t.category);
    const combined = [...PRESET_CATEGORIES, ...customNames, ...transactionCategories];
    return [...new Set(combined.filter(Boolean))];
  }, [categories, transactions]);

  // Client-side search filtering (server handles category/date filters)
  const filteredTransactions = useMemo(() => {
    if (!filters.search) return transactions;
    const query = filters.search.toLowerCase();
    return transactions.filter(
      (t) =>
        (t.note && t.note.toLowerCase().includes(query)) ||
        (t.category && t.category.toLowerCase().includes(query))
    );
  }, [transactions, filters.search]);

  const handleCreate = async (data) => {
    try {
      await createMutation.mutateAsync({ ...data, user_id: user.id });
      setShowForm(false);
      toast.success('Transaksi berhasil ditambahkan');
    } catch (err) {
      toast.error('Gagal menambahkan transaksi');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateMutation.mutateAsync({ id: editingTransaction.id, ...data });
      setEditingTransaction(null);
      toast.success('Transaksi berhasil diperbarui');
    } catch (err) {
      toast.error('Gagal memperbarui transaksi');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Transaksi berhasil dihapus');
    } catch (err) {
      toast.error('Gagal menghapus transaksi');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true); // Ensure form is shown on mobile when editing
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === '' || value === null || value === undefined) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-fuchsia-500/5 rounded-full blur-3xl" />
      </div>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Page header */}
        <div className="mb-8 animate-slide-up" style={{ animationFillMode: 'both', animationDelay: '0ms' }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Kelola pemasukan dan pengeluaran Anda
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up" style={{ animationFillMode: 'both', animationDelay: '100ms' }}>
          <SummaryCard
            title="Total Pemasukan"
            amount={summary.income}
            type="income"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            }
          />
          <SummaryCard
            title="Total Pengeluaran"
            amount={summary.expense}
            type="expense"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
              </svg>
            }
          />
          <SummaryCard
            title="Saldo"
            amount={summary.balance}
            type="balance"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationFillMode: 'both', animationDelay: '200ms' }}>
          {/* Left column: Form (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Add / Edit form */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 sm:p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  {editingTransaction ? (
                    <>
                      <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      Edit Transaksi
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Tambah Transaksi
                    </>
                  )}
                </h2>
                <TransactionForm
                  key={editingTransaction?.id || 'new'}
                  onSubmit={editingTransaction ? handleUpdate : handleCreate}
                  onCancel={editingTransaction ? handleCancelEdit : null}
                  defaultValues={
                    editingTransaction
                      ? {
                          type: editingTransaction.type,
                          amount: editingTransaction.amount,
                          category: editingTransaction.category,
                          note: editingTransaction.note || '',
                        }
                      : undefined
                  }
                  isLoading={createMutation.isPending || updateMutation.isPending}
                />
              </div>
            </div>
          </div>

           {/* Right column: Filters + List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters & Search */}
            <div className="relative z-20 bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 sm:p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                </svg>
                Filter & Pencarian
              </h2>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    type="text"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Cari berdasarkan catatan..."
                    className="w-full pl-10 pr-4 py-3 md:py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-base md:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Kategori</label>
                  <CategoryDropdown
                    categories={['Semua Kategori', ...allCategories]}
                    value={filters.category || 'Semua Kategori'}
                    onChange={(cat) => handleFilterChange('category', cat === 'Semua Kategori' ? '' : cat)}
                    transactionType="expense"
                  />
                </div>

                {/* Start date */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Dari Tanggal</label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-3 md:py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-base md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all cursor-pointer"
                  />
                </div>

                {/* End date */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-3 md:py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-base md:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Active filters indicator / clear */}
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={() => setFilters({})}
                  className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  Hapus semua filter ({Object.keys(filters).length} aktif)
                </button>
              )}
            </div>

            {/* Expense / Income Chart */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                  </svg>
                  Analisis {chartType === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                </h2>
                <div className="flex w-full sm:w-auto bg-gray-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setChartType('expense')}
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${chartType === 'expense' ? 'bg-rose-500/20 text-rose-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  >
                    Pengeluaran
                  </button>
                  <button
                    onClick={() => setChartType('income')}
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${chartType === 'income' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  >
                    Pemasukan
                  </button>
                </div>
              </div>
              <ExpenseChart transactions={filteredTransactions} type={chartType} />
            </div>

            {/* Transaction list */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  Riwayat Transaksi
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredTransactions.length} transaksi
                </span>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Memuat transaksi...</p>
                  </div>
                </div>
              ) : (
                <TransactionList
                  transactions={filteredTransactions}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Form Modal */}
      {(showForm || editingTransaction) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm lg:hidden animate-fade-in">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingTransaction ? (
                  <>
                    <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Edit Transaksi
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tambah Transaksi
                  </>
                )}
              </h2>
              <button 
                onClick={() => { setShowForm(false); setEditingTransaction(null); }}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                aria-label="Tutup"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TransactionForm
              key={editingTransaction?.id || 'new-mobile'}
              onSubmit={editingTransaction ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditingTransaction(null); }}
              defaultValues={
                editingTransaction
                  ? {
                      type: editingTransaction.type,
                      amount: editingTransaction.amount,
                      category: editingTransaction.category,
                      note: editingTransaction.note || '',
                    }
                  : undefined
              }
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => { setEditingTransaction(null); setShowForm(true); }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-violet-500/30 lg:hidden hover:scale-105 active:scale-95 transition-transform animate-scale-in"
        aria-label="Tambah Transaksi"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

    </div>
  );
}
