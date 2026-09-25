'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getProduct, updateProduct, Product, ProductVariant
} from '@/lib/firestore';
import {
  ArrowLeft, ArrowRight, Plus, X, Save, Image as ImageIcon,
  Trash2, Palette, Ruler, Package
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newImage, setNewImage] = useState('');

  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    getProduct(id)
      .then((p) => {
        if (!p) {
          router.push(`/${locale}/admin/products`);
          return;
        }
        setProduct(p);
        setImages(p.images || []);
        setVariants(p.variants || []);
      })
      .finally(() => setLoading(false));
  }, [params, locale, router]);

  // ============ IMAGES ============
  const addImage = () => {
    if (!newImage.trim()) return;
    if (images.includes(newImage.trim())) {
      toast.error(locale === 'ar' ? 'الصورة مضافة بالفعل' : 'Already added');
      return;
    }
    setImages([...images, newImage.trim()]);
    setNewImage('');
  };

  const removeImage = (url: string) => {
    setImages(images.filter((i) => i !== url));
  };

  // ============ VARIANTS ============
  const addVariant = (type: 'size' | 'color' | 'other') => {
    const newVariant: ProductVariant = {
      id: `v_${Date.now()}`,
      name: '',
      type,
      stock: 0,
      priceAdjustment: 0,
      ...(type === 'color' && { hexColor: '#000000' })
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (id: string, data: Partial<ProductVariant>) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, ...data } : v))
    );
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  // ============ SAVE ============
  const handleSave = async () => {
    if (!product?.id) return;
    setSaving(true);
    try {
      await updateProduct(product.id, { images, variants });
      toast.success(locale === 'ar' ? 'تم الحفظ ✓' : 'Saved ✓');
      router.push(`/${locale}/admin/products`);
    } catch {
      toast.error(t('auth.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div
          className="w-12 h-12 rounded-full animate-spin mx-auto"
          style={{
            border: '4px solid var(--color-secondary-500)',
            borderTopColor: 'transparent'
          }}
        />
      </div>
    );
  }

  if (!product) return null;

  const name = locale === 'ar' ? product.nameAr : product.nameEn;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <Link
            href={`/${locale}/admin/products`}
            className="inline-flex items-center gap-2 mb-2 text-sm font-semibold"
            style={{ color: 'var(--color-secondary-500)' }}
          >
            <Arrow size={16} />
            {locale === 'ar' ? 'رجوع للمنتجات' : 'Back to Products'}
          </Link>
          <h1
            className="text-2xl font-black"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {locale === 'ar' ? 'تحرير:' : 'Edit:'} {name}
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {locale === 'ar' ? 'حفظ' : 'Save'}
        </button>
      </div>

      {/* ============ IMAGES ============ */}
      <div
        className="rounded-3xl p-6 mb-6"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <h2
          className="font-black mb-4 flex items-center gap-2 text-lg"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <ImageIcon size={22} style={{ color: 'var(--color-secondary-500)' }} />
          {locale === 'ar' ? 'صور المنتج' : 'Product Images'}
        </h2>

        {/* Add image */}
        <div className="flex gap-2 mb-4">
          <input
            type="url"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="https://..."
            className="input flex-1"
            dir="ltr"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImage();
              }
            }}
          />
          <button onClick={addImage} className="btn-secondary px-4">
            <Plus size={18} />
          </button>
        </div>

        {/* Images grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AnimatePresence>
              {images.map((url, i) => (
                <motion.div
                  key={url}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative aspect-square rounded-xl overflow-hidden group"
                  style={{ border: '1px solid rgba(212, 175, 55, 0.2)' }}
                >
                  <img
                    src={url}
                    alt={`Image ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(url)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: '#ef4444', color: '#fff' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {images.length === 0 && (
          <p
            className="text-sm text-center py-6"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {locale === 'ar'
              ? 'لا توجد صور متعددة بعد. الصورة الأساسية هي الأولى.'
              : 'No additional images yet.'}
          </p>
        )}
      </div>

      {/* ============ VARIANTS ============ */}
      <div
        className="rounded-3xl p-6"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2
            className="font-black flex items-center gap-2 text-lg"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Package
              size={22}
              style={{ color: 'var(--color-secondary-500)' }}
            />
            {locale === 'ar' ? 'الخيارات (Variants)' : 'Variants'}
          </h2>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => addVariant('size')}
              className="px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              <Ruler size={14} />
              {locale === 'ar' ? 'مقاس' : 'Size'}
            </button>
            <button
              onClick={() => addVariant('color')}
              className="px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <Palette size={14} />
              {locale === 'ar' ? 'لون' : 'Color'}
            </button>
            <button
              onClick={() => addVariant('other')}
              className="px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#8b5cf6',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}
            >
              <Plus size={14} />
              {locale === 'ar' ? 'أخرى' : 'Other'}
            </button>
          </div>
        </div>

        {/* Variants list */}
        {variants.length === 0 ? (
          <p
            className="text-sm text-center py-6"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {locale === 'ar'
              ? 'لا توجد خيارات بعد. اضغط أزرار الإضافة بالأعلى.'
              : 'No variants yet. Click add buttons above.'}
          </p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {variants.map((v) => (
                <motion.div
                  key={v.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid rgba(212, 175, 55, 0.15)'
                  }}
                >
                  {/* Type badge */}
                  <div className="md:col-span-5 flex items-center justify-between">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-bold"
                      style={{
                        background:
                          v.type === 'size'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : v.type === 'color'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(139, 92, 246, 0.15)',
                        color:
                          v.type === 'size'
                            ? '#3b82f6'
                            : v.type === 'color'
                              ? '#ef4444'
                              : '#8b5cf6'
                      }}
                    >
                      {v.type === 'size'
                        ? locale === 'ar'
                          ? 'مقاس'
                          : 'Size'
                        : v.type === 'color'
                          ? locale === 'ar'
                            ? 'لون'
                            : 'Color'
                          : locale === 'ar'
                            ? 'أخرى'
                            : 'Other'}
                    </span>
                    <button
                      onClick={() => removeVariant(v.id)}
                      className="p-1.5 rounded-lg"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-xs font-bold block mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {locale === 'ar' ? 'الاسم' : 'Name'}
                    </label>
                    <input
                      value={v.name}
                      onChange={(e) =>
                        updateVariant(v.id, { name: e.target.value })
                      }
                      placeholder={v.type === 'size' ? 'M / L / XL' : v.type === 'color' ? 'أحمر' : 'خيار'}
                      className="input py-2 text-sm"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="text-xs font-bold block mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {locale === 'ar' ? 'المخزون' : 'Stock'}
                    </label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(v.id, { stock: +e.target.value })
                      }
                      min={0}
                      className="input py-2 text-sm"
                    />
                  </div>

                  {/* Price adjustment */}
                  <div>
                    <label className="text-xs font-bold block mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {locale === 'ar' ? 'السعر +/-' : 'Price +/-'}
                    </label>
                    <input
                      type="number"
                      value={v.priceAdjustment || 0}
                      onChange={(e) =>
                        updateVariant(v.id, {
                          priceAdjustment: +e.target.value
                        })
                      }
                      className="input py-2 text-sm"
                    />
                  </div>

                  {/* Hex color */}
                  {v.type === 'color' && (
                    <div>
                      <label className="text-xs font-bold block mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {locale === 'ar' ? 'اللون' : 'Color'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={v.hexColor || '#000000'}
                          onChange={(e) =>
                            updateVariant(v.id, { hexColor: e.target.value })
                          }
                          className="w-12 h-10 rounded-lg cursor-pointer border-2"
                          style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}
                        />
                        <input
                          value={v.hexColor || '#000000'}
                          onChange={(e) =>
                            updateVariant(v.id, { hexColor: e.target.value })
                          }
                          className="input py-2 text-sm flex-1 font-mono"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}