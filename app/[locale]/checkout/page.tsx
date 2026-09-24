'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { createOrder } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import PageTransition from '@/components/PageTransition';
import {
  Copy, Upload, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight,
  X, MapPin, Phone, User as UserIcon, Package, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fadeInUp, staggerContainer, staggerItem, heartbeat } from '@/lib/animations';

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

  const [coupon, setCoupon] = useState<{
    code: string;
    percent: number;
  } | null>(null);

  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const vodaNumber = process.env.NEXT_PUBLIC_VODAFONE_CASH || '01012345678';

  const discount = coupon ? (subtotal * coupon.percent) / 100 : 0;
  const total = subtotal - discount;

  useEffect(() => {
    const raw = sessionStorage.getItem('sovereign_coupon');
    if (raw) {
      try {
        setCoupon(JSON.parse(raw));
      } catch {}
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
      toast.error(
        locale === 'ar'
          ? 'حجم الصورة يجب أن يكون أقل من 5MB'
          : 'Image must be less than 5MB'
      );
      return;
    }
    if (!f.type.startsWith('image/')) {
      toast.error(
        locale === 'ar' ? 'الملف يجب أن يكون صورة' : 'File must be an image'
      );
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
      toast.error(
        locale === 'ar' ? 'يجب رفع صورة التحويل' : 'Please upload the receipt'
      );
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const receiptUrl = await uploadReceipt(receipt);

      const orderData: any = {
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
        receiptUrl,
        status: 'pending'
      };

      if (coupon?.code) {
        orderData.couponCode = coupon.code;
      }

      const orderRef = await createOrder(orderData);

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

  // ==================== SUCCESS ====================
  if (success) {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl" />
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl text-center relative z-10"
          >
            <motion.div variants={staggerItem} className="relative mx-auto w-32 h-32 mb-6">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-green-400"
              />
              <motion.div
                animate={heartbeat}
                className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl"
              >
                <CheckCircle2 size={64} className="text-white" />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-3xl md:text-4xl font-black text-navy-700 mb-4"
            >
              {t('checkout.orderSuccess')}
            </motion.h1>

            <motion.div
              variants={staggerItem}
              className="bg-white rounded-2xl p-5 inline-block shadow-lg mb-6 border border-gray-100"
            >
              <p className="text-gray-500 text-sm mb-1">
                {t('checkout.orderNumber')}
              </p>
              <p className="text-2xl font-black text-teal-600 tracking-wider">
                #{success.slice(0, 8).toUpperCase()}
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-5 my-6 inline-flex items-start gap-3 text-yellow-800 text-start max-w-md"
            >
              <AlertCircle size={22} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{t('checkout.pendingNote')}</p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-3 justify-center mt-6"
            >
              <Link href={`/${locale}/orders`} className="btn-primary">
                <Package size={20} />
                {t('nav.orders')}
              </Link>
              <Link href={`/${locale}/products`} className="btn-outline">
                {t('cart.continue')}
                <Arrow size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-700 mb-4">
          {t('cart.empty')}
        </h1>
        <Link href={`/${locale}/products`} className="btn-primary inline-flex">
          {t('cart.continue')}
        </Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/${locale}/cart`}
            className="inline-flex items-center gap-2 text-navy-500 hover:text-teal-500 mb-6 font-semibold transition-colors group"
          >
            <Arrow size={18} className="group-hover:-translate-x-1 transition-transform" />
            {t('cart.title')}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <motion.div
              animate={heartbeat}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg"
            >
              <CheckCircle2 size={26} className="text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-black text-navy-700">
              {t('checkout.title')}
            </h1>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              {/* Shipping Info */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
              >
                <motion.h2
                  variants={fadeInUp}
                  className="font-black text-navy-700 mb-6 flex items-center gap-3 text-lg"
                >
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <MapPin size={20} className="text-white" />
                  </span>
                  {locale === 'ar' ? 'بيانات الشحن' : 'Shipping Info'}
                </motion.h2>

                <div className="space-y-5">
                  <motion.div variants={fadeInUp}>
                    <label className="label flex items-center gap-2">
                      <UserIcon size={14} className="text-teal-500" />
                      {t('checkout.name')}
                    </label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="input"
                      placeholder={locale === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                    />
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label className="label flex items-center gap-2">
                      <Phone size={14} className="text-teal-500" />
                      {t('checkout.phone')}
                    </label>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      type="tel"
                      required
                      className="input"
                      placeholder="01XXXXXXXXX"
                      dir="ltr"
                    />
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label className="label flex items-center gap-2">
                      <MapPin size={14} className="text-teal-500" />
                      {t('checkout.address')}
                    </label>
                    <textarea
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      required
                      rows={3}
                      className="input resize-none"
                      placeholder={
                        locale === 'ar'
                          ? 'المحافظة، المدينة، الشارع، رقم المبنى'
                          : 'Governorate, city, street, building no.'
                      }
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Vodafone Cash */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
              >
                <motion.h2
                  variants={fadeInUp}
                  className="font-black text-navy-700 mb-6 flex items-center gap-3 text-lg"
                >
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-black">
                    V
                  </span>
                  {t('checkout.vodafoneCash')}
                </motion.h2>

                <motion.p
                  variants={fadeInUp}
                  className="text-gray-600 text-sm mb-5 leading-relaxed"
                >
                  {t('checkout.vodafoneInstructions')}
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  className="bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-dashed border-red-400 rounded-2xl p-5 mb-5"
                >
                  <p className="text-sm text-red-600 font-bold mb-2">
                    {t('checkout.vodafoneNumber')}
                  </p>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-2xl md:text-3xl font-black text-navy-700 tracking-wider" dir="ltr">
                      {vodaNumber}
                    </span>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyNumber}
                      className="bg-navy-500 hover:bg-navy-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm transition-colors shadow-md"
                    >
                      <Copy size={16} />
                      {t('checkout.copy')}
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl p-4 mb-6 shadow-lg"
                >
                  <p className="text-sm opacity-90 mb-1">
                    {locale === 'ar'
                      ? 'المبلغ المطلوب تحويله:'
                      : 'Amount to transfer:'}
                  </p>
                  <p className="text-3xl font-black">
                    {formatPrice(total, locale)}
                  </p>
                </motion.div>

                <motion.label variants={fadeInUp} className="label">
                  {t('checkout.uploadReceipt')}
                </motion.label>

                <AnimatePresence mode="wait">
                  {!receiptPreview ? (
                    <motion.label
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 hover:border-teal-500 rounded-2xl p-8 cursor-pointer transition-colors bg-gray-50 hover:bg-teal-50/30 group"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        className="hidden"
                      />
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors"
                      >
                        <Upload size={28} className="text-teal-600" />
                      </motion.div>
                      <div className="text-center">
                        <p className="font-bold text-navy-700">
                          {t('checkout.chooseImage')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG — Max 5MB
                        </p>
                      </div>
                    </motion.label>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative border-2 border-teal-500 rounded-2xl p-3 bg-teal-50"
                    >
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors z-10"
                      >
                        <X size={16} />
                      </button>
                      <img
                        src={receiptPreview}
                        alt="receipt"
                        className="max-h-64 mx-auto rounded-xl shadow-md"
                      />
                      <div className="flex items-center justify-center gap-2 mt-3 text-teal-700 font-semibold text-sm">
                        <CheckCircle2 size={16} />
                        {receipt?.name}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="btn-primary w-full text-lg py-5 shadow-xl"
              >
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
              </motion.button>
            </form>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 lg:sticky lg:top-24">
                <h2 className="font-black text-navy-700 mb-5 flex items-center gap-2 text-lg">
                  <Sparkles size={20} className="text-teal-500" />
                  {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                </h2>

                <div className="space-y-3 max-h-72 overflow-y-auto mb-5 pr-1">
                  {items.map(i => (
                    <div key={i.productId} className="flex gap-3 items-center">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <img
                          src={i.image}
                          alt={i.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white rounded-full text-xs flex items-center justify-center font-bold shadow">
                          {i.qty}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-2 text-navy-700">
                          {i.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatPrice(i.price, locale)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t pt-5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('cart.subtotal')}</span>
                    <span className="font-semibold">
                      {formatPrice(subtotal, locale)}
                    </span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Sparkles size={12} />
                        {coupon.code}
                      </span>
                      <span className="font-semibold">
                        -{formatPrice(discount, locale)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-lg border-t pt-3 text-navy-700">
                    <span>{t('cart.total')}</span>
                    <span className="text-teal-600">
                      {formatPrice(total, locale)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}