'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { createOrder, PaymentMethod } from '@/lib/firestore';
import {
  calculateDiscount,
  describeCoupon,
  AppliedCoupon
} from '@/lib/coupon';
import { formatPrice } from '@/lib/utils';
import PageTransition from '@/components/PageTransition';
import {
  Copy, Upload, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight,
  X, MapPin, Phone, User as UserIcon, Package, Sparkles, Clock,
  Banknote, Wallet, Building2, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  staggerContainer, staggerItem, fadeInUp, heartbeat
} from '@/lib/animations';

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  icon: any;
  ar: string;
  en: string;
  descAr: string;
  descEn: string;
  color: string;
  needsReceipt: boolean;
}> = [
  {
    id: 'cod',
    icon: Banknote,
    ar: 'الدفع عند الاستلام',
    en: 'Cash on Delivery',
    descAr: 'ادفع نقداً عند استلام الطلب',
    descEn: 'Pay cash when you receive',
    color: '#10b981',
    needsReceipt: false
  },
  {
    id: 'vodafone_cash',
    icon: Wallet,
    ar: 'فودافون كاش',
    en: 'Vodafone Cash',
    descAr: 'الدفع عبر محفظة فودافون كاش',
    descEn: 'Pay via Vodafone Cash wallet',
    color: '#ef4444',
    needsReceipt: true
  },
  {
    id: 'instapay',
    icon: Building2,
    ar: 'إنستاباي',
    en: 'InstaPay',
    descAr: 'الدفع عبر تحويل إنستاباي',
    descEn: 'Pay via InstaPay transfer',
    color: '#8b5cf6',
    needsReceipt: true
  }
];

export default function CheckoutPage() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const vodaNumber = process.env.NEXT_PUBLIC_VODAFONE_CASH || '01012345678';
  const instaPayHandle =
    process.env.NEXT_PUBLIC_INSTAPAY || 'sovereign@instapay';

  const discount = calculateDiscount(subtotal, coupon);
  const total = subtotal - discount;

  const selectedMethod = PAYMENT_METHODS.find(
    (m) => m.id === paymentMethod
  )!;

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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

    if (selectedMethod.needsReceipt && !receipt) {
      toast.error(
        locale === 'ar' ? 'يجب رفع صورة التحويل' : 'Please upload the receipt'
      );
      return;
    }

    if (items.length === 0) return;

    setSubmitting(true);
    try {
      let receiptUrl = '';
      if (selectedMethod.needsReceipt && receipt) {
        receiptUrl = await uploadReceipt(receipt);
      }

      const orderData: any = {
        userId: user.uid,
        userName: name,
        userPhone: phone,
        userAddress: address,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          image: i.image,
          qty: i.qty,
          variantId: i.variantId,
          variantName: i.variantName
        })),
        subtotal,
        discount,
        total,
        paymentMethod,
        status: 'pending'
      };

      if (coupon?.code) orderData.couponCode = coupon.code;
      if (receiptUrl) orderData.receiptUrl = receiptUrl;

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

  // SUCCESS
  if (success) {
    return (
      <PageTransition>
        <div
          className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative overflow-hidden"
          style={{ background: 'var(--color-bg-base)' }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl text-center relative z-10 w-full"
          >
            <motion.div
              variants={staggerItem}
              className="relative mx-auto w-32 h-32 mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
                style={{ background: '#10b981' }}
              />
              <motion.div
                animate={heartbeat}
                className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl"
                style={{
                  background: `linear-gradient(to bottom right, #10b981, #059669)`
                }}
              >
                <CheckCircle2 size={64} className="text-white" />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-3xl md:text-4xl font-black mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t('checkout.orderSuccess')}
            </motion.h1>

            <motion.div
              variants={staggerItem}
              className="rounded-2xl p-5 inline-block shadow-lg mb-6"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
            >
              <p
                className="text-sm mb-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {t('checkout.orderNumber')}
              </p>
              <p
                className="text-2xl font-black tracking-wider"
                style={{ color: 'var(--color-secondary-500)' }}
              >
                #{success.slice(0, 8).toUpperCase()}
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="rounded-2xl p-5 my-6 inline-flex items-start gap-3 text-start max-w-md"
              style={{
                background:
                  paymentMethod === 'cod'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(234, 179, 8, 0.1)',
                border: `2px solid ${
                  paymentMethod === 'cod'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'rgba(234, 179, 8, 0.3)'
                }`
              }}
            >
              <AlertCircle
                size={22}
                className="flex-shrink-0 mt-0.5"
                style={{
                  color: paymentMethod === 'cod' ? '#10b981' : '#eab308'
                }}
              />
              <p
                className="text-sm font-medium"
                style={{
                  color: paymentMethod === 'cod' ? '#10b981' : '#eab308'
                }}
              >
                {paymentMethod === 'cod'
                  ? locale === 'ar'
                    ? 'سيتم التواصل معك قريباً لتأكيد الطلب وموعد التسليم'
                    : "We'll contact you soon"
                  : t('checkout.pendingNote')}
              </p>
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
      <div
        className="max-w-2xl mx-auto px-4 py-20 text-center"
        style={{ background: 'var(--color-bg-base)', minHeight: '80vh' }}
      >
        <h1
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
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
      <div
        className="min-h-screen py-10 px-4 relative overflow-hidden"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="max-w-7xl mx-auto relative">
          <Link
            href={`/${locale}/cart`}
            className="inline-flex items-center gap-2 mb-6 font-semibold transition-colors group"
            style={{ color: 'var(--color-secondary-500)' }}
          >
            <Arrow
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            {t('cart.title')}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <motion.div
              animate={heartbeat}
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
              }}
            >
              <CheckCircle2 size={26} style={{ color: '#0a1828' }} />
            </motion.div>
            <h1
              className="text-2xl md:text-3xl font-black"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t('checkout.title')}
            </h1>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              {/* SHIPPING INFO */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="rounded-3xl p-6 shadow-lg"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                <motion.h2
                  variants={fadeInUp}
                  className="font-black mb-6 flex items-center gap-3 text-lg"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to bottom right, #3b82f6, #2563eb)`
                    }}
                  >
                    <MapPin size={20} className="text-white" />
                  </span>
                  {locale === 'ar' ? 'بيانات الشحن' : 'Shipping Info'}
                </motion.h2>

                <div className="space-y-5">
                  <motion.div variants={fadeInUp}>
                    <label
                      className="label flex items-center gap-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <UserIcon
                        size={14}
                        style={{ color: 'var(--color-secondary-500)' }}
                      />
                      {t('checkout.name')}
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="input"
                    />
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label
                      className="label flex items-center gap-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <Phone
                        size={14}
                        style={{ color: 'var(--color-secondary-500)' }}
                      />
                      {t('checkout.phone')}
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, '');
                        setPhone(cleaned.slice(0, 11));
                      }}
                      type="tel"
                      required
                      className="input"
                      placeholder="01XXXXXXXXX"
                      dir="ltr"
                      inputMode="numeric"
                      maxLength={11}
                    />
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label
                      className="label flex items-center gap-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <MapPin
                        size={14}
                        style={{ color: 'var(--color-secondary-500)' }}
                      />
                      {t('checkout.address')}
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      rows={3}
                      className="input resize-none"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* PAYMENT METHOD */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="rounded-3xl p-6 shadow-lg"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                <motion.h2
                  variants={fadeInUp}
                  className="font-black mb-6 flex items-center gap-3 text-lg"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
                    }}
                  >
                    <Sparkles size={20} style={{ color: '#0a1828' }} />
                  </span>
                  {locale === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                </motion.h2>

                <div className="grid gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;

                    return (
                      <motion.button
                        key={method.id}
                        type="button"
                        variants={fadeInUp}
                        onClick={() => setPaymentMethod(method.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="relative p-4 rounded-2xl text-start transition-all"
                        style={{
                          background: isSelected
                            ? `${method.color}15`
                            : 'var(--color-bg-elevated)',
                          border: `2px solid ${
                            isSelected
                              ? method.color
                              : 'rgba(212, 175, 55, 0.15)'
                          }`
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `${method.color}20`,
                              color: method.color
                            }}
                          >
                            <Icon size={24} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="font-bold"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {locale === 'ar' ? method.ar : method.en}
                            </p>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              {locale === 'ar' ? method.descAr : method.descEn}
                            </p>
                          </div>

                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              background: isSelected
                                ? method.color
                                : 'transparent',
                              border: isSelected
                                ? 'none'
                                : '2px solid rgba(212, 175, 55, 0.3)'
                            }}
                          >
                            {isSelected && (
                              <Check
                                size={14}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Payment Details */}
                <AnimatePresence mode="wait">
                  {paymentMethod === 'cod' && (
                    <motion.div
                      key="cod"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5 overflow-hidden"
                    >
                      <div
                        className="rounded-2xl p-4 flex items-start gap-3"
                        style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Banknote
                          size={22}
                          style={{
                            color: '#10b981',
                            flexShrink: 0,
                            marginTop: 2
                          }}
                        />
                        <div>
                          <p
                            className="font-bold text-sm mb-1"
                            style={{ color: '#10b981' }}
                          >
                            {locale === 'ar'
                              ? '💵 الدفع عند الاستلام'
                              : '💵 Cash on Delivery'}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: '#10b981' }}
                          >
                            {locale === 'ar'
                              ? 'سيتم التواصل معك من قبل فريقنا لتأكيد الطلب وموعد التسليم. الدفع نقداً عند استلام الطلب.'
                              : 'Our team will contact you to confirm your order. Pay cash on delivery.'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'vodafone_cash' && (
                    <motion.div
                      key="voda"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5 overflow-hidden space-y-4"
                    >
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {locale === 'ar'
                          ? 'قم بتحويل المبلغ إلى رقم فودافون كاش التالي ثم ارفع صورة التحويل.'
                          : 'Transfer the amount to the Vodafone Cash number below, then upload the receipt.'}
                      </p>

                      <div
                        className="rounded-2xl p-5"
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '2px dashed rgba(239, 68, 68, 0.4)'
                        }}
                      >
                        <p
                          className="text-sm font-bold mb-2"
                          style={{ color: '#ef4444' }}
                        >
                          {locale === 'ar'
                            ? 'رقم فودافون كاش:'
                            : 'Vodafone Cash Number:'}
                        </p>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span
                            className="text-2xl md:text-3xl font-black tracking-wider"
                            style={{ color: 'var(--color-text-primary)' }}
                            dir="ltr"
                          >
                            {vodaNumber}
                          </span>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyToClipboard(vodaNumber)}
                            className="btn-secondary px-4 py-2.5 text-sm"
                          >
                            <Copy size={16} />
                            {t('checkout.copy')}
                          </motion.button>
                        </div>
                      </div>

                      <div
                        className="rounded-2xl p-4 shadow-lg"
                        style={{
                          background: `linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-600))`
                        }}
                      >
                        <p
                          className="text-sm mb-1"
                          style={{ color: 'rgba(10, 24, 40, 0.7)' }}
                        >
                          {locale === 'ar'
                            ? 'المبلغ المطلوب تحويله:'
                            : 'Amount to transfer:'}
                        </p>
                        <p
                          className="text-3xl font-black"
                          style={{ color: '#0a1828' }}
                        >
                          {formatPrice(total, locale)}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'instapay' && (
                    <motion.div
                      key="insta"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5 overflow-hidden space-y-4"
                    >
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {locale === 'ar'
                          ? 'قم بتحويل المبلغ عبر إنستاباي إلى العنوان التالي ثم ارفع صورة التحويل.'
                          : 'Transfer the amount via InstaPay to the address below, then upload the receipt.'}
                      </p>

                      <div
                        className="rounded-2xl p-5"
                        style={{
                          background: 'rgba(139, 92, 246, 0.08)',
                          border: '2px dashed rgba(139, 92, 246, 0.4)'
                        }}
                      >
                        <p
                          className="text-sm font-bold mb-2"
                          style={{ color: '#8b5cf6' }}
                        >
                          {locale === 'ar'
                            ? 'عنوان إنستاباي:'
                            : 'InstaPay Handle:'}
                        </p>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span
                            className="text-lg md:text-2xl font-black tracking-wider break-all"
                            style={{ color: 'var(--color-text-primary)' }}
                            dir="ltr"
                          >
                            {instaPayHandle}
                          </span>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyToClipboard(instaPayHandle)}
                            className="btn-secondary px-4 py-2.5 text-sm"
                          >
                            <Copy size={16} />
                            {t('checkout.copy')}
                          </motion.button>
                        </div>
                      </div>

                      <div
                        className="rounded-2xl p-4 shadow-lg"
                        style={{
                          background: `linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-600))`
                        }}
                      >
                        <p
                          className="text-sm mb-1"
                          style={{ color: 'rgba(10, 24, 40, 0.7)' }}
                        >
                          {locale === 'ar'
                            ? 'المبلغ المطلوب تحويله:'
                            : 'Amount to transfer:'}
                        </p>
                        <p
                          className="text-3xl font-black"
                          style={{ color: '#0a1828' }}
                        >
                          {formatPrice(total, locale)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Receipt Upload */}
                {selectedMethod.needsReceipt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-5 overflow-hidden"
                  >
                    <label className="label">
                      {t('checkout.uploadReceipt')}
                    </label>

                    <AnimatePresence mode="wait">
                      {!receiptPreview ? (
                        <motion.label
                          key="upload"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center gap-3 rounded-2xl p-8 cursor-pointer transition-all group"
                          style={{
                            background: 'var(--color-bg-elevated)',
                            border: '2px dashed rgba(212, 175, 55, 0.3)'
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFile}
                            className="hidden"
                          />
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{
                              background: 'rgba(212, 175, 55, 0.15)'
                            }}
                          >
                            <Upload
                              size={28}
                              style={{ color: 'var(--color-secondary-500)' }}
                            />
                          </motion.div>
                          <div className="text-center">
                            <p
                              className="font-bold"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {t('checkout.chooseImage')}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
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
                          className="relative rounded-2xl p-3"
                          style={{
                            background: 'rgba(212, 175, 55, 0.08)',
                            border: '2px solid rgba(212, 175, 55, 0.5)'
                          }}
                        >
                          <button
                            type="button"
                            onClick={removeFile}
                            className="absolute top-3 right-3 p-1.5 rounded-full shadow-lg z-10"
                            style={{ background: '#ef4444', color: '#fff' }}
                          >
                            <X size={16} />
                          </button>
                          <img
                            src={receiptPreview}
                            alt="receipt"
                            className="max-h-64 mx-auto rounded-xl shadow-md"
                          />
                          <div
                            className="flex items-center justify-center gap-2 mt-3 font-semibold text-sm"
                            style={{ color: 'var(--color-secondary-500)' }}
                          >
                            <CheckCircle2 size={16} />
                            {receipt?.name}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
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
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {locale === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={22} />
                    {t('checkout.placeOrder')}
                  </>
                )}
              </motion.button>
            </form>

            {/* ORDER SUMMARY */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div
                className="rounded-3xl p-6 shadow-xl lg:sticky lg:top-24"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                <h2
                  className="font-black mb-5 flex items-center gap-2 text-lg"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <Sparkles
                    size={20}
                    style={{ color: 'var(--color-secondary-500)' }}
                  />
                  {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                </h2>

                <div className="space-y-3 max-h-72 overflow-y-auto mb-5 pr-1">
                  {items.map((i) => (
                    <div
                      key={`${i.productId}_${i.variantId || ''}`}
                      className="flex gap-3 items-center"
                    >
                      <div
                        className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ background: 'var(--color-bg-elevated)' }}
                      >
                        <img
                          src={i.image}
                          alt={i.name}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold shadow"
                          style={{
                            background: 'var(--color-secondary-500)',
                            color: '#0a1828'
                          }}
                        >
                          {i.qty}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold line-clamp-2"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {i.name}
                        </p>
                        {i.variantName && (
                          <p
                            className="text-xs"
                            style={{ color: 'var(--color-secondary-500)' }}
                          >
                            {i.variantName}
                          </p>
                        )}
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {formatPrice(i.price, locale)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="space-y-3 pt-5 text-sm"
                  style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}
                >
                  <div
                    className="flex justify-between"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <span>{t('cart.subtotal')}</span>
                    <span className="font-semibold">
                      {formatPrice(subtotal, locale)}
                    </span>
                  </div>

                  {coupon && (
                    <div
                      className="flex justify-between"
                      style={{ color: '#10b981' }}
                    >
                      <span className="flex items-center gap-1">
                        <Sparkles size={12} />
                        {describeCoupon(coupon, locale)}
                      </span>
                      <span className="font-semibold">
                        -{formatPrice(discount, locale)}
                      </span>
                    </div>
                  )}

                  <div
                    className="flex justify-between font-black text-lg pt-3"
                    style={{
                      color: 'var(--color-text-primary)',
                      borderTop: '1px solid rgba(212, 175, 55, 0.15)'
                    }}
                  >
                    <span>{t('cart.total')}</span>
                    <span style={{ color: 'var(--color-secondary-500)' }}>
                      {formatPrice(total, locale)}
                    </span>
                  </div>
                </div>

                <div
                  className="mt-5 p-3 rounded-xl flex items-start gap-2 text-xs"
                  style={{
                    background: `${selectedMethod.color}15`,
                    border: `1px solid ${selectedMethod.color}40`,
                    color: selectedMethod.color
                  }}
                >
                  {(() => {
                    const Icon = selectedMethod.icon;
                    return <Icon size={14} className="flex-shrink-0 mt-0.5" />;
                  })()}
                  <p className="font-medium">
                    {locale === 'ar' ? selectedMethod.ar : selectedMethod.en}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}