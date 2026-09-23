'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthProvider';
import { getUserOrders, Order } from '@/lib/firestore';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import { Package, ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-700 mb-4">
          {t('checkout.loginRequired')}
        </h1>
        <Link href={`/${locale}/login?redirect=/orders`} className="btn-primary">
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={64} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-navy-700 mb-3">{t('orders.empty')}</h1>
        <Link href={`/${locale}/products`} className="btn-primary inline-flex mt-4">
          {t('cart.continue')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-navy-700 mb-8">{t('orders.title')}</h1>

      <div className="space-y-4">
        {orders.map(o => {
          const statusKey = `orders.statuses.${o.status}`;
          return (
            <div key={o.id} className="card p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={18} className="text-navy-500" />
                    <p className="font-bold text-navy-700">
                      {t('orders.orderNumber')} #{o.id?.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(o.createdAt, locale)}</p>
                </div>
                <span className={`badge ${getStatusColor(o.status)}`}>
                  {t(statusKey as any)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {o.items.map((i, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <img src={i.image} alt={i.name}
                      className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold line-clamp-1">{i.name}</p>
                      <p className="text-gray-500 text-xs">
                        {i.qty} × {formatPrice(i.price, locale)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(i.price * i.qty, locale)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t pt-3 font-bold text-lg">
                <span>{t('orders.total')}</span>
                <span className="text-teal-600">{formatPrice(o.total, locale)}</span>
              </div>

              {o.status === 'pending' && (
                <p className="text-xs text-yellow-700 bg-yellow-50 rounded p-2 mt-3">
                  ⏳ {t('checkout.pendingNote')}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}