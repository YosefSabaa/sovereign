'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/CartProvider';
import { getCoupon } from '@/lib/firestore';
import {
  calculateDiscount,
  toAppliedCoupon,
  describeCoupon,
  AppliedCoupon
} from '@/lib/coupon';
import { formatPrice } from '@/lib/utils';
import PageTransition from '@/components/PageTransition';
import {
  Trash2, Minus, Plus, ShoppingBag, Tag, ArrowLeft, ArrowRight,
  ShoppingCart, Sparkles, X, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { staggerContainer, staggerItem, heartbeat } from '@/lib/animations';

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { items, remove, updateQty, subtotal, clear } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] =
    useState<AppliedCoupon | null>(null);
  const [checking, setChecking] = useState(false);

  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const discount = calculateDiscount(subtotal, appliedCoupon);
  const total = subtotal - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setChecking(true);
    try {
      const c = await getCoupon(couponCode.trim());
      if (!c) {
        toast.error(t('cart.couponInvalid'));
        setAppliedCoupon(null);
      } else {
        if (c.minOrder && subtotal < c.minOrder) {
          toast.error(
            locale === 'ar'
              ? `الحد الأدنى للطلب ${c.minOrder} ج.م`
              : `Minimum order ${c.minOrder} EGP`
          );
          return;
        }
        const applied = toAppliedCoupon(c);
        setAppliedCoupon(applied);
        toast.success(
          `${describeCoupon(applied, locale)} ${
            locale === 'ar' ? 'تم التطبيق!' : 'applied!'
          }`
        );
      }
    } catch {
      toast.error(t('cart.couponInvalid'));
    } finally {
      setChecking(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const goToCheckout = () => {
    sessionStorage.setItem('sovereign_coupon', JSON.stringify(appliedCoupon));
    window.location.href = `/${locale}/checkout`;
  };

  if (items.length === 0) {
    return (
      <PageTransition>
        <div
          className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden"
          style={{ background: 'var(--color-bg-base)' }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ background: 'var(--color-secondary-500)' }}
            />
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-md text-center relative z-10"
          >
            <motion.div
              variants={staggerItem}
              className="relative mx-auto mb-8 w-40 h-40"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{ border: '4px dashed rgba(212, 175, 55, 0.4)' }}
              />
              <motion.div
                animate={heartbeat}
                className="absolute inset-6 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(to bottom right, rgba(212, 175, 55, 0.15), rgba(30, 58, 95, 0.4))`,
                  border: '2px solid rgba(212, 175, 55, 0.4)'
                }}
              >
                <ShoppingBag
                  size={60}
                  style={{ color: 'var(--color-secondary-500)' }}
                />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-3xl font-black mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t('cart.empty')}
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="mb-8"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {t('cart.emptyDesc')}
            </motion.p>

            <motion.div variants={staggerItem}>
              <Link
                href={`/${locale}/products`}
                className="btn-primary inline-flex text-lg px-8 py-4"
              >
                <ShoppingCart size={20} />
                {t('cart.continue')}
                <Arrow size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div
        className="min-h-screen py-10 px-4 relative overflow-hidden"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="max-w-7xl mx-auto relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 flex-wrap gap-4"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={heartbeat}
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
                }}
              >
                <ShoppingCart size={26} style={{ color: '#0a1828' }} />
              </motion.div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-black"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {t('cart.title')}
                </h1>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {items.length} {locale === 'ar' ? 'منتج' : 'items'}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clear}
              className="text-sm font-semibold flex items-center gap-1.5 px-4 py-2.5 rounded-lg transition-colors"
              style={{
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <Trash2 size={16} />
              {locale === 'ar' ? 'حذف الكل' : 'Clear all'}
            </motion.button>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items List */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-2 space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={`${item.productId}_${item.variantId || ''}`}
                    layout
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl p-4 flex gap-4 transition-all group"
                    style={{
                      background: 'var(--color-bg-card)',
                      border: '1px solid rgba(212, 175, 55, 0.15)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <Link
                      href={`/${locale}/product/${item.productId}`}
                      className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ background: 'var(--color-bg-elevated)' }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/${locale}/product/${item.productId}`}
                            className="font-bold line-clamp-2 transition-colors"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {item.name}
                          </Link>
                          {item.variantName && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              {locale === 'ar' ? 'الحجم:' : 'Size:'}{' '}
                              <span
                                style={{
                                  color: 'var(--color-secondary-500)',
                                  fontWeight: 700
                                }}
                              >
                                {item.variantName}
                              </span>
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => remove(item.productId)}
                          className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                          style={{
                            color: 'var(--color-text-muted)',
                            background: 'rgba(239, 68, 68, 0.08)'
                          }}
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <p
                        className="font-black text-lg mt-1"
                        style={{ color: 'var(--color-secondary-500)' }}
                      >
                        {formatPrice(item.price, locale)}
                      </p>

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                        <div
                          className="flex items-center rounded-full overflow-hidden"
                          style={{
                            background: 'var(--color-bg-elevated)',
                            border: '1px solid rgba(212, 175, 55, 0.25)'
                          }}
                        >
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              updateQty(item.productId, item.qty - 1)
                            }
                            className="p-2.5 transition-colors"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            <Minus size={16} />
                          </motion.button>
                          <span
                            className="px-5 font-black min-w-[50px] text-center"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {item.qty}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              updateQty(item.productId, item.qty + 1)
                            }
                            className="p-2.5 transition-colors"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            <Plus size={16} />
                          </motion.button>
                        </div>

                        <p
                          className="font-bold text-sm"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {locale === 'ar' ? 'الإجمالي: ' : 'Total: '}
                          <span
                            className="font-black"
                            style={{ color: 'var(--color-secondary-500)' }}
                          >
                            {formatPrice(item.price * item.qty, locale)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div
                className="rounded-3xl p-6 lg:sticky lg:top-24"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}
              >
                <h2
                  className="text-xl font-black mb-6 flex items-center gap-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <Sparkles
                    size={22}
                    style={{ color: 'var(--color-secondary-500)' }}
                  />
                  {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                </h2>

                {/* Coupon */}
                <div className="mb-6">
                  <label
                    className="flex items-center gap-2 text-sm font-bold mb-3"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <Tag
                      size={16}
                      style={{ color: 'var(--color-secondary-500)' }}
                    />
                    {t('cart.coupon')}
                  </label>

                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        placeholder="SOVEREIGN10"
                        className="input flex-1 text-sm"
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={applyCoupon}
                        disabled={checking}
                        className="btn-secondary px-4 py-2.5 text-sm"
                      >
                        {checking ? '...' : t('cart.apply')}
                      </motion.button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between rounded-xl p-3"
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '2px solid rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          size={20}
                          style={{ color: '#10b981', flexShrink: 0 }}
                        />
                        <div>
                          <p
                            className="font-bold text-sm"
                            style={{ color: '#10b981' }}
                          >
                            {appliedCoupon.code}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {describeCoupon(appliedCoupon, locale)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="p-1"
                        style={{ color: '#ef4444' }}
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Totals */}
                <div
                  className="space-y-3 pt-5"
                  style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}
                >
                  <div
                    className="flex justify-between"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <span>{t('cart.subtotal')}</span>
                    <span className="font-semibold">
                      {formatPrice(subtotal, locale)}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-between"
                      style={{ color: '#10b981' }}
                    >
                      <span>{t('cart.discount')}</span>
                      <span className="font-semibold">
                        -{formatPrice(discount, locale)}
                      </span>
                    </motion.div>
                  )}

                  <div
                    className="flex justify-between text-xl font-black pt-4 mt-2"
                    style={{
                      color: 'var(--color-text-primary)',
                      borderTop: '1px solid rgba(212, 175, 55, 0.15)'
                    }}
                  >
                    <span>{t('cart.total')}</span>
                    <motion.span
                      key={total}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      style={{ color: 'var(--color-secondary-500)' }}
                    >
                      {formatPrice(total, locale)}
                    </motion.span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goToCheckout}
                  className="btn-primary w-full mt-6 text-lg py-4"
                >
                  {t('cart.checkout')}
                  <Arrow size={20} />
                </motion.button>

                <Link
                  href={`/${locale}/products`}
                  className="block text-center mt-4 font-semibold text-sm transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {t('cart.continue')}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}