'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getProducts, addProduct, updateProduct, deleteProduct, Product
} from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
import { formatPrice } from '@/lib/utils';
import {
  Plus, Pencil, Trash2, X, Save, Settings, Zap, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY: Omit<Product, 'id'> = {
  nameAr: '',
  nameEn: '',
  descAr: '',
  descEn: '',
  price: 0,
  image: '',
  category: 'Scrubs',
  stock: 0,
  images: [],
  variants: []
};

export default function AdminProductsPage() {
  const locale = useLocale();
  const t = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [flashSaleHours, setFlashSaleHours] = useState(24);

  const load = () => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing({ ...EMPTY } as any);
    setIsNew(true);
    setFlashSaleHours(24);
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p });
    setIsNew(false);
  };

  const close = () => {
    setEditing(null);
    setIsNew(false);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.nameAr || !editing.nameEn || editing.price <= 0) {
      toast.error(locale === 'ar' ? 'أكمل البيانات' : 'Fill all fields');
      return;
    }
    try {
      if (isNew) {
        const { id, ...data } = editing as any;
        await addProduct(data);
        toast.success(locale === 'ar' ? 'تمت الإضافة ✓' : 'Added ✓');
      } else {
        const { id, ...data } = editing as any;
        await updateProduct(id, data);
        toast.success(locale === 'ar' ? 'تم التحديث ✓' : 'Updated ✓');
      }
      close();
      load();
    } catch (e) {
      toast.error(t('auth.error'));
    }
  };

  const remove = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'تأكيد الحذف؟' : 'Confirm delete?')) return;
    await deleteProduct(id);
    toast.success(locale === 'ar' ? 'تم الحذف' : 'Deleted');
    load();
  };

  const toggleFlashSale = (enabled: boolean) => {
    if (!editing) return;

    if (enabled) {
      setEditing({
        ...editing,
        flashSale: {
          enabled: true,
          discountPercent: editing.flashSale?.discountPercent || 20,
          endsAt: Timestamp.fromDate(
            new Date(Date.now() + flashSaleHours * 60 * 60 * 1000)
          )
        }
      });
    } else {
      const { flashSale, ...rest } = editing as any;
      setEditing(rest);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2
          className="text-xl font-black"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {t('admin.products')}
        </h2>
        <button onClick={openNew} className="btn-primary py-2 px-4">
          <Plus size={18} />
          {t('admin.addProduct')}
        </button>
      </div>

      {/* Loading / Empty / List */}
      {loading ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-muted)'
          }}
        >
          {t('common.loading')}
        </div>
      ) : products.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-muted)'
          }}
        >
          {locale === 'ar'
            ? 'لا توجد منتجات — أضف أول منتج'
            : 'No products — add the first one'}
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-x-auto"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid rgba(212, 175, 55, 0.15)'
          }}
        >
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--color-bg-elevated)' }}>
              <tr>
                <th
                  className="p-3 text-start"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {locale === 'ar' ? 'المنتج' : 'Product'}
                </th>
                <th
                  className="p-3 text-start"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {locale === 'ar' ? 'التصنيف' : 'Category'}
                </th>
                <th
                  className="p-3 text-start"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {locale === 'ar' ? 'السعر' : 'Price'}
                </th>
                <th
                  className="p-3 text-start"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {locale === 'ar' ? 'الكمية' : 'Stock'}
                </th>
                <th
                  className="p-3 text-start"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th
                  className="p-3 text-start"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {locale === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const flashSaleActive =
                  p.flashSale?.enabled &&
                  p.flashSale.endsAt &&
                  p.flashSale.endsAt.toMillis() > Date.now();

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderTop: '1px solid rgba(212, 175, 55, 0.1)'
                    }}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.nameAr}
                          className="w-12 h-12 rounded-lg object-cover"
                          style={{
                            border: '1px solid rgba(212, 175, 55, 0.2)'
                          }}
                        />
                        <div className="min-w-0">
                          <p
                            className="font-semibold line-clamp-1"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {p.nameAr}
                          </p>
                          <p
                            className="text-xs line-clamp-1"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {p.nameEn}
                          </p>
                          {p.variants && p.variants.length > 0 && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded mt-1 inline-block"
                              style={{
                                background: 'rgba(212, 175, 55, 0.15)',
                                color: 'var(--color-secondary-500)'
                              }}
                            >
                              {p.variants.length}{' '}
                              {locale === 'ar' ? 'خيار' : 'variants'}
                            </span>
                          )}
                          {p.images && p.images.length > 0 && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded mt-1 inline-block mr-1"
                              style={{
                                background: 'rgba(59, 130, 246, 0.15)',
                                color: '#3b82f6'
                              }}
                            >
                              {p.images.length + 1}{' '}
                              {locale === 'ar' ? 'صور' : 'images'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: 'rgba(212, 175, 55, 0.15)',
                          color: 'var(--color-secondary-500)'
                        }}
                      >
                        {p.category}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col">
                        <span
                          className="font-bold"
                          style={{ color: 'var(--color-secondary-500)' }}
                        >
                          {formatPrice(p.price, locale)}
                        </span>
                        {p.oldPrice && p.oldPrice > p.price && (
                          <span
                            className="text-xs line-through"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {formatPrice(p.oldPrice, locale)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className="font-bold"
                        style={{
                          color:
                            p.stock > 0
                              ? '#10b981'
                              : p.stock > 5
                                ? 'var(--color-text-primary)'
                                : '#ef4444'
                        }}
                      >
                        {p.stock}
                      </span>
                      {p.stock > 0 && p.stock < 5 && (
                        <span
                          className="text-xs block"
                          style={{ color: '#f59e0b' }}
                        >
                          ⚠️ {locale === 'ar' ? 'قليل' : 'Low'}
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {flashSaleActive && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                            style={{
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#f59e0b'
                            }}
                          >
                            <Zap size={10} />
                            Flash -{p.flashSale!.discountPercent}%
                          </span>
                        )}
                        {!flashSaleActive && p.stock > 0 && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-bold"
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10b981'
                            }}
                          >
                            {locale === 'ar' ? 'نشط' : 'Active'}
                          </span>
                        )}
                        {p.stock === 0 && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-bold"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#ef4444'
                            }}
                          >
                            {locale === 'ar' ? 'نفذ' : 'Out'}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex gap-1.5">
                        <Link
                          href={`/${locale}/admin/products/${p.id}`}
                          className="p-2 rounded-lg transition-colors"
                          title={
                            locale === 'ar'
                              ? 'الصور والخيارات'
                              : 'Images & Variants'
                          }
                          style={{
                            background: 'rgba(139, 92, 246, 0.15)',
                            color: '#8b5cf6'
                          }}
                        >
                          <Settings size={16} />
                        </Link>
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg transition-colors"
                          title={locale === 'ar' ? 'تعديل' : 'Edit'}
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#3b82f6'
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => remove(p.id!)}
                          className="p-2 rounded-lg transition-colors"
                          title={locale === 'ar' ? 'حذف' : 'Delete'}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============ MODAL ============ */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(10, 24, 40, 0.85)' }}
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex justify-between items-center p-5 sticky top-0 z-10"
                style={{
                  background: 'var(--color-bg-card)',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
                }}
              >
                <h3
                  className="font-black text-lg"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {isNew ? t('admin.addProduct') : t('admin.editProduct')}
                </h3>
                <button
                  onClick={close}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('admin.fields.nameAr')}</label>
                  <input
                    value={editing.nameAr}
                    onChange={(e) =>
                      setEditing({ ...editing, nameAr: e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">{t('admin.fields.nameEn')}</label>
                  <input
                    value={editing.nameEn}
                    onChange={(e) =>
                      setEditing({ ...editing, nameEn: e.target.value })
                    }
                    className="input"
                    dir="ltr"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">{t('admin.fields.descAr')}</label>
                  <textarea
                    value={editing.descAr}
                    onChange={(e) =>
                      setEditing({ ...editing, descAr: e.target.value })
                    }
                    rows={2}
                    className="input resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">{t('admin.fields.descEn')}</label>
                  <textarea
                    value={editing.descEn}
                    onChange={(e) =>
                      setEditing({ ...editing, descEn: e.target.value })
                    }
                    rows={2}
                    className="input resize-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="label">{t('admin.fields.price')}</label>
                  <input
                    type="number"
                    value={editing.price}
                    onChange={(e) =>
                      setEditing({ ...editing, price: +e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">{t('admin.fields.oldPrice')}</label>
                  <input
                    type="number"
                    value={editing.oldPrice || ''}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        oldPrice: +e.target.value || undefined
                      })
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">{t('admin.fields.category')}</label>
                  <input
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                    className="input"
                    list="categories"
                  />
                  <datalist id="categories">
                    <option value="Scrubs" />
                    <option value="Lab Coats" />
                    <option value="Equipment" />
                    <option value="Accessories" />
                    <option value="Medicines" />
                    <option value="Tools" />
                  </datalist>
                </div>

                <div>
                  <label className="label">{t('admin.fields.stock')}</label>
                  <input
                    type="number"
                    value={editing.stock}
                    onChange={(e) =>
                      setEditing({ ...editing, stock: +e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">{t('admin.fields.image')}</label>
                  <input
                    value={editing.image}
                    onChange={(e) =>
                      setEditing({ ...editing, image: e.target.value })
                    }
                    className="input"
                    dir="ltr"
                    placeholder="https://..."
                  />
                </div>

                {editing.image && (
                  <div className="md:col-span-2">
                    <img
                      src={editing.image}
                      alt="preview"
                      className="w-32 h-32 object-cover rounded-xl"
                      style={{ border: '1px solid rgba(212, 175, 55, 0.2)' }}
                    />
                  </div>
                )}

                {/* ============ FLASH SALE ============ */}
                <div
                  className="md:col-span-2 p-4 rounded-2xl"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="flashSaleToggle"
                      checked={editing.flashSale?.enabled || false}
                      onChange={(e) => toggleFlashSale(e.target.checked)}
                      className="w-5 h-5 rounded cursor-pointer"
                      style={{ accentColor: '#f59e0b' }}
                    />
                    <label
                      htmlFor="flashSaleToggle"
                      className="font-bold cursor-pointer flex items-center gap-2"
                      style={{ color: '#f59e0b' }}
                    >
                      <Zap size={18} />
                      {locale === 'ar'
                        ? 'تفعيل عرض فلاش ⚡'
                        : 'Enable Flash Sale ⚡'}
                    </label>
                  </div>

                  {editing.flashSale?.enabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div>
                        <label
                          className="text-xs font-bold block mb-1"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {locale === 'ar' ? 'نسبة الخصم %' : 'Discount %'}
                        </label>
                        <input
                          type="number"
                          value={editing.flashSale.discountPercent}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              flashSale: {
                                ...editing.flashSale!,
                                discountPercent: Math.min(
                                  90,
                                  Math.max(5, +e.target.value)
                                )
                              }
                            })
                          }
                          min={5}
                          max={90}
                          className="input py-2"
                        />
                      </div>
                      <div>
                        <label
                          className="text-xs font-bold block mb-1"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          <Clock
                            size={12}
                            className="inline mr-1"
                            style={{ verticalAlign: 'middle' }}
                          />
                          {locale === 'ar'
                            ? 'ينتهي بعد (ساعات)'
                            : 'Ends in (hours)'}
                        </label>
                        <input
                          type="number"
                          value={flashSaleHours}
                          onChange={(e) => {
                            const hours = Math.max(1, +e.target.value);
                            setFlashSaleHours(hours);
                            setEditing({
                              ...editing,
                              flashSale: {
                                ...editing.flashSale!,
                                endsAt: Timestamp.fromDate(
                                  new Date(
                                    Date.now() + hours * 60 * 60 * 1000
                                  )
                                )
                              }
                            });
                          }}
                          min={1}
                          max={720}
                          className="input py-2"
                        />
                      </div>

                      <div className="col-span-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {locale === 'ar'
                          ? `ينتهي في: ${new Date(
                              Date.now() + flashSaleHours * 60 * 60 * 1000
                            ).toLocaleString('ar-EG')}`
                          : `Ends at: ${new Date(
                              Date.now() + flashSaleHours * 60 * 60 * 1000
                            ).toLocaleString('en-US')}`}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Notice for images/variants */}
                {!isNew && editing.id && (
                  <div
                    className="md:col-span-2 p-4 rounded-2xl flex items-start gap-3"
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    <Settings
                      size={20}
                      style={{ color: '#8b5cf6', flexShrink: 0, marginTop: 2 }}
                    />
                    <div>
                      <p
                        className="text-sm font-bold mb-1"
                        style={{ color: '#8b5cf6' }}
                      >
                        {locale === 'ar'
                          ? 'صور متعددة وخيارات'
                          : 'Multiple Images & Variants'}
                      </p>
                      <p
                        className="text-xs mb-2"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {locale === 'ar'
                          ? 'لإضافة صور متعددة ومقاسات وألوان، افتح الصفحة المتقدمة.'
                          : 'To add multiple images, sizes, and colors, open the advanced page.'}
                      </p>
                      <Link
                        href={`/${locale}/admin/products/${editing.id}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm"
                        style={{
                          background: 'rgba(139, 92, 246, 0.2)',
                          color: '#8b5cf6',
                          border: '1px solid rgba(139, 92, 246, 0.4)'
                        }}
                      >
                        <Settings size={14} />
                        {locale === 'ar'
                          ? 'افتح الصفحة المتقدمة'
                          : 'Open Advanced Page'}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="flex gap-3 p-5 sticky bottom-0"
                style={{
                  background: 'var(--color-bg-card)',
                  borderTop: '1px solid rgba(212, 175, 55, 0.15)'
                }}
              >
                <button onClick={save} className="btn-primary flex-1">
                  <Save size={18} />
                  {t('admin.save')}
                </button>
                <button onClick={close} className="btn-outline flex-1">
                  {t('admin.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}