import { useState, useRef, useEffect } from 'react';

// Category emoji/icon mapping
const CATEGORY_ICONS = {
  'Makanan': '🍔',
  'Transportasi': '🚗',
  'Belanja': '🛒',
  'Hiburan': '🎮',
  'Kesehatan': '💊',
  'Pendidikan': '📚',
  'Tagihan': '📄',
  'Gaji': '💰',
  'Investasi': '📈',
  'Uang Jajan': '💵',
  'Lainnya': '📦',
};

function getCategoryIcon(name) {
  return CATEGORY_ICONS[name] || '🏷️';
}

export default function CategoryDropdown({ categories, value, onChange, error, transactionType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens (only on desktop to prevent unwanted mobile keyboard popup)
  useEffect(() => {
    if (isOpen && searchRef.current && window.innerWidth >= 768) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (cat) => {
    onChange(cat);
    setIsOpen(false);
    setSearch('');
  };

  const accentColor = transactionType === 'income' ? 'emerald' : 'rose';

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 border rounded-xl text-left transition-all cursor-pointer ${
          isOpen
            ? 'border-violet-500/50 ring-2 ring-violet-500/50'
            : error
              ? 'border-rose-500/50'
              : 'border-gray-700/50 hover:border-gray-600/50'
        }`}
      >
        {value ? (
          <>
            <span className="text-xl md:text-lg leading-none">{getCategoryIcon(value)}</span>
            <span className="text-white font-medium text-base md:text-sm flex-1">{value}</span>
          </>
        ) : (
          <>
            <span className="text-xl md:text-lg leading-none opacity-40">🏷️</span>
            <span className="text-gray-500 text-base md:text-sm flex-1">Pilih kategori...</span>
          </>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-scale-in origin-top">
          {/* Search input */}
          {categories.length > 4 && (
            <div className="p-2 border-b border-gray-800/60">
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kategori..."
                  className="w-full pl-8 pr-3 py-2.5 md:py-2 bg-gray-800/60 border border-gray-700/40 rounded-lg text-base md:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all"
                />
              </div>
            </div>
          )}

          {/* Category list */}
          <div className="max-h-60 md:max-h-52 overflow-y-auto overflow-x-hidden custom-scrollbar py-1 px-1">
            {filteredCategories.length === 0 ? (
              <div className="px-3 py-8 md:py-6 text-center text-gray-500 text-sm md:text-xs">
                Tidak ada kategori yang cocok
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isSelected = cat === value;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelect(cat)}
                    className={`w-full flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-left transition-all cursor-pointer group ${
                      isSelected
                        ? `bg-${accentColor}-500/10 text-white`
                        : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                    }`}
                    style={isSelected ? {
                      backgroundColor: transactionType === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)'
                    } : undefined}
                  >
                    <span className={`text-xl md:text-base leading-none transition-transform group-hover:scale-110 ${isSelected ? '' : 'grayscale group-hover:grayscale-0'}`}>
                      {getCategoryIcon(cat)}
                    </span>
                    <span className="text-base md:text-sm font-medium flex-1">{cat}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
