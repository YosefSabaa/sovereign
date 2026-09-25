'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllOrders, updateOrderStatus, Order } from '@/lib/firestore';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Eye, X, Package, Clock, CheckCircle2, Truck, Home, XCircle,
  ChevronDown, Receipt, Phone, MapPin, User, Banknote, Smartphone,
  Building2, Sparkles, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

// ==================== STATUS CONFIG ====================
const STATUS_CONFIG: Record<
  Order['status'],
  {
    ar: string;
    en: string;
    color: string;
    bg: string;
    border: string;
    icon: any;
  }
> = {
  pending: {
    ar: 'قيد المراجعة',
    en: 'Pending',
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.4)',
    icon: Clock
  },
  confirmed: {
    ar: 'تم التأكيد',
    en: 'Confirmed',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    icon: CheckCircle2
  },
  shipped: {
    ar: 'تم الشحن',
    en: 'Shipped',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.4)',
    icon: Truck
  },
  delivered: {
    ar: 'تم التسليم',
    en: 'Delivered',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    icon: Home
  },
  cancelled: {
    ar: 'ملغي',
    en: 'Cancelled',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    icon: XCircle
  }
};

// ==================== PAYMENT METHOD CONFIG ====================
const PAYMENT_LABELS: Record<
  string,
  { ar: string; en: string; color: string; icon: any }
> = {
  cod: {
    ar: 'الدفع عند الاستلام',
    en: 'Cash on Delivery',
    color: '#10b981',
    icon: Banknote
  },
  e_wallet: {
    ar: 'المحفظة الإلكترونية',
    en: 'E-Wallet',
    color: '#ef4444',
    icon: Smartphone
  },
  vodafone_cash: {
    ar: 'المحفظة الإلكترونية',
    en: 'E-Wallet',
    color: '#ef4444',
    icon: Smartphone
  },
  instapay: {
    ar: 'إنستاباي',
    en: 'InstaPay',
    color: '#8b5cf6',
    icon: Building2
  }
};

const STATUSES: Order['status'][] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled'
];

export default function AdminOrdersPage() {
  const locale = useLocale();
  const t = useTranslations();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Order['status']>('all');
  const [preview, setPreview] = useState<Order | null>(null);

  const load = () => {
    setLoading(true);
    getAllOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id: string, status: Order['status']) => {
    try {
      await updateOrderStatus(id, status);
      toast.success(locale === 'ar' ? 'تم التحديث ✓' : 'Updated ✓');
      load();
    } catch {
      toast.error(t('auth.error'));
    }
  };

  const filtered =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  // Stats
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0);

  return (
    <div>
      {/* ==================== HEADER ==================== */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
            }}
          >
            <Package size={22} style={{ color: '#0a1828' }} />
          </div>
          <div>
            <h2
              className="text-xl font-black"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t('admin.orders')}
            </h2>
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {locale === 'ar'
                ? `${orders.length} طلب`
                : `${orders.length} orders`}
            </p>
          </div>
        </div>
      </div>

      {/* ==================== STATS BAR ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: locale === 'ar' ? 'إجمالي الطلبات' : 'Total Orders',
            value: orders.length,
            color: '#3b82f6',
            icon: Package
          },
          {
            label: locale === 'ar' ? 'قيد المراجعة' : 'Pending',
            value: pendingCount,
            color: '#eab308',
            icon: Clock
          },
          {
            label: locale === 'ar' ? 'تم التسليم' : 'Delivered',
            value: orders.filter((o) => o.status === 'delivered').length,
            color: '#10b981',
            icon: Home
          },
          {
            label: locale === 'ar' ? 'الإيرادات' : 'Revenue',
            value: formatPrice(totalRevenue, locale),
            color: 'var(--color-secondary-500)',
            icon: Sparkles
          }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-4"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid rgba(212, 175, 55, 0.15)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} style={{ color: stat.color }} />
              <p
                className="text-xs font-semibold"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {stat.label}
              </p>
            </div>
            <p
              className="text-xl font-black"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ==================== FILTERS ==================== */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <div
          className="flex items-center gap-2 flex-shrink-0"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <Filter
            size={16}
            style={{ color: 'var(--color-secondary-500)' }}
          />
          <span className="font-bold text-sm hidden md:inline">
            {locale === 'ar' ? 'تصفية:' : 'Filter:'}
          </span>
        </div>
        {(['all', ...STATUSES] as const).map((s) => {
          const isActive = filter === s;
          const config = s === 'all' ? null : STATUS_CONFIG[s];

          return (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className="px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all"
              style={
                isActive
                  ? {
                      background: config
                        ? config.color
                        : 'var(--color-secondary-500)',
                      color: '#0a1828',
                      border: '2px solid transparent'
                    }
                  : {
                      background: 'var(--color-bg-card)',
                      color: 'var(--color-text-primary)',
                      border: `2px solid ${
                        config ? config.border : 'rgba(212, 175, 55, 0.2)'
                      }`
                    }
              }
            >
              {s === 'all'
                ? locale === 'ar'
                  ? `الكل (${orders.length})`
                  : `All (${orders.length})`
                : locale === 'ar'
                  ? config!.ar
                  : config!.en}
            </button>
          );
        })}
      </div>

      {/* ==================== ORDERS LIST ==================== */}
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
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-muted)'
          }}
        >
          {locale === 'ar' ? 'لا يوجد طلبات' : 'No orders'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const statusConfig = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;
            const paymentConfig = PAYMENT_LABELS[o.paymentMethod || 'cod'];
            const PaymentIcon = paymentConfig?.icon || Banknote;

            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid rgba(212, 175, 55, 0.15)'
                }}
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  {/* Left: Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: statusConfig.bg,
                          color: statusConfig.color,
                          border: `1px solid ${statusConfig.border}`
                        }}
                      >
                        <StatusIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-black text-sm md:text-base truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          #{o.id?.slice(0, 8).toUpperCase()}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {formatDate(o.createdAt, locale)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p
                        className="flex items-center gap-2"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        <User size={12} />
                        <span className="font-semibold">{o.userName}</span>
                      </p>
                      <p
                        className="flex items-center gap-2"
                        style={{ color: 'var(--color-text-secondary)' }}
                        dir="ltr"
                      >
                        <Phone size={12} />
                        <span>{o.userPhone}</span>
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {/* Status badge */}
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold"
                        style={{
                          background: statusConfig.bg,
                          color: statusConfig.color,
                          border: `1px solid ${statusConfig.border}`
                        }}
                      >
                        <StatusIcon size={10} />
                        {locale === 'ar' ? statusConfig.ar : statusConfig.en}
                      </span>

                      {/* Payment badge */}
                      {paymentConfig && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold"
                          style={{
                            background: `${paymentConfig.color}20`,
                            color: paymentConfig.color,
                            border: `1px solid ${paymentConfig.color}40`
                          }}
                        >
                          <PaymentIcon size={10} />
                          {locale === 'ar'
                            ? paymentConfig.ar
                            : paymentConfig.en}
                        </span>
                      )}

                      {/* Items count */}
                      <span
                        className="text-[10px] md:text-xs px-2 py-1 rounded-full font-bold"
                        style={{
                          background: 'rgba(212, 175, 55, 0.1)',
                          color: 'var(--color-secondary-500)'
                        }}
                      >
                        {o.items.length}{' '}
                        {locale === 'ar' ? 'منتج' : 'items'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Price + Actions */}
                  <div className="text-end flex-shrink-0">
                    <p
                      className="text-xs mb-0.5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {locale === 'ar' ? 'الإجمالي' : 'Total'}
                    </p>
                    <p
                      className="font-black text-lg md:text-xl mb-3"
                      style={{ color: 'var(--color-secondary-500)' }}
                    >
                      {formatPrice(o.total, locale)}
                    </p>

                    <div className="flex flex-wrap gap-2 justify-end">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          changeStatus(
                            o.id!,
                            e.target.value as Order['status']
                          )
                        }
                        className="px-3 py-2 rounded-lg font-bold text-xs outline-none cursor-pointer"
                        style={{
                          background: 'var(--color-bg-elevated)',
                          color: 'var(--color-text-primary)',
                          border: `2px solid ${statusConfig.border}`
                        }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {locale === 'ar'
                              ? STATUS_CONFIG[s].ar
                              : STATUS_CONFIG[s].en}
                          </option>
                        ))}
                      </select>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPreview(o)}
                        className="px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5"
                        style={{
                          background: `linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-600))`,
                          color: '#0a1828'
                        }}
                      >
                        <Eye size={14} />
                        {locale === 'ar' ? 'التفاصيل' : 'Details'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ==================== PREVIEW MODAL ==================== */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4"
            style={{ background: 'rgba(10, 24, 40, 0.9)' }}
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="flex justify-between items-center p-4 md:p-5 sticky top-0 z-10"
                style={{
                  background: 'var(--color-bg-card)',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
                    }}
                  >
                    <Package size={18} style={{ color: '#0a1828' }} />
                  </div>
                  <div>
                    <h3
                      className="font-black"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      #{preview.id?.slice(0, 8).toUpperCase()}
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {formatDate(preview.createdAt, locale)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 md:p-6 space-y-5">
                {/* Status + Payment + Total */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Status */}
                  <div
                    className="rounded-2xl p-3"
                    style={{
                      background: STATUS_CONFIG[preview.status].bg,
                      border: `1px solid ${STATUS_CONFIG[preview.status].border}`
                    }}
                  >
                    <p
                      className="text-[10px] font-bold mb-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {locale === 'ar' ? 'الحالة' : 'Status'}
                    </p>
                    <p
                      className="font-black text-sm"
                      style={{ color: STATUS_CONFIG[preview.status].color }}
                    >
                      {locale === 'ar'
                        ? STATUS_CONFIG[preview.status].ar
                        : STATUS_CONFIG[preview.status].en}
                    </p>
                  </div>

                  {/* Payment */}
                  {PAYMENT_LABELS[preview.paymentMethod || 'cod'] && (
                    <div
                      className="rounded-2xl p-3"
                      style={{
                        background: `${PAYMENT_LABELS[preview.paymentMethod || 'cod'].color}15`,
                        border: `1px solid ${PAYMENT_LABELS[preview.paymentMethod || 'cod'].color}40`
                      }}
                    >
                      <p
                        className="text-[10px] font-bold mb-1"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {locale === 'ar' ? 'طريقة الدفع' : 'Payment'}
                      </p>
                      <p
                        className="font-black text-sm"
                        style={{
                          color:
                            PAYMENT_LABELS[preview.paymentMethod || 'cod']
                              .color
                        }}
                      >
                        {locale === 'ar'
                          ? PAYMENT_LABELS[preview.paymentMethod || 'cod'].ar
                          : PAYMENT_LABELS[preview.paymentMethod || 'cod'].en}
                      </p>
                    </div>
                  )}

                  {/* Total */}
                  <div
                    className="rounded-2xl p-3"
                    style={{
                      background: `linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-600))`
                    }}
                  >
                    <p
                      className="text-[10px] font-bold mb-1"
                      style={{ color: 'rgba(10, 24, 40, 0.7)' }}
                    >
                      {locale === 'ar' ? 'الإجمالي' : 'Total'}
                    </p>
                    <p
                      className="font-black text-sm"
                      style={{ color: '#0a1828' }}
                    >
                      {formatPrice(preview.total, locale)}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid rgba(212, 175, 55, 0.15)'
                  }}
                >
                  <h4
                    className="font-bold mb-3 text-sm flex items-center gap-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <User
                      size={14}
                      style={{ color: 'var(--color-secondary-500)' }}
                    />
                    {locale === 'ar' ? 'بيانات العميل' : 'Customer Info'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p
                      className="flex items-start gap-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <span
                        className="font-bold min-w-[70px]"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {locale === 'ar' ? 'الاسم:' : 'Name:'}
                      </span>
                      {preview.userName}
                    </p>
                    <p
                      className="flex items-start gap-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <span
                        className="font-bold min-w-[70px]"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {locale === 'ar' ? 'الهاتف:' : 'Phone:'}
                      </span>
                      <a
                        href={`tel:${preview.userPhone}`}
                        className="hover:underline"
                        dir="ltr"
                        style={{ color: 'var(--color-secondary-500)' }}
                      >
                        {preview.userPhone}
                      </a>
                    </p>
                    <p
                      className="flex items-start gap-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <span
                        className="font-bold min-w-[70px]"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {locale === 'ar' ? 'العنوان:' : 'Address:'}
                      </span>
                      <span className="flex-1">{preview.userAddress}</span>
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4
                    className="font-bold mb-3 text-sm flex items-center gap-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <Package
                      size={14}
                      style={{ color: 'var(--color-secondary-500)' }}
                    />
                    {locale === 'ar' ? 'المنتجات' : 'Items'} (
                    {preview.items.length})
                  </h4>
                  <div className="space-y-2">
                    {preview.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                          background: 'var(--color-bg-elevated)',
                          border: '1px solid rgba(212, 175, 55, 0.1)'
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-sm line-clamp-1"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {item.name}
                            {item.variantName && (
                              <span
                                className="text-xs ml-1"
                                style={{
                                  color: 'var(--color-secondary-500)'
                                }}
                              >
                                ({item.variantName})
                              </span>
                            )}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {item.qty} × {formatPrice(item.price, locale)}
                          </p>
                        </div>
                        <p
                          className="font-bold text-sm"
                          style={{ color: 'var(--color-secondary-500)' }}
                        >
                          {formatPrice(item.price * item.qty, locale)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div
                  className="rounded-2xl p-4 space-y-2"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid rgba(212, 175, 55, 0.15)'
                  }}
                >
                  <div
                    className="flex justify-between text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <span>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="font-semibold">
                      {formatPrice(preview.subtotal, locale)}
                    </span>
                  </div>

                  {preview.discount > 0 && (
                    <div
                      className="flex justify-between text-sm"
                      style={{ color: '#10b981' }}
                    >
                      <span>
                        {locale === 'ar' ? 'الخصم' : 'Discount'}
                        {preview.couponCode && ` (${preview.couponCode})`}
                      </span>
                      <span className="font-semibold">
                        -{formatPrice(preview.discount, locale)}
                      </span>
                    </div>
                  )}

                  <div
                    className="flex justify-between font-black text-base pt-2"
                    style={{
                      color: 'var(--color-text-primary)',
                      borderTop: '1px solid rgba(212, 175, 55, 0.15)'
                    }}
                  >
                    <span>{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                    <span style={{ color: 'var(--color-secondary-500)' }}>
                      {formatPrice(preview.total, locale)}
                    </span>
                  </div>
                </div>

                {/* Receipt */}
                {preview.receiptUrl ? (
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '2px solid rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    <h4
                      className="font-bold mb-3 text-sm flex items-center gap-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      <Receipt
                        size={14}
                        style={{ color: 'var(--color-secondary-500)' }}
                      />
                      {locale === 'ar'
                        ? 'إيصال الدفع'
                        : 'Payment Receipt'}
                    </h4>
                    <a
                      href={preview.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={preview.receiptUrl}
                        alt="receipt"
                        className="w-full max-h-96 object-contain rounded-xl hover:opacity-90 transition-opacity"
                        style={{
                          border: '1px solid rgba(212, 175, 55, 0.3)'
                        }}
                      />
                      <p
                        className="text-center text-xs mt-3 font-semibold hover:underline"
                        style={{ color: 'var(--color-secondary-500)' }}
                      >
                        {locale === 'ar'
                          ? 'اضغط لفتح الصورة بالحجم الكامل'
                          : 'Click to open full image'}
                      </p>
                    </a>
                  </div>
                ) : (
                  <div
                    className="rounded-2xl p-4 flex items-start gap-3"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Banknote
                      size={20}
                      style={{
                        color: '#10b981',
                        flexShrink: 0,
                        marginTop: 2
                      }}
                    />
                    <p
                      className="text-sm font-medium"
                      style={{ color: '#10b981' }}
                    >
                      {locale === 'ar'
                        ? 'لا يوجد إيصال — الدفع عند الاستلام'
                        : 'No receipt — Cash on Delivery'}
                    </p>
                  </div>
                )}

                {/* Timeline (اختياري) */}
                {preview.timeline && preview.timeline.length > 0 && (
                  <div>
                    <h4
                      className="font-bold mb-3 text-sm flex items-center gap-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      <Clock
                        size={14}
                        style={{ color: 'var(--color-secondary-500)' }}
                      />
                      {locale === 'ar' ? 'سجل الطلب' : 'Order Timeline'}
                    </h4>
                    <div className="space-y-2">
                      {preview.timeline.map((entry, idx) => {
                        const cfg = STATUS_CONFIG[entry.status];
                        const Icon = cfg.icon;
                        const date = entry.timestamp?.toDate?.();
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-xl"
                            style={{
                              background: 'var(--color-bg-elevated)',
                              border: '1px solid rgba(212, 175, 55, 0.1)'
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background: cfg.bg,
                                color: cfg.color
                              }}
                            >
                              <Icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-bold text-xs"
                                style={{ color: cfg.color }}
                              >
                                {locale === 'ar' ? cfg.ar : cfg.en}
                              </p>
                              {date && (
                                <p
                                  className="text-[10px] mt-0.5"
                                  style={{ color: 'var(--color-text-muted)' }}
                                >
                                  {date.toLocaleString(
                                    locale === 'ar' ? 'ar-EG' : 'en-US'
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}