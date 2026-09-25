'use client';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Check } from 'lucide-react';
import { ProductVariant } from '@/lib/firestore';

type Props = {
  variants: ProductVariant[];
  selectedId: string | null;
  onSelect: (variant: ProductVariant) => void;
};

export default function VariantSelector({
  variants,
  selectedId,
  onSelect
}: Props) {
  const locale = useLocale();

  if (!variants || variants.length === 0) return null;

  // قسّم الـ variants حسب النوع
  const sizes = variants.filter((v) => v.type === 'size');
  const colors = variants.filter((v) => v.type === 'color');
  const others = variants.filter((v) => v.type === 'other');

  const renderGroup = (
    label: { ar: string; en: string },
    list: ProductVariant[],
    isColor: boolean = false
  ) => (
    <div className="mb-5">
      <label
        className="font-bold mb-3 block text-sm flex items-center gap-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {locale === 'ar' ? label.ar : label.en}
        {selectedId && list.find((v) => v.id === selectedId) && (
          <span
            className="text-xs font-normal px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(212, 175, 55, 0.15)',
              color: 'var(--color-secondary-500)'
            }}
          >
            {list.find((v) => v.id === selectedId)?.name}
          </span>
        )}
      </label>

      <div className="flex flex-wrap gap-2">
        {list.map((variant) => {
          const isSelected = selectedId === variant.id;
          const isOutOfStock = variant.stock === 0;

          if (isColor) {
            return (
              <motion.button
                key={variant.id}
                onClick={() => !isOutOfStock && onSelect(variant)}
                disabled={isOutOfStock}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: variant.hexColor || variant.name,
                  border: isSelected
                    ? '3px solid var(--color-secondary-500)'
                    : '3px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: isSelected
                    ? '0 0 20px rgba(212, 175, 55, 0.5)'
                    : 'none',
                  opacity: isOutOfStock ? 0.4 : 1,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                }}
                title={variant.name}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: 'var(--color-secondary-500)'
                    }}
                  >
                    <Check size={14} style={{ color: '#0a1828' }} strokeWidth={3} />
                  </motion.div>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 rounded-full flex items-center justify-center">
                    <div className="w-full h-0.5 bg-red-500 rotate-45 absolute" />
                  </div>
                )}
              </motion.button>
            );
          }

          return (
            <motion.button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelect(variant)}
              disabled={isOutOfStock}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all relative"
              style={{
                background: isSelected
                  ? 'linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-600))'
                  : 'var(--color-bg-card)',
                color: isSelected
                  ? '#0a1828'
                  : 'var(--color-text-primary)',
                border: isSelected
                  ? '2px solid var(--color-secondary-500)'
                  : '2px solid rgba(212, 175, 55, 0.2)',
                opacity: isOutOfStock ? 0.4 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                textDecoration: isOutOfStock ? 'line-through' : 'none'
              }}
            >
              {variant.name}
              {variant.priceAdjustment && variant.priceAdjustment !== 0 && (
                <span className="text-xs ml-1 block md:inline">
                  {variant.priceAdjustment > 0 ? '+' : ''}
                  {variant.priceAdjustment}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid rgba(212, 175, 55, 0.15)'
      }}
    >
      {sizes.length > 0 && renderGroup({ ar: 'المقاس', en: 'Size' }, sizes)}
      {colors.length > 0 &&
        renderGroup({ ar: 'اللون', en: 'Color' }, colors, true)}
      {others.length > 0 &&
        renderGroup({ ar: 'الخيار', en: 'Option' }, others)}
    </div>
  );
}