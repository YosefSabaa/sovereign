'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCart } from '@/components/CartProvider';
import { getCoupon } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import { Trash2, Minus, Plus, ShoppingBag, Tag, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { items, remove, updateQty, subtotal, clear } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
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

  const goToCheckout = () => {
    sessionStorage.setItem('sovereign_coupon', JSON.stringify(appliedCoupon));
    window.location.href = `/${locale}/checkout`;
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={64} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-navy-700 mb-3">{t('cart.empty')}</h1>
        <p className="text-gray-500 mb-6">{t('cart.emptyDesc')}</p>
        <Link href={`/${locale}/products`} className="btn-primary inline-flex">
          {t('cart.continue')}
          <Arrow size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-navy-700 mb-8">{t('cart.title')}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.productId} className="card p-4 flex gap-4">
              <img src={item.image} alt={item.name}
                className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1">
                <Link href={`/${locale}/product/${item.productId}`}
                  className="font-bold text-navy-700 hover:text-teal-500 line-clamp-2">
                  {item.name}
                </Link>
                <p className="text-teal-600 font-bold mt-2">
                  {formatPrice(item.price, locale)}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="p-2 hover:bg-gray-100">
                      <Minus size={16} />
                    </button>
                    <span className="px-4 font-bold">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="p-2 hover:bg-gray-100">
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => remove(item.productId)}
                    className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clear}
            className="text-red-500 hover:text-red-700 text-sm font-semibold">
            {locale === 'ar' ? 'حذف كل العناصر' : 'Clear all items'}
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-bold text-navy-700 mb-6">
              {t('cart.title')}
            </h2>

            <div className="mb-6">
              <label className="label flex items-center gap-2">
                <Tag size={16} />
                {t('cart.coupon')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="SOVEREIGN10"
                  className="input flex-1"
                />
                <button
                  onClick={applyCoupon}
                  disabled={checking}
                  className="btn-secondary px-4">
                  {checking ? '...' : t('cart.apply')}
                </button>
              </div>
            </div>

            <div className="space-y-3 border-t pt-6">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <span className="font-semibold">{formatPrice(subtotal, locale)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>{t('cart.discount')} ({appliedCoupon.code})</span>
                  <span className="font-semibold">-{formatPrice(discount, locale)}</span>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold border-t pt-3 text-navy-700">
                <span>{t('cart.total')}</span>
                <span className="text-teal-600">{formatPrice(total, locale)}</span>
              </div>
            </div>

            <button onClick={goToCheckout} className="btn-primary w-full mt-6">
              {t('cart.checkout')}
              <Arrow size={20} />
            </button>

            <Link href={`/${locale}/products`}
              className="block text-center text-navy-500 hover:text-teal-500 mt-4 font-semibold text-sm">
              {t('cart.continue')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}