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
import { staggerContainer, staggerItem, heartbeat } from '@/lib/animations';

const STATUS_CONFIG: any = {
  pending: { ar: 'قيد المراجعة', en: 'Pending', color: '#eab308' },
  confirmed: { ar: 'تم التأكيد', en: 'Confirmed', color: '#3b82f6' },
  shipped: { ar: 'تم الشحن', en: 'Shipped', color: '#8b5cf6' },
  delivered: { ar: 'تم التسليم', en: 'Delivered', color: '#10b981' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: '#ef4444' }
};

const TIMELINE_STEPS: Array<{
  status: Order['status'];
  icon: any;
  ar: string;
  en: string;
}> = [
  { status: 'pending', icon: Clock, ar: 'تم الطلب', en: 'Order Placed' },
  { status: 'confirmed', icon: CheckCircle2, ar: 'تم التأكيد', en: 'Confirmed' },
  { status: 'shipped', icon: Truck, ar: 'تم الشحن', en: 'Shipped' },
  { status: 'delivered', icon: Home, ar: 'تم التسليم', en: 'Delivered' }
];

function OrderTimeline({
  order,
  locale
}: {
  order: Order;
  locale: string;
}) {
  const currentIndex = TIMELINE_STEPS.findIndex(
    (s) => s.status === order.status
  );

  if (order.status === 'cancelled') {
    return (
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}
      >
        <XCircle size={24} style={{ color: '#ef4444' }} />
        <span className="font-bold" style={{ color: '#ef4444' }}>
          {locale === 'ar' ? 'تم إلغاء الطلب' : 'Order Cancelled'}
        </span>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative flex justify-between items-start">
        <div
          className="absolute top-5 left-5 right-5 h-1 rounded-full"
          style={{ background: 'var(--color-bg-elevated)' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}%`
            }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-400))`
            }}
          />
        </div>

        {TIMELINE_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div
              key={step.status}
              className="relative z-10 flex flex-col items-center gap-2 flex-1"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.15 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                  isCurrent ? 'animate-pulse' : ''
                }`}
                style={{
                  background: isActive
                    ? `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
                    : 'var(--color-bg-elevated)',
                  color: isActive ? '#0a1828' : 'var(--color-text-muted)',
                  border: isActive
                    ? 'none'
                    : '2px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                <Icon size={18} />
              </motion.div>
              <span
                className="text-xs font-bold text-center"
                style={{
                  color: isActive
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-muted)'
                }}
              >
                {locale === 'ar' ? step.ar : step.en}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen py-10 px-4"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="max-w-5xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl animate-pulse"
              style={{ background: 'var(--color-bg-card)' }}
            />
          ))}
        </div>
      </div>
    );
  }

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

  if (orders.length === 0) {
    return (
      <PageTransition>
        <div
          className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden"
          style={{ background: 'var(--color-bg-base)' }}
        >
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

  return (
    <PageTransition>
      <div
        className="min-h-screen py-10 px-4 relative overflow-hidden"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="max-w-5xl mx-auto relative">
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

            <p
              className="text-lg"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {locale === 'ar'
                ? `لديك ${orders.length} طلب`
                : `You have ${orders.length} orders`}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-4"
          >
            {orders.map((o) => {
              const status = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
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
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : o.id!)}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'rgba(212, 175, 55, 0.15)',
                            color: status.color,
                            border: `1px solid ${status.color}40`
                          }}
                        >
                          <Package size={22} />
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
                          background: `${status.color}20`,
                          color: status.color,
                          border: `1px solid ${status.color}40`
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
                          {/* Timeline */}
                          <div>
                            <h4
                              className="font-bold mb-2 flex items-center gap-2 text-sm"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              <Truck
                                size={16}
                                style={{ color: 'var(--color-secondary-500)' }}
                              />
                              {locale === 'ar' ? 'حالة الطلب' : 'Order Status'}
                            </h4>
                            <OrderTimeline order={o} locale={locale} />
                          </div>

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
                                      style={{
                                        color: 'var(--color-text-primary)'
                                      }}
                                    >
                                      {i.name}
                                      {i.variantName && (
                                        <span
                                          className="text-xs ml-1"
                                          style={{
                                            color: 'var(--color-text-muted)'
                                          }}
                                        >
                                          ({i.variantName})
                                        </span>
                                      )}
                                    </p>
                                    <p
                                      className="text-xs mt-0.5"
                                      style={{
                                        color: 'var(--color-text-muted)'
                                      }}
                                    >
                                      {i.qty} × {formatPrice(i.price, locale)}
                                    </p>
                                  </div>
                                  <p
                                    className="font-bold text-sm"
                                    style={{
                                      color: 'var(--color-secondary-500)'
                                    }}
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
                                style={{
                                  color: 'var(--color-text-secondary)'
                                }}
                                dir="ltr"
                              >
                                📞 {o.userPhone}
                              </p>
                            </div>
                          )}

                          {o.status === 'pending' && (
                            <div
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
                            </div>
                          )}

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