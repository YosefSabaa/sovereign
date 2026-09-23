'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getAllOrders, updateOrderStatus, Order } from '@/lib/firestore';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import { Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES: Order['status'][] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const locale = useLocale();
  const t = useTranslations();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Order['status']>('all');
  const [preview, setPreview] = useState<Order | null>(null);

  const load = () => {
    setLoading(true);
    getAllOrders().then(setOrders).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const changeStatus = async (id: string, status: Order['status']) => {
    try {
      await updateOrderStatus(id, status);
      toast.success(locale === 'ar' ? 'تم التحديث' : 'Updated');
      load();
    } catch {
      toast.error(t('auth.error'));
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-navy-700">{t('admin.orders')}</h2>

        <div className="flex gap-2 overflow-x-auto">
          {(['all', ...STATUSES] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                filter === s ? 'bg-teal-500 text-white' : 'bg-white text-navy-700 border'
              }`}>
              {s === 'all' ? 'الكل' : t(`orders.statuses.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-500">{t('common.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">لا يوجد طلبات</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => (
            <div key={o.id} className="card p-4">
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                  <p className="font-bold text-navy-700">
                    #{o.id?.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600">{o.userName}</p>
                  <p className="text-xs text-gray-500">{o.userPhone}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(o.createdAt, locale)}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-teal-600 text-lg">
                    {formatPrice(o.total, locale)}
                  </p>
                  <span className={`badge ${getStatusColor(o.status)} mt-1`}>
                    {t(`orders.statuses.${o.status}`)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                <select
                  value={o.status}
                  onChange={e => changeStatus(o.id!, e.target.value as Order['status'])}
                  className="input py-2 text-sm flex-1 min-w-[150px]">
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{t(`orders.statuses.${s}`)}</option>
                  ))}
                </select>

                <button onClick={() => setPreview(o)}
                  className="btn-secondary py-2 px-4 text-sm">
                  <Eye size={16} />
                  {t('admin.viewReceipt')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-navy-700">
                #{preview.id?.slice(0, 8).toUpperCase()}
              </h3>
              <button onClick={() => setPreview(null)}><X size={22} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">الاسم: </span><span className="font-bold">{preview.userName}</span></div>
                <div><span className="text-gray-500">الهاتف: </span><span className="font-bold" dir="ltr">{preview.userPhone}</span></div>
                <div className="md:col-span-2"><span className="text-gray-500">العنوان: </span><span className="font-bold">{preview.userAddress}</span></div>
              </div>

              <div>
                <h4 className="font-bold mb-2">المنتجات:</h4>
                <div className="space-y-2">
                  {preview.items.map((i, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                      <img src={i.image} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{i.name}</p>
                        <p className="text-xs text-gray-500">{i.qty} × {formatPrice(i.price, locale)}</p>
                      </div>
                      <p className="font-bold">{formatPrice(i.price * i.qty, locale)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold mb-2">إيصال الدفع:</h4>
                <a href={preview.receiptUrl} target="_blank" rel="noopener noreferrer">
                  <img src={preview.receiptUrl} className="max-w-full max-h-96 rounded-lg border" />
                </a>
              </div>

              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>{t('cart.total')}</span>
                <span className="text-teal-600">{formatPrice(preview.total, locale)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}