'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getAllCoupons, addCoupon, deleteCoupon, Coupon } from '@/lib/firestore';
import { Plus, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const locale = useLocale();
  const t = useTranslations();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [percent, setPercent] = useState(10);

  const load = () => {
    setLoading(true);
    getAllCoupons().then(setCoupons).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || percent <= 0) return;
    try {
      await addCoupon({
        code: code.trim().toUpperCase(),
        discountPercent: percent,
        active: true
      });
      setCode('');
      setPercent(10);
      toast.success(locale === 'ar' ? 'تمت الإضافة' : 'Added');
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
      <h2 className="text-xl font-bold text-navy-700 mb-6">{t('admin.coupons')}</h2>

      <form onSubmit={add} className="card p-4 mb-6 grid md:grid-cols-[1fr_1fr_auto] gap-3">
        <div>
          <label className="label">{t('admin.fields.code')}</label>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            className="input" placeholder="SOVEREIGN10" required />
        </div>
        <div>
          <label className="label">{t('admin.fields.discountPercent')}</label>
          <input type="number" value={percent}
            onChange={e => setPercent(+e.target.value)}
            min={1} max={90} className="input" required />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full">
            <Plus size={18} />
            {t('admin.addCoupon')}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="card p-8 text-center text-gray-500">{t('common.loading')}</div>
      ) : coupons.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">لا توجد كوبونات</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(c => (
            <div key={c.id} className="card p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <div>
                  <p className="font-black text-navy-700 text-lg">{c.code}</p>
                  <p className="text-sm text-gray-500">-{c.discountPercent}%</p>
                </div>
              </div>
              <button onClick={() => remove(c.id!)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}