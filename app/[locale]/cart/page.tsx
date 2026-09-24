'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/CartProvider';
import { getCoupon } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import PageTransition from '@/components/PageTransition';
import {
  Trash2, Minus, Plus, ShoppingBag, Tag, ArrowLeft, ArrowRight,
  ShoppingCart, Sparkles, X, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { staggerContainer, staggerItem, fadeInUp, heartbeat } from '@/lib/animations';

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { items, remove, updateQty, subtotal, clear } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    percent: number;
  } | null>(null);
  const [checking, setChecking] = useState(false);

  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const discount = appliedCoupon ? (subtotal * appliedCoupon.percent) / 100 : 0;
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
        setAppliedCoupon({ code: c.code, percent: c.discountPercent });
        toast.success(`${t('cart.couponApplied')} -${c.discountPercent}%`);
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
    sessionStorage.setItem(
      'sovereign_coupon',
      JSON.stringify(appliedCoupon)
    );
    window.location.href = `/${locale}/checkout`;
  };

  // Empty cart
  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-[70vh] flex items-center justify-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-navy-200/20 rounded-full blur-3xl" />
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
                className="absolute inset-0 rounded-full border-4 border-dashed border-teal-300"
              />
              <motion.div
                animate={heartbeat}
                className="absolute inset-6 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center"
              >
                <ShoppingBag size={60} className="text-teal-600" />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-3xl font-black text-navy-700 mb-3"
            >
              {t('cart.empty')}
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="text-gray-500 mb-8"
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={heartbeat}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg"
              >
                <ShoppingCart size={26} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-navy-700">
                  {t('cart.title')}
                </h1>
                <p className="text-gray-500 text-sm">
                  {items.length}{' '}
                  {locale === 'ar' ? 'منتج' : 'items'}
                </p>
              </div>
            </div>

            <button
              onClick={clear}
              className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
              {locale === 'ar' ? 'حذف الكل' : 'Clear all'}
            </button>
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
                {items.map(item => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-lg border border-gray-100 transition-shadow group"
                  >
                    <Link
                      href={`/${locale}/product/${item.productId}`}
                      className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3">
                        <Link
                          href={`/${locale}/product/${item.productId}`}
                          className="font-bold text-navy-700 hover:text-teal-600 line-clamp-2 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => remove(item.productId)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <p className="text-teal-600 font-black text-lg mt-1">
                        {formatPrice(item.price, locale)}
                      </p>

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                        <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden bg-white">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              updateQty(item.productId, item.qty - 1)
                            }
                            className="p-2.5 hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={16} />
                          </motion.button>
                          <span className="px-5 font-black text-navy-700 min-w-[50px] text-center">
                            {item.qty}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              updateQty(item.productId, item.qty + 1)
                            }
                            className="p-2.5 hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={16} />
                          </motion.button>
                        </div>

                        <p className="text-navy-700 font-bold">
                          {locale === 'ar' ? 'الإجمالي: ' : 'Total: '}
                          <span className="text-teal-600">
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
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-24">
                <h2 className="text-xl font-black text-navy-700 mb-6 flex items-center gap-2">
                  <Sparkles size={22} className="text-teal-500" />
                  {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                </h2>

                {/* Coupon */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-bold text-navy-700 mb-3">
                    <Tag size={16} className="text-teal-500" />
                    {t('cart.coupon')}
                  </label>

                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e =>
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
                      className="flex items-center justify-between bg-green-50 border-2 border-green-200 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          size={20}
                          className="text-green-600 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-green-700 text-sm">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-green-600">
                            -{appliedCoupon.percent}%{' '}
                            {locale === 'ar' ? 'خصم' : 'discount'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-green-700 hover:text-red-500 p-1"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t pt-5">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('cart.subtotal')}</span>
                    <span className="font-semibold">
                      {formatPrice(subtotal, locale)}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-between text-green-600"
                    >
                      <span>{t('cart.discount')}</span>
                      <span className="font-semibold">
                        -{formatPrice(discount, locale)}
                      </span>
                    </motion.div>
                  )}

                  <div className="flex justify-between text-xl font-black border-t pt-4 mt-2 text-navy-700">
                    <span>{t('cart.total')}</span>
                    <motion.span
                      key={total}
                      initial={{ scale: 1.2, color: '#14b8a6' }}
                      animate={{ scale: 1, color: '#14b8a6' }}
                      className="text-teal-600"
                    >
                      {formatPrice(total, locale)}
                    </motion.span>
                  </div>
                </div>

                {/* Checkout button */}
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
                  className="block text-center text-navy-500 hover:text-teal-500 mt-4 font-semibold text-sm transition-colors"
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