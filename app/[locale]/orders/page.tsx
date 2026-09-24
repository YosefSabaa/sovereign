'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { getUserOrders, Order } from '@/lib/firestore';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import PageTransition from '@/components/PageTransition';
import MedicalSectionTitle from '@/components/MedicalSectionTitle';
import {
  Package, ShoppingBag, Clock, CheckCircle2, Truck, Home,
  XCircle, ChevronDown, Receipt
} from 'lucide-react';
import { staggerContainer, staggerItem, fadeInUp, heartbeat } from '@/lib/animations';

const STATUS_ICONS: any = {
  pending: Clock,
  confirmed: CheckCircle2,
  shipped: Truck,
  delivered: Home,
  cancelled: XCircle
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

  // Loading
  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-12 bg-gray-100 rounded" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-700 mb-4">
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

  // Empty
  if (orders.length === 0) {
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
            <motion.div variants={staggerItem} className="relative w-40 h-40 mx-auto mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
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
              {t('orders.empty')}
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="text-gray-500 mb-8"
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <MedicalSectionTitle
            title={t('orders.title')}
            subtitle={
              locale === 'ar'
                ? `لديك ${orders.length} طلب`
                : `You have ${orders.length} orders`
            }
            icon={Package}
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-4"
          >
            {orders.map((o, idx) => {
              const statusKey = `orders.statuses.${o.status}`;
              const StatusIcon = STATUS_ICONS[o.status] || Package;
              const isExpanded = expanded === o.id;

              return (
                <motion.div
                  key={o.id}
                  variants={staggerItem}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-shadow"
                >
                  {/* Header */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() =>
                      setExpanded(isExpanded ? null : o.id!)
                    }
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(
                            o.status
                          )}`}
                        >
                          <StatusIcon size={22} />
                        </div>
                        <div>
                          <p className="font-black text-navy-700">
                            {t('orders.orderNumber')} #
                            {o.id?.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(o.createdAt, locale)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">
                            {t('orders.total')}
                          </p>
                          <p className="font-black text-teal-600 text-lg">
                            {formatPrice(o.total, locale)}
                          </p>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown size={22} className="text-gray-400" />
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span
                        className={`badge ${getStatusColor(o.status)} px-3 py-1.5`}
                      >
                        {t(statusKey as any)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {o.items.length}{' '}
                        {locale === 'ar' ? 'منتج' : 'items'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white"
                      >
                        <div className="p-5 space-y-4">
                          {/* Items */}
                          <div>
                            <h4 className="font-bold text-navy-700 mb-3 flex items-center gap-2 text-sm">
                              <Package size={16} className="text-teal-500" />
                              {locale === 'ar' ? 'المنتجات' : 'Items'}
                            </h4>
                            <div className="space-y-2">
                              {o.items.map((i, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100"
                                >
                                  <img
                                    src={i.image}
                                    alt={i.name}
                                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-navy-700 text-sm line-clamp-1">
                                      {i.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {i.qty} × {formatPrice(i.price, locale)}
                                    </p>
                                  </div>
                                  <p className="font-bold text-teal-600 text-sm">
                                    {formatPrice(i.price * i.qty, locale)}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Address */}
                          {o.userAddress && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                              <p className="text-xs font-bold text-blue-700 mb-1">
                                {locale === 'ar' ? 'عنوان الشحن' : 'Shipping address'}
                              </p>
                              <p className="text-sm text-blue-900">
                                {o.userAddress}
                              </p>
                              <p className="text-xs text-blue-700 mt-1" dir="ltr">
                                📞 {o.userPhone}
                              </p>
                            </div>
                          )}

                          {/* Status notice */}
                          {o.status === 'pending' && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2"
                            >
                              <Clock
                                size={18}
                                className="text-yellow-600 flex-shrink-0 mt-0.5"
                              />
                              <p className="text-xs text-yellow-800 font-medium">
                                {t('checkout.pendingNote')}
                              </p>
                            </motion.div>
                          )}

                          {/* Receipt link */}
                          {o.receiptUrl && (
                            <a
                              href={o.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm"
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