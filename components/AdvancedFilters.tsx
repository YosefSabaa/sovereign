'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Sliders, X, ChevronDown, Check } from 'lucide-react';

export type FilterState = {
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStock: boolean;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'rating';
};

type Props = {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  categories: string[];
  maxPrice: number;
};

export default function AdvancedFilters({
  filters,
  onChange,
  categories,
  maxPrice
}: Props) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const sortOptions = [
    { value: 'newest', ar: 'الأحدث', en: 'Newest' },
    { value: 'price-asc', ar: 'الأرخص', en: 'Price: Low → High' },
    { value: 'price-desc', ar: 'الأغلى', en: 'Price: High → Low' },
    { value: 'rating', ar: 'الأعلى تقييماً', en: 'Top Rated' }
  ];

  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  const activeFiltersCount =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice < maxPrice ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  const clearAll = () => {
    onChange({
      category: 'all',
      minPrice: 0,
      maxPrice,
      minRating: 0,
      inStock: false,
      sortBy: 'newest'
    });
  };

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold transition-all"
          style={{
            background: open
              ? 'var(--color-secondary-500)'
              : 'var(--color-bg-card)',
            color: open ? '#0a1828' : 'var(--color-text-primary)',
            border: '2px solid rgba(212, 175, 55, 0.3)'
          }}
        >
          <Sliders size={18} />
          {locale === 'ar' ? 'فلاتر متقدمة' : 'Advanced Filters'}
          {activeFiltersCount > 0 && (
            <span
              className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-black"
              style={{
                background: open ? '#0a1828' : 'var(--color-secondary-500)',
                color: open ? 'var(--color-secondary-500)' : '#0a1828'
              }}
            >
              {activeFiltersCount}
            </span>
          )}
        </motion.button>

        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => update({ sortBy: e.target.value as any })}
            className="appearance-none px-5 py-2.5 pr-10 rounded-full font-bold outline-none cursor-pointer"
            style={{
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              border: '2px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {locale === 'ar' ? opt.ar : opt.en}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none"
            style={{ color: 'var(--color-secondary-500)' }}
          />
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAll}
            className="text-sm font-bold flex items-center gap-1"
            style={{ color: '#ef4444' }}
          >
            <X size={14} />
            {locale === 'ar' ? 'مسح الكل' : 'Clear all'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div
              className="rounded-2xl p-6 space-y-5"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid rgba(212, 175, 55, 0.2)'
              }}
            >
              <div>
                <label
                  className="font-bold mb-3 block text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {locale === 'ar' ? 'نطاق السعر' : 'Price Range'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => update({ minPrice: +e.target.value })}
                    min={0}
                    max={filters.maxPrice}
                    placeholder="Min"
                    className="input flex-1 py-2 text-sm"
                  />
                  <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => update({ maxPrice: +e.target.value })}
                    min={filters.minPrice}
                    max={maxPrice}
                    placeholder="Max"
                    className="input flex-1 py-2 text-sm"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={filters.maxPrice}
                  onChange={(e) => update({ maxPrice: +e.target.value })}
                  className="w-full mt-3"
                  style={{ accentColor: 'var(--color-secondary-500)' }}
                />
              </div>

              <div>
                <label
                  className="font-bold mb-3 block text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {locale === 'ar' ? 'التقييم الأدنى' : 'Minimum Rating'}
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((r) => (
                    <button
                      key={r}
                      onClick={() => update({ minRating: r })}
                      className="flex-1 py-2 rounded-lg font-bold text-sm transition-all"
                      style={{
                        background:
                          filters.minRating === r
                            ? 'var(--color-secondary-500)'
                            : 'var(--color-bg-elevated)',
                        color:
                          filters.minRating === r
                            ? '#0a1828'
                            : 'var(--color-text-secondary)',
                        border: '1px solid rgba(212, 175, 55, 0.2)'
                      }}
                    >
                      {r === 0 ? (locale === 'ar' ? 'الكل' : 'All') : `${r}★+`}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => update({ inStock: !filters.inStock })}
                className="flex items-center gap-3 w-full p-3 rounded-xl transition-all"
                style={{
                  background: filters.inStock
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'var(--color-bg-elevated)',
                  border: `2px solid ${
                    filters.inStock
                      ? 'rgba(16, 185, 129, 0.4)'
                      : 'rgba(212, 175, 55, 0.15)'
                  }`
                }}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                  style={{
                    background: filters.inStock ? '#10b981' : 'transparent',
                    border: filters.inStock
                      ? 'none'
                      : '2px solid rgba(212, 175, 55, 0.3)'
                  }}
                >
                  {filters.inStock && (
                    <Check size={14} className="text-white" strokeWidth={3} />
                  )}
                </div>
                <span
                  className="font-bold text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {locale === 'ar' ? 'المتوفر فقط' : 'In stock only'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}