'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Check } from 'lucide-react';
import { ProductVariant, VariantCombination } from '@/lib/firestore';

type Props = {
  variants: ProductVariant[];
  combinations?: VariantCombination[];
  onSelectionChange: (
    selected: ProductVariant[],
    effectiveStock: number,
    priceAdjustment: number
  ) => void;
};

export default function VariantSelector({
  variants,
  combinations = [],
  onSelectionChange
}: Props) {
  const locale = useLocale();
  const [selected, setSelected] = useState<Record<string, string>>({});

  // قسّم الـ variants حسب النوع
  const sizes = variants.filter((v) => v.type === 'size');
  const colors = variants.filter((v) => v.type === 'color');
  const others = variants.filter((v) => v.type === 'other');

  // ✅ اختر افتراضي: أول variant متاح من كل نوع
  useEffect(() => {
    const initial: Record<string, string> = {};

    if (sizes.length > 0) {
      const firstAvailable = sizes.find((v) => v.stock > 0) || sizes[0];
      initial.size = firstAvailable.id;
    }
    if (colors.length > 0) {
      const firstAvailable = colors.find((v) => v.stock > 0) || colors[0];
      initial.color = firstAvailable.id;
    }
    if (others.length > 0) {
      const firstAvailable = others.find((v) => v.stock > 0) || others[0];
      initial.other = firstAvailable.id;
    }

    setSelected(initial);
  }, [variants]);

  // 🎯 احسب المخزون الفعلي والسعر
  useEffect(() => {
    const selectedVariants: ProductVariant[] = [];
    let totalAdjustment = 0;

    Object.entries(selected).forEach(([type, id]) => {
      const variant = variants.find((v) => v.id === id);
      if (variant) {
        selectedVariants.push(variant);
        totalAdjustment += variant.priceAdjustment || 0;
      }
    });

    let effectiveStock = 0;

    if (selectedVariants.length > 0) {
      if (combinations.length > 0) {
        const selectedIds = [...selectedVariants.map((v) => v.id)].sort();
        const combo = combinations.find(
          (c) =>
            c.variantIds.length === selectedIds.length &&
            [...c.variantIds].sort().every((id, i) => id === selectedIds[i])
        );

        if (combo) {
          effectiveStock = combo.stock;
          totalAdjustment += combo.priceAdjustment || 0;
        } else {
          effectiveStock = Math.min(
            ...selectedVariants.map((v) => v.stock)
          );
        }
      } else {
        effectiveStock = Math.min(...selectedVariants.map((v) => v.stock));
      }
    }

    onSelectionChange(selectedVariants, effectiveStock, totalAdjustment);
  }, [selected, variants, combinations, onSelectionChange]);

  // 🎯 هل الـ variant متاح بناءً على الاختيارات الحالية؟
  const isVariantAvailable = (
    type: 'size' | 'color' | 'other',
    variant: ProductVariant
  ): boolean => {
    if (combinations.length > 0) {
      const otherSelections = { ...selected };
      delete otherSelections[type];

      if (Object.keys(otherSelections).length === 0) {
        return variant.stock > 0;
      }

      const testIds = [...Object.values(otherSelections), variant.id].sort();

      const combo = combinations.find(
        (c) =>
          c.variantIds.length === testIds.length &&
          [...c.variantIds].sort().every((id, i) => id === testIds[i])
      );

      return combo ? combo.stock > 0 : false;
    }

    return variant.stock > 0;
  };

  // اختر variant
  const handleSelect = (type: string, variantId: string) => {
    setSelected((prev) => ({ ...prev, [type]: variantId }));
  };

  const renderGroup = (
    label: { ar: string; en: string },
    list: ProductVariant[],
    type: 'size' | 'color' | 'other',
    isColor: boolean = false
  ) => {
    if (list.length === 0) return null;

    const selectedId = selected[type];
    const selectedVariant = list.find((v) => v.id === selectedId);

    return (
      <div className="mb-5">
        <label
          className="font-bold mb-3 block text-sm flex items-center gap-2 flex-wrap"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {locale === 'ar' ? label.ar : label.en}
          {selectedVariant && (
            <span
              className="text-xs font-normal px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(212, 175, 55, 0.15)',
                color: 'var(--color-secondary-500)'
              }}
            >
              {selectedVariant.name}
            </span>
          )}
        </label>

        <div className="flex flex-wrap gap-2">
          {list.map((variant) => {
            const isSelected = selectedId === variant.id;
            const available = isVariantAvailable(type, variant);

            // هل في تعديل سعر حقيقي (ليس 0 أو undefined)
            const hasPriceAdjustment =
              typeof variant.priceAdjustment === 'number' &&
              variant.priceAdjustment !== 0;

            if (isColor) {
              return (
                <motion.button
                  key={variant.id}
                  type="button"
                  onClick={() => available && handleSelect(type, variant.id)}
                  disabled={!available}
                  whileHover={available ? { scale: 1.1 } : {}}
                  whileTap={available ? { scale: 0.9 } : {}}
                  className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: variant.hexColor || variant.name,
                    border: isSelected
                      ? '3px solid var(--color-secondary-500)'
                      : '3px solid rgba(212, 175, 55, 0.3)',
                    boxShadow: isSelected
                      ? '0 0 20px rgba(212, 175, 55, 0.5)'
                      : 'none',
                    opacity: !available ? 0.3 : 1,
                    cursor: !available ? 'not-allowed' : 'pointer'
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
                      <Check
                        size={14}
                        style={{ color: '#0a1828' }}
                        strokeWidth={3}
                      />
                    </motion.div>
                  )}
                  {!available && (
                    <div className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none">
                      <div className="w-full h-0.5 bg-red-500 rotate-45 absolute" />
                    </div>
                  )}
                </motion.button>
              );
            }

            return (
              <motion.button
                key={variant.id}
                type="button"
                onClick={() => available && handleSelect(type, variant.id)}
                disabled={!available}
                whileHover={available ? { scale: 1.05 } : {}}
                whileTap={available ? { scale: 0.95 } : {}}
                className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all relative min-w-[60px]"
                style={{
                  background: isSelected
                    ? `linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-600))`
                    : 'var(--color-bg-card)',
                  color: isSelected ? '#0a1828' : 'var(--color-text-primary)',
                  border: isSelected
                    ? '2px solid var(--color-secondary-500)'
                    : '2px solid rgba(212, 175, 55, 0.2)',
                  opacity: !available ? 0.4 : 1,
                  cursor: !available ? 'not-allowed' : 'pointer',
                  textDecoration: !available ? 'line-through' : 'none'
                }}
              >
                <span>{variant.name}</span>
                {hasPriceAdjustment && (
                  <span className="text-xs ml-1">
                    {variant.priceAdjustment! > 0 ? '+' : ''}
                    {variant.priceAdjustment}
                  </span>
                )}

                {/* ✅ يظهر رقم المخزون فقط لو أقل من 5 وأكبر من 0 وغير مختار */}
                {available &&
                  variant.stock > 0 &&
                  variant.stock <= 5 &&
                  !isSelected && (
                    <span
                      className="absolute -top-1.5 -right-1.5 text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                      style={{
                        background: '#f59e0b',
                        color: '#fff'
                      }}
                    >
                      {variant.stock}
                    </span>
                  )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  if (variants.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid rgba(212, 175, 55, 0.15)'
      }}
    >
      {sizes.length > 0 &&
        renderGroup({ ar: 'المقاس', en: 'Size' }, sizes, 'size')}
      {colors.length > 0 &&
        renderGroup({ ar: 'اللون', en: 'Color' }, colors, 'color', true)}
      {others.length > 0 &&
        renderGroup({ ar: 'الخيار', en: 'Option' }, others, 'other')}
    </div>
  );
}
