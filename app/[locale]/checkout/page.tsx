'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { createOrder } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import {
  Copy, Upload, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [coupon, setCoupon] = useState<{ code: string; percent: number } | null>(null);

  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const vodaNumber = process.env.NEXT_PUBLIC_VODAFONE_CASH || '01012345678';

  const discount = coupon ? (subtotal * coupon.percent) / 100 : 0;
  const total = subtotal - discount;

  useEffect(() => {
    const raw = sessionStorage.getItem('sovereign_coupon');
    if (raw) {
      try { setCoupon(JSON.parse(raw)); } catch {}
    }
    if (user) {
      setName(user.displayName || '');
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user && !success) {
      toast.error(t('checkout.loginRequired'));
      router.push(`/${locale}/login?redirect=/checkout`);
    }
  }, [authLoading, user, locale, router, success, t]);

  const copyNumber = () => {
    navigator.clipboard.writeText(vodaNumber);
    toast.success(t('checkout.copied'));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error(locale === 'ar'
        ? 'حجم الصورة يجب أن يكون أقل من 5MB'
        : 'Image must be less than 5MB');
      return;
    }
    if (!f.type.startsWith('image/')) {
      toast.error(locale === 'ar' ? 'الملف يجب أن يكون صورة' : 'File must be an image');
      return;
    }
    setReceipt(f);
    setReceiptPreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setReceipt(null);
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview('');
  };

  const uploadReceipt = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user?.uid || '');

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }

    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!receipt) {
      toast.error(locale === 'ar' ? 'يجب رفع صورة التحويل' : 'Please upload the receipt');
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const receiptUrl = await uploadReceipt(receipt);

      const orderRef = await createOrder({
        userId: user.uid,
        userName: name,
        userPhone: phone,
        userAddress: address,
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          image: i.image,
          qty: i.qty
        })),
        subtotal,
        discount,
        total,
        couponCode: coupon?.code,
        receiptUrl,
        status: 'pending'
      });

      clear();
      sessionStorage.removeItem('sovereign_coupon');
      setSuccess(orderRef.id);
      toast.success(t('checkout.orderSuccess'));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t('auth.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={56} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-navy-700 mb-4">
          {t('checkout.orderSuccess')}
        </h1>
        <p className="text-gray-600 mb-2">
          {t('checkout.orderNumber')}:{' '}
          <span className="font-bold text-navy-700">
            #{success.slice(0, 8).toUpperCase()}
          </span>
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6 text-yellow-800 inline-flex items-center gap-2">
          <AlertCircle size={20} />
          {t('checkout.pendingNote')}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link href={`/${locale}/orders`} className="btn-primary">
            {t('nav.orders')}
          </Link>
          <Link href={`/${locale}/products`} className="btn-outline">
            {t('cart.continue')}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-700 mb-4">{t('cart.empty')}</h1>
        <Link href={`/${locale}/products`} className="btn-primary inline-flex">
          {t('cart.continue')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Link href={`/${locale}/cart`}
        className="inline-flex items-center gap-2 text-navy-500 hover:text-teal-500 mb-6 font-semibold">
        <Arrow size={18} />
        {t('cart.title')}
      </Link>

      <h1 className="text-3xl font-black text-navy-700 mb-8">{t('checkout.title')}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-navy-700 mb-4">
              {locale === 'ar' ? 'بيانات الشحن' : 'Shipping Info'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">{t('checkout.name')}</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  required className="input" />
              </div>
              <div>
                <label className="label">{t('checkout.phone')}</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  type="tel" required className="input" placeholder="01XXXXXXXXX" dir="ltr" />
              </div>
              <div>
                <label className="label">{t('checkout.address')}</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)}
                  required rows={3} className="input resize-none" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-navy-700 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">V</span>
              {t('checkout.vodafoneCash')}
            </h2>

            <p className="text-gray-600 text-sm mb-4">{t('checkout.vodafoneInstructions')}</p>

            <div className="bg-gray-50 border-2 border-dashed border-teal-500 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">{t('checkout.vodafoneNumber')}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-navy-700 tracking-wider">
                  {vodaNumber}
                </span>
                <button type="button" onClick={copyNumber}
                  className="btn-secondary py-2 px-3 text-sm">
                  <Copy size={16} />
                  {t('checkout.copy')}
                </button>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
              <p className="text-sm font-bold text-navy-700 mb-1">
                {locale === 'ar' ? 'المبلغ المطلوب تحويله:' : 'Amount to transfer:'}
              </p>
              <p className="text-2xl font-black text-teal-600">{formatPrice(total, locale)}</p>
            </div>

            <label className="label">{t('checkout.uploadReceipt')}</label>

            {!receiptPreview ? (
              <label className="flex items-center justify-center gap-3 border-2 border-dashed border-gray-300 hover:border-teal-500 rounded-lg p-6 cursor-pointer transition-colors bg-gray-50">
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                <Upload size={32} className="text-gray-400" />
                <div className="text-center">
                  <p className="font-semibold text-navy-700">{t('checkout.chooseImage')}</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG — Max 5MB</p>
                </div>
              </label>
            ) : (
              <div className="relative border-2 border-teal-500 rounded-lg p-3 bg-teal-50">
                <button type="button" onClick={removeFile}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                  <X size={16} />
                </button>
                <img src={receiptPreview} alt="receipt"
                  className="max-h-64 mx-auto rounded-lg" />
                <p className="text-center text-sm text-teal-700 font-semibold mt-2">
                  ✓ {receipt?.name}
                </p>
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting}
            className="btn-primary w-full text-lg py-4">
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {locale === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
              </>
            ) : (
              <>
                <CheckCircle2 size={22} />
                {t('checkout.placeOrder')}
              </>
            )}
          </button>
        </form>

        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-navy-700 mb-4">
              {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map(i => (
                <div key={i.productId} className="flex gap-3">
                  <img src={i.image} alt={i.name}
                    className="w-14 h-14 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-2">{i.name}</p>
                    <p className="text-xs text-gray-500">
                      {i.qty} × {formatPrice(i.price, locale)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span>{formatPrice(subtotal, locale)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-green-600">
                  <span>{t('cart.discount')}</span>
                  <span>-{formatPrice(discount, locale)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2 text-navy-700">
                <span>{t('cart.total')}</span>
                <span className="text-teal-600">{formatPrice(total, locale)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}