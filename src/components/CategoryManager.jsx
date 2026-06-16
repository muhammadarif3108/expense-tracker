import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import { useCategories, useCreateCategory, useDeleteCategory } from '../hooks/useTransactions';
import { PRESET_EXPENSE_CATEGORIES, PRESET_INCOME_CATEGORIES } from '../constants/categories';
import toast from 'react-hot-toast';

export default function CategoryManager({ isOpen, onClose, defaultType = 'expense' }) {
  const { user } = useAuth();
  const [newCategory, setNewCategory] = useState('');
  const [activeType, setActiveType] = useState('expense');
  
  const { data: customCategories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  // Reset tab to defaultType when opened
  useEffect(() => {
    if (isOpen && defaultType) {
      setActiveType(defaultType);
    }
  }, [isOpen, defaultType]);

  if (!isOpen) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    const nameTrimmed = newCategory.trim();
    if (!nameTrimmed) return;

    const lowerName = nameTrimmed.toLowerCase();
    
    // Check preset categories (case-insensitive) for active type
    const presetList = activeType === 'expense' ? PRESET_EXPENSE_CATEGORIES : PRESET_INCOME_CATEGORIES;
    const isPreset = presetList.some(
      (cat) => cat.toLowerCase() === lowerName
    );
    if (isPreset) {
      toast.error('Kategori ini adalah kategori bawaan');
      return;
    }

    // Check custom categories (case-insensitive) for active type
    const isCustomExists = (customCategories || []).some(
      (cat) => cat.type === activeType && cat.name.toLowerCase() === lowerName
    );
    if (isCustomExists) {
      toast.error('Kategori sudah ada');
      return;
    }

    try {
      await createMutation.mutateAsync({ name: nameTrimmed, user_id: user.id, type: activeType });
      setNewCategory('');
      toast.success('Kategori berhasil ditambahkan');
    } catch (err) {
      if (err.code === '23505') { // unique violation
        toast.error('Kategori sudah ada');
      } else {
        toast.error('Gagal menambahkan kategori');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Kategori berhasil dihapus');
    } catch (err) {
      toast.error('Gagal menghapus kategori');
    }
  };

  const filteredCustomCategories = (customCategories || []).filter(
    (cat) => cat.type === activeType
  );

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-2xl animate-scale-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Kelola Kategori Kustom</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs to select active type */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800/40 border border-gray-800/80 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setActiveType('expense')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeType === 'expense'
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30 border border-transparent'
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setActiveType('income')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeType === 'income'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30 border border-transparent'
            }`}
          >
            Pemasukan
          </button>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder={`Nama kategori ${activeType === 'expense' ? 'pengeluaran' : 'pemasukan'} baru...`}
            className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-gray-500"
            disabled={createMutation.isPending}
          />
          <button
            type="submit"
            disabled={!newCategory.trim() || createMutation.isPending}
            className={`px-4 py-2 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer ${
              activeType === 'expense'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {createMutation.isPending ? '...' : 'Tambah'}
          </button>
        </form>

        {/* Category List */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Kategori {activeType === 'expense' ? 'Pengeluaran' : 'Pemasukan'}:
          </h3>
          {isLoading ? (
            <div className="text-sm text-gray-500 text-center py-4">Memuat...</div>
          ) : filteredCustomCategories.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">Belum ada kategori kustom.</div>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {filteredCustomCategories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <span className="text-sm text-gray-200">{cat.name}</span>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    title="Hapus Kategori"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
