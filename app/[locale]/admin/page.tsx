'use client';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getAllOrders, getProducts, Order, Product } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingCart, Clock, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const locale = useLocale();
  const t = useTranslations('admin');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllOrders(), getProducts()])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const revenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: t('stats.orders'), value: orders.length, icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
    { label: t('stats.pending'), value: pendingCount, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { label: t('stats.products'), value: products.length, icon: Package, color: 'bg-purple-100 text-purple-600' },
    { label: t('stats.revenue'), value: formatPrice(revenue, locale), icon: DollarSign, color: 'bg-green-100 text-green-600' }
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="card p-5">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={22} />
            </div>
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-xl font-black text-navy-700">
              {loading ? '...' : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-navy-700 mb-4">أحدث الطلبات</h2>
        {loading ? (
          <p className="text-gray-500">{t('stats.orders')}...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">لا يوجد طلبات</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-bold text-navy-700">
                    #{o.id?.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">{o.userName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-600">{formatPrice(o.total, locale)}</p>
                  <p className="text-xs text-gray-500">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}