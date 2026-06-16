import { useForm } from 'react-hook-form';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useCategories } from '../hooks/useTransactions';
import { PRESET_CATEGORIES, PRESET_EXPENSE_CATEGORIES, PRESET_INCOME_CATEGORIES } from '../constants/categories';
import CategoryManager from './CategoryManager';
import CategoryDropdown from './CategoryDropdown';

export { PRESET_CATEGORIES };

export default function TransactionForm({ onSubmit, onCancel, defaultValues, isLoading }) {
  const parsedDefaultDate = defaultValues
    ? (defaultValues.date || defaultValues.created_at || new Date().toISOString()).split('T')[0]
    : new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          date: parsedDefaultDate,
        }
      : {
          type: 'expense',
          amount: '',
          category: '',
          date: parsedDefaultDate,
          note: '',
        },
  });

  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(
    defaultValues?.amount ? Number(defaultValues.amount).toLocaleString('id-ID') : ''
  );
  const { data: customCategories = [] } = useCategories();
  
  const transactionType = watch('type');

  const allCategories = useMemo(() => {
    const customNames = (customCategories || [])
      .filter((c) => c.type === transactionType)
      .map((c) => c.name);
      
    const presetList = transactionType === 'expense' ? PRESET_EXPENSE_CATEGORIES : PRESET_INCOME_CATEGORIES;
    
    const combined = [...presetList, ...customNames];
    if (defaultValues?.category && defaultValues.type === transactionType) {
      combined.push(defaultValues.category);
    }
    return [...new Set(combined)];
  }, [customCategories, transactionType, defaultValues]);

  // Reset category when transaction type changes and current category is not in the new list
  useEffect(() => {
    const currentCategory = watch('category');
    if (currentCategory && !allCategories.includes(currentCategory)) {
      setValue('category', '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionType]);

  useEffect(() => {
    if (defaultValues) {
      const parsedDate = (defaultValues.date || defaultValues.created_at || new Date().toISOString()).split('T')[0];
      reset({
        ...defaultValues,
        date: parsedDate,
      });
      setDisplayAmount(
        defaultValues.amount ? Number(defaultValues.amount).toLocaleString('id-ID') : ''
      );
    }
  }, [defaultValues, reset]);

  const handleAmountChange = useCallback((e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw === '') {
      setDisplayAmount('');
      setValue('amount', '', { shouldValidate: true });
      return;
    }
    const num = parseInt(raw, 10);
    setDisplayAmount(num.toLocaleString('id-ID'));
    setValue('amount', num, { shouldValidate: true });
  }, [setValue]);

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, amount: Number(String(data.amount).replace(/\D/g, '')) });
    if (!defaultValues) {
      reset({
        type: 'expense',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
      });
      setDisplayAmount('');
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-5"
      >
        {/* Type selector */}
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`relative flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-500 ${
              transactionType === 'expense'
                ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                : 'border-gray-700/50 bg-gray-800/30 text-gray-400 hover:border-gray-600'
            }`}
          >
            <input
              type="radio"
              value="expense"
              {...register('type', { required: true })}
              className="sr-only"
            />
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
            <span className="font-semibold text-sm">Pengeluaran</span>
          </label>
          <label
            className={`relative flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-500 ${
              transactionType === 'income'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-gray-700/50 bg-gray-800/30 text-gray-400 hover:border-gray-600'
            }`}
          >
            <input
              type="radio"
              value="income"
              {...register('type', { required: true })}
              className="sr-only"
            />
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
            <span className="font-semibold text-sm">Pemasukan</span>
          </label>
        </div>

        {/* Amount with currency formatting */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Jumlah (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm pointer-events-none">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={displayAmount}
              onChange={handleAmountChange}
              className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-lg font-semibold"
            />
            {/* Hidden field for react-hook-form validation */}
            <input type="hidden" {...register('amount', {
              required: 'Jumlah harus diisi',
              min: { value: 1, message: 'Jumlah harus lebih dari 0' },
            })} />
          </div>
          {errors.amount && (
            <p className="mt-1.5 text-xs text-rose-400">{errors.amount.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Kategori
            </label>
            <button
              type="button"
              onClick={() => setShowCategoryManager(true)}
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Kelola
            </button>
          </div>
          <input type="hidden" {...register('category', { required: 'Kategori harus dipilih' })} />
          <CategoryDropdown
            categories={allCategories}
            value={watch('category')}
            onChange={(cat) => setValue('category', cat, { shouldValidate: true })}
            error={!!errors.category}
            transactionType={transactionType}
          />
          {errors.category && (
            <p className="mt-1.5 text-xs text-rose-400">{errors.category.message}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Tanggal
          </label>
          <input
            type="date"
            {...register('date', { required: 'Tanggal harus diisi' })}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all cursor-pointer"
          />
          {errors.date && (
            <p className="mt-1.5 text-xs text-rose-400">{errors.date.message}</p>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Catatan <span className="text-gray-500">(opsional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Tambahkan catatan..."
            {...register('note')}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading
              ? 'Menyimpan...'
              : defaultValues
                ? 'Perbarui'
                : 'Tambah Transaksi'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700/50 rounded-xl transition-all hover:bg-gray-700/50 cursor-pointer"
            >
              Batal
            </button>
          )}
        </div>
      </form>
      <CategoryManager 
        isOpen={showCategoryManager} 
        onClose={() => setShowCategoryManager(false)} 
        defaultType={transactionType}
      />
    </>
  );
}
