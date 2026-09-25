'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { getUserOrders, Order } from '@/lib/firestore';
import { formatPrice, formatDate } from '@/lib/utils';
import PageTransition from '@/components/PageTransition';
import {
  Package, ShoppingBag, Clock, CheckCircle2, Truck, Home,
  XCircle, ChevronDown, Receipt
} from 'lucide-react';
import {
  staggerContainer, staggerItem, heartbeat
} from '@/lib/animations';

const STATUS_CONFIG: any = {
  pending: {
    icon: Clock,
    ar: 'قيد المراجعة',
    en: 'Pending',
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.3)'
  },
  confirmed: {
    icon: CheckCircle2,
    ar: 'تم التأكيد',
    en: 'Confirmed',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.3)'
  },
  shipped: {
    icon: Truck,
    ar: 'تم الشحن',
    en: 'Shipped',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.3)'
  },
  delivered: {
    icon: Home,
    ar: 'تم التسليم',
    en: 'Delivered',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.3)'
  },
  cancelled: {
    icon: XCircle,
    ar: 'ملغي',
    en: 'Cancelled',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)'
  }
};

export default function OrdersPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    getUserOrders(user.uid)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  // LOADING
  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen py-10 px-4"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="max-w-5xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6"
              style={{ background: 'var(--color-bg-card)' }}
            >
              <div className="animate-pulse space-y-3">
                <div
                  className="h-6 rounded w-1/3"
                  style={{ background: 'var(--color-bg-elevated)' }}
                />
                <div
                  className="h-4 rounded w-1/2"
                  style={{ background: 'var(--color-bg-elevated)' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // NOT LOGGED IN
  if (!user) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-20 text-center"
        style={{ background: 'var(--color-bg-base)', minHeight: '80vh' }}
      >
        <h1
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {t('checkout.loginRequired')}
        </h1>
        <Link
          href={`/${locale}/login?redirect=/orders`}
          className="btn-primary inline-flex"
        >
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  // EMPTY
  if (orders.length === 0) {
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
            <div
              className="absolute bottom-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ background: 'var(--color-primary-500)' }}
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
              className="relative w-40 h-40 mx-auto mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
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
              {t('orders.empty')}
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="mb-8"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {locale === 'ar'
                ? 'ابدأ التسوق الآن واستكشف منتجاتنا'
                : 'Start shopping and explore our products'}
            </motion.p>

            <motion.div variants={staggerItem}>
              <Link
                href={`/${locale}/products`}
                className="btn-primary inline-flex text-lg px-8 py-4"
              >
                {t('cart.continue')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // ORDERS LIST
  return (
    <PageTransition>
      <div
        className="min-h-screen py-10 px-4 relative overflow-hidden"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="max-w-5xl mx-auto relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className="h-1 w-12 rounded-full"
                style={{
                  background:
                    'linear-gradient(to right, transparent, var(--color-secondary-500))'
                }}
              />
              <motion.div
                animate={heartbeat}
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
                }}
              >
                <Package size={24} style={{ color: '#0a1828' }} />
              </motion.div>
              <div
                className="h-1 w-12 rounded-full"
                style={{
                  background:
                    'linear-gradient(to left, transparent, var(--color-secondary-500))'
                }}
              />
            </div>

            <h1
              className="text-3xl md:text-5xl font-black mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t('orders.title')}
            </h1>

            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              {locale === 'ar'
                ? `لديك ${orders.length} طلب`
                : `You have ${orders.length} orders`}
            </p>
          </motion.div>

          {/* Orders */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-4"
          >
            {orders.map((o) => {
              const status = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              const isExpanded = expanded === o.id;

              return (
                <motion.div
                  key={o.id}
                  variants={staggerItem}
                  className="rounded-2xl overflow-hidden transition-shadow"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid rgba(212, 175, 55, 0.15)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {/* Header */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : o.id!)}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: status.bg,
                            color: status.color,
                            border: `1px solid ${status.border}`
                          }}
                        >
                          <StatusIcon size={22} />
                        </div>
                        <div>
                          <p
                            className="font-black"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {t('orders.orderNumber')} #
                            {o.id?.slice(0, 8).toUpperCase()}
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {formatDate(o.createdAt, locale)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p
                            className="text-xs mb-1"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {t('orders.total')}
                          </p>
                          <p
                            className="font-black text-lg"
                            style={{ color: 'var(--color-secondary-500)' }}
                          >
                            {formatPrice(o.total, locale)}
                          </p>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <ChevronDown size={22} />
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span
                        className="px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{
                          background: status.bg,
                          color: status.color,
                          border: `1px solid ${status.border}`
                        }}
                      >
                        {locale === 'ar' ? status.ar : status.en}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {o.items.length}{' '}
                        {locale === 'ar' ? 'منتج' : 'items'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                        style={{
                          borderTop: '1px solid rgba(212, 175, 55, 0.15)',
                          background: 'var(--color-bg-elevated)'
                        }}
                      >
                        <div className="p-5 space-y-4">
                          {/* Items */}
                          <div>
                            <h4
                              className="font-bold mb-3 flex items-center gap-2 text-sm"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              <Package
                                size={16}
                                style={{ color: 'var(--color-secondary-500)' }}
                              />
                              {locale === 'ar' ? 'المنتجات' : 'Items'}
                            </h4>
                            <div className="space-y-2">
                              {o.items.map((i, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-center gap-3 p-3 rounded-xl"
                                  style={{
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid rgba(212, 175, 55, 0.1)'
                                  }}
                                >
                                  <img
                                    src={i.image}
                                    alt={i.name}
                                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="font-semibold text-sm line-clamp-1"
                                      style={{ color: 'var(--color-text-primary)' }}
                                    >
                                      {i.name}
                                    </p>
                                    <p
                                      className="text-xs mt-0.5"
                                      style={{ color: 'var(--color-text-muted)' }}
                                    >
                                      {i.qty} × {formatPrice(i.price, locale)}
                                    </p>
                                  </div>
                                  <p
                                    className="font-bold text-sm"
                                    style={{ color: 'var(--color-secondary-500)' }}
                                  >
                                    {formatPrice(i.price * i.qty, locale)}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Address */}
                          {o.userAddress && (
                            <div
                              className="rounded-xl p-3"
                              style={{
                                background: 'rgba(59, 130, 246, 0.08)',
                                border: '1px solid rgba(59, 130, 246, 0.2)'
                              }}
                            >
                              <p
                                className="text-xs font-bold mb-1"
                                style={{ color: '#3b82f6' }}
                              >
                                {locale === 'ar'
                                  ? 'عنوان الشحن'
                                  : 'Shipping address'}
                              </p>
                              <p
                                className="text-sm"
                                style={{ color: 'var(--color-text-primary)' }}
                              >
                                {o.userAddress}
                              </p>
                              <p
                                className="text-xs mt-1"
                                style={{ color: 'var(--color-text-secondary)' }}
                                dir="ltr"
                              >
                                📞 {o.userPhone}
                              </p>
                            </div>
                          )}

                          {/* Pending notice */}
                          {o.status === 'pending' && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="rounded-xl p-3 flex items-start gap-2"
                              style={{
                                background: 'rgba(234, 179, 8, 0.1)',
                                border: '1px solid rgba(234, 179, 8, 0.3)'
                              }}
                            >
                              <Clock
                                size={18}
                                className="flex-shrink-0 mt-0.5"
                                style={{ color: '#eab308' }}
                              />
                              <p
                                className="text-xs font-medium"
                                style={{ color: '#eab308' }}
                              >
                                {t('checkout.pendingNote')}
                              </p>
                            </motion.div>
                          )}

                          {/* Receipt */}
                          {o.receiptUrl && (
                            <a
                              href={o.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 font-semibold text-sm transition-opacity hover:opacity-80"
                              style={{ color: 'var(--color-secondary-500)' }}
                            >
                              <Receipt size={16} />
                              {locale === 'ar'
                                ? 'عرض إيصال الدفع'
                                : 'View receipt'}
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}