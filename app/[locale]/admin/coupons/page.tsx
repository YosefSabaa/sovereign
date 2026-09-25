'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllCoupons, addCoupon, deleteCoupon, Coupon
} from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
import {
  Plus, Trash2, Tag, Percent, Banknote, Calendar, Users, X, Save
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const locale = useLocale();
  const t = useTranslations();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    'percentage'
  );
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrder, setMinOrder] = useState<number | ''>('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [expiryDays, setExpiryDays] = useState<number | ''>('');

  const load = () => {
    setLoading(true);
    getAllCoupons()
      .then(setCoupons)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinOrder('');
    setUsageLimit('');
    setExpiryDays('');
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountValue <= 0) {
      toast.error(locale === 'ar' ? 'أكمل البيانات' : 'Complete data');
      return;
    }

    if (discountType === 'percentage' && discountValue > 90) {
      toast.error(
        locale === 'ar'
          ? 'نسبة الخصم لازم تكون أقل من 90%'
          : 'Discount must be under 90%'
      );
      return;
    }

    try {
      const couponData: any = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue,
        active: true
      };

      if (minOrder !== '' && minOrder > 0) {
        couponData.minOrder = minOrder;
      }
      if (usageLimit !== '' && usageLimit > 0) {
        couponData.usageLimit = usageLimit;
      }
      if (expiryDays !== '' && expiryDays > 0) {
        couponData.expiresAt = Timestamp.fromDate(
          new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
        );
      }

      await addCoupon(couponData);
      toast.success(locale === 'ar' ? 'تمت الإضافة ✓' : 'Added ✓');
      resetForm();
      setShowForm(false);
      load();
    } catch {
      toast.error(t('auth.error'));
    }
  };

  const remove = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'تأكيد الحذف؟' : 'Confirm delete?')) return;
    await deleteCoupon(id);
    toast.success(locale === 'ar' ? 'تم الحذف' : 'Deleted');
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2
          className="text-xl font-black flex items-center gap-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <Tag size={22} style={{ color: 'var(--color-secondary-500)' }} />
          {t('admin.coupons')}
        </h2>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary py-2 px-4"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm
            ? locale === 'ar'
              ? 'إلغاء'
              : 'Cancel'
            : t('admin.addCoupon')}
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={add}
            className="rounded-2xl p-5 mb-6 overflow-hidden"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="label">
                  {locale === 'ar' ? 'كود الكوبون' : 'Coupon Code'}
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="input"
                  placeholder="SOVEREIGN10"
                  required
                  dir="ltr"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="label">
                  {locale === 'ar' ? 'نوع الخصم' : 'Discount Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className="p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={
                      discountType === 'percentage'
                        ? {
                            background: `linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-600))`,
                            color: '#0a1828',
                            border: '2px solid transparent'
                          }
                        : {
                            background: 'var(--color-bg-elevated)',
                            color: 'var(--color-text-primary)',
                            border: '2px solid rgba(212, 175, 55, 0.2)'
                          }
                    }
                  >
                    <Percent size={16} />
                    {locale === 'ar' ? 'نسبة %' : 'Percentage'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className="p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={
                      discountType === 'fixed'
                        ? {
                            background: `linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-600))`,
                            color: '#0a1828',
                            border: '2px solid transparent'
                          }
                        : {
                            background: 'var(--color-bg-elevated)',
                            color: 'var(--color-text-primary)',
                            border: '2px solid rgba(212, 175, 55, 0.2)'
                          }
                    }
                  >
                    <Banknote size={16} />
                    {locale === 'ar' ? 'مبلغ ثابت' : 'Fixed Amount'}
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="label">
                  {discountType === 'percentage'
                    ? locale === 'ar'
                      ? 'نسبة الخصم %'
                      : 'Discount %'
                    : locale === 'ar'
                      ? 'المبلغ (ج.م)'
                      : 'Amount (EGP)'}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(+e.target.value)}
                  className="input"
                  min={1}
                  max={discountType === 'percentage' ? 90 : 100000}
                  required
                />
              </div>

              {/* Min Order */}
              <div>
                <label className="label">
                  {locale === 'ar'
                    ? 'الحد الأدنى للطلب (اختياري)'
                    : 'Minimum Order (optional)'}
                </label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) =>
                    setMinOrder(e.target.value === '' ? '' : +e.target.value)
                  }
                  className="input"
                  min={0}
                  placeholder={locale === 'ar' ? 'مثال: 200' : 'e.g. 200'}
                />
              </div>

              {/* Usage Limit */}
              <div>
                <label className="label flex items-center gap-2">
                  <Users size={14} />
                  {locale === 'ar'
                    ? 'حد الاستخدام (اختياري)'
                    : 'Usage Limit (optional)'}
                </label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) =>
                    setUsageLimit(e.target.value === '' ? '' : +e.target.value)
                  }
                  className="input"
                  min={1}
                  placeholder={
                    locale === 'ar' ? 'مثال: 100' : 'e.g. 100'
                  }
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="label flex items-center gap-2">
                  <Calendar size={14} />
                  {locale === 'ar'
                    ? 'ينتهي بعد (أيام - اختياري)'
                    : 'Expires in (days - optional)'}
                </label>
                <input
                  type="number"
                  value={expiryDays}
                  onChange={(e) =>
                    setExpiryDays(e.target.value === '' ? '' : +e.target.value)
                  }
                  className="input"
                  min={1}
                  placeholder={locale === 'ar' ? 'مثال: 30' : 'e.g. 30'}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-5 py-3"
            >
              <Save size={18} />
              {locale === 'ar' ? 'حفظ الكوبون' : 'Save Coupon'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* List */}
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
      ) : coupons.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-muted)'
          }}
        >
          {locale === 'ar' ? 'لا توجد كوبونات' : 'No coupons yet'}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => {
            const isPercentage = c.discountType === 'percentage';
            const isExpired =
              c.expiresAt && c.expiresAt.toMillis() < Date.now();
            const isMaxed = c.usageLimit && (c.usageCount || 0) >= c.usageLimit;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5 relative"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  opacity: isExpired || isMaxed ? 0.5 : 1
                }}
              >
                <button
                  onClick={() => remove(c.id!)}
                  className="absolute top-3 right-3 p-2 rounded-lg"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444'
                  }}
                >
                  <Trash2 size={14} />
                </button>

                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isPercentage
                        ? 'rgba(212, 175, 55, 0.15)'
                        : 'rgba(59, 130, 246, 0.15)',
                      color: isPercentage
                        ? 'var(--color-secondary-500)'
                        : '#3b82f6'
                    }}
                  >
                    {isPercentage ? <Percent size={22} /> : <Banknote size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-black text-lg tracking-wider"
                      style={{ color: 'var(--color-text-primary)' }}
                      dir="ltr"
                    >
                      {c.code}
                    </p>
                    <p
                      className="text-sm font-bold mt-0.5"
                      style={{
                        color: isPercentage
                          ? 'var(--color-secondary-500)'
                          : '#3b82f6'
                      }}
                    >
                      {isPercentage
                        ? `-${c.discountValue}%`
                        : `-${c.discountValue} EGP`}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {c.minOrder && (
                    <p
                      className="flex items-center gap-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      💰 {locale === 'ar' ? 'الحد الأدنى:' : 'Min order:'}{' '}
                      {c.minOrder} {locale === 'ar' ? 'ج.م' : 'EGP'}
                    </p>
                  )}

                  {c.usageLimit && (
                    <p
                      className="flex items-center gap-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      👥 {locale === 'ar' ? 'الاستخدام:' : 'Usage:'}{' '}
                      {c.usageCount || 0}/{c.usageLimit}
                    </p>
                  )}

                  {c.expiresAt && (
                    <p
                      className="flex items-center gap-2"
                      style={{
                        color: isExpired
                          ? '#ef4444'
                          : 'var(--color-text-secondary)'
                      }}
                    >
                      📅{' '}
                      {isExpired
                        ? locale === 'ar'
                          ? 'منتهي'
                          : 'Expired'
                        : new Date(c.expiresAt.toMillis()).toLocaleDateString(
                            locale === 'ar' ? 'ar-EG' : 'en-US'
                          )}
                    </p>
                  )}

                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-2"
                    style={{
                      background:
                        c.active && !isExpired && !isMaxed
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                      color:
                        c.active && !isExpired && !isMaxed
                          ? '#10b981'
                          : '#ef4444'
                    }}
                  >
                    {c.active && !isExpired && !isMaxed
                      ? locale === 'ar'
                        ? 'نشط'
                        : 'Active'
                      : isExpired
                        ? locale === 'ar'
                          ? 'منتهي'
                          : 'Expired'
                        : isMaxed
                          ? locale === 'ar'
                            ? 'استُنفذ'
                            : 'Maxed'
                          : locale === 'ar'
                            ? 'معطل'
                            : 'Disabled'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}