'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getProduct, getProductReviews, addReview, Product, Review
} from '@/lib/firestore';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  ShoppingCart, Star, Minus, Plus, ArrowLeft, ArrowRight,
  Package, Check, AlertTriangle, RefreshCw, Heart,
  Truck, ShieldCheck, Sparkles, Send, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const { add } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const Arrow = locale === 'ar' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const id = params?.id as string;
    if (!id || id === 'undefined' || id === 'null') {
      setError(
        locale === 'ar'
          ? `المعرّف غير صحيح`
          : `Invalid ID`
      );
      setLoading(false);
      return;
    }

    Promise.all([getProduct(id), getProductReviews(id)])
      .then(([p, r]) => {
        if (!p) {
          router.push(`/${locale}/products`);
          return;
        }
        setProduct(p);
        setReviews(r);
      })
      .catch((err) => {
        console.error(err);
        setError(locale === 'ar' ? 'فشل تحميل المنتج' : 'Failed to load');
      })
      .finally(() => setLoading(false));
  }, [params, locale, router]);

  // LOADING
  if (loading) {
    return (
      <div
        className="min-h-screen py-10 px-4"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 animate-pulse">
            <div
              className="aspect-square rounded-3xl"
              style={{ background: 'var(--color-bg-card)' }}
            />
            <div className="space-y-4 pt-4">
              <div
                className="h-10 rounded-full w-3/4"
                style={{ background: 'var(--color-bg-card)' }}
              />
              <div
                className="h-6 rounded-full w-1/3"
                style={{ background: 'var(--color-bg-card)' }}
              />
              <div
                className="h-32 rounded-2xl"
                style={{ background: 'var(--color-bg-card)' }}
              />
              <div
                className="h-14 rounded-full"
                style={{ background: 'var(--color-bg-card)' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-16"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div
          className="max-w-md w-full rounded-3xl p-8 text-center"
          style={{
            background: 'var(--color-bg-card)',
            border: '2px solid rgba(239, 68, 68, 0.3)'
          }}
        >
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(239, 68, 68, 0.15)' }}
          >
            <AlertTriangle size={32} style={{ color: '#ef4444' }} />
          </div>
          <h1
            className="text-2xl font-black mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {locale === 'ar' ? 'حدث خطأ' : 'Error'}
          </h1>
          <p
            className="mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              <RefreshCw size={18} />
              {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
            <Link href={`/${locale}/products`} className="btn-outline">
              {locale === 'ar' ? 'كل المنتجات' : 'All Products'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const desc = locale === 'ar' ? product.descAr : product.descEn;
  const onSale = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = onSale
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;

  const handleAdd = () => {
    add({
      productId: product.id!,
      name,
      price: product.price,
      image: product.image,
      qty
    });
    toast.success(locale === 'ar' ? 'تمت الإضافة للسلة ✓' : 'Added to cart ✓');
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push(`/${locale}/cart`);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(locale === 'ar' ? 'يجب تسجيل الدخول' : 'Please login');
      return;
    }
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await addReview({
        productId: product.id!,
        userId: user.uid,
        userName: user.displayName || user.email || 'User',
        rating,
        comment
      });
      const updated = await getProductReviews(product.id!);
      setReviews(updated);
      setComment('');
      setRating(5);
      toast.success(locale === 'ar' ? 'تم إرسال التقييم ✓' : 'Review sent ✓');
    } catch {
      toast.error(t('auth.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div
      className="min-h-screen py-8 px-4 relative overflow-hidden"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--color-secondary-500)' }}
        />
        <div
          className="absolute bottom-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--color-primary-500)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm mb-6"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-1.5 font-semibold transition-colors group hover:opacity-80"
            style={{ color: 'var(--color-secondary-500)' }}
          >
            <Arrow
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            {t('common.back')}
          </Link>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span
            className="font-medium line-clamp-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {name}
          </span>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 mb-16">
          {/* ============ IMAGE ============ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="relative">
              {/* Glow */}
              <div
                className="absolute -inset-4 rounded-[2rem] blur-2xl opacity-30"
                style={{
                  background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-primary-500))`
                }}
              />

              {/* Image */}
              <div
                className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl group"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                <motion.img
                  src={product.image}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                  {onSale && (
                    <motion.span
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="px-4 py-2 rounded-full font-bold shadow-xl flex items-center gap-1"
                      style={{
                        background: 'linear-gradient(to right, #ef4444, #dc2626)',
                        color: '#fff'
                      }}
                    >
                      <Sparkles size={16} />
                      -{discountPercent}%
                    </motion.span>
                  )}
                  {product.stock > 0 && product.stock < 5 && (
                    <span
                      className="px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                      style={{
                        background: 'linear-gradient(to right, #f97316, #ea580c)',
                        color: '#fff'
                      }}
                    >
                      {locale === 'ar'
                        ? `آخر ${product.stock} قطع!`
                        : `Only ${product.stock} left!`}
                    </span>
                  )}
                </div>

                {/* Favorite */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm transition-colors"
                  style={{
                    background: isFavorite
                      ? '#ef4444'
                      : 'rgba(26, 47, 77, 0.9)',
                    color: isFavorite
                      ? '#fff'
                      : 'var(--color-secondary-500)',
                    border: '1px solid rgba(212, 175, 55, 0.3)'
                  }}
                >
                  <Heart
                    size={22}
                    className={isFavorite ? 'fill-white' : ''}
                  />
                </motion.button>

                {/* Out of stock */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
                    <div
                      className="px-8 py-6 rounded-2xl text-center shadow-2xl"
                      style={{ background: 'var(--color-bg-card)' }}
                    >
                      <Package
                        size={48}
                        className="mx-auto mb-2"
                        style={{ color: 'var(--color-text-muted)' }}
                      />
                      <p
                        className="font-black text-xl"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {t('product.outOfStock')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  {
                    icon: Truck,
                    label: locale === 'ar' ? 'شحن سريع' : 'Fast Ship'
                  },
                  {
                    icon: ShieldCheck,
                    label: locale === 'ar' ? 'دفع آمن' : 'Secure'
                  },
                  {
                    icon: Award,
                    label: locale === 'ar' ? 'جودة عالية' : 'Premium'
                  }
                ].map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all hover:scale-105"
                    style={{
                      background: 'var(--color-bg-card)',
                      border: '1px solid rgba(212, 175, 55, 0.2)'
                    }}
                  >
                    <Icon
                      size={20}
                      style={{ color: 'var(--color-secondary-500)' }}
                    />
                    <span
                      className="text-xs font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ============ INFO ============ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Category + Rating */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--color-secondary-500)',
                  border: '1px solid rgba(212, 175, 55, 0.3)'
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: 'var(--color-secondary-500)' }}
                />
                {product.category}
              </span>

              {avgRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < Math.round(avgRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-500'
                        }
                      />
                    ))}
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {avgRating.toFixed(1)} ({reviews.length})
                  </span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span
                className="text-4xl md:text-5xl font-black"
                style={{ color: 'var(--color-secondary-500)' }}
              >
                {formatPrice(product.price, locale)}
              </span>
              {onSale && (
                <span
                  className="text-2xl line-through"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {formatPrice(product.oldPrice!, locale)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold mb-6"
              style={
                product.stock > 0
                  ? {
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }
                  : {
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }
              }
            >
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 bg-current rounded-full animate-pulse" />
                  <Check size={16} />
                  {t('product.inStock')} ({product.stock})
                </>
              ) : (
                <>
                  <Package size={16} />
                  {t('product.outOfStock')}
                </>
              )}
            </div>

            {/* Description */}
            <div
              className="relative mb-8 p-5 rounded-2xl"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid rgba(212, 175, 55, 0.15)'
              }}
            >
              <p
                className="leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {desc}
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span
                className="font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t('product.quantity')}:
              </span>
              <div
                className="flex items-center rounded-full overflow-hidden"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '2px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="p-3 transition-colors disabled:opacity-30"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <Minus size={18} />
                </motion.button>
                <span
                  className="px-8 font-black text-xl min-w-[70px] text-center"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {qty}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  disabled={qty >= product.stock}
                  className="p-3 transition-colors disabled:opacity-30"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <Plus size={18} />
                </motion.button>
              </div>
              <span
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                = {formatPrice(product.price * qty, locale)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="btn-secondary flex-1 text-lg py-4"
              >
                <ShoppingCart size={22} />
                {t('product.addToCart')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn-primary flex-1 text-lg py-4"
              >
                {t('product.buyNow')}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* ============ REVIEWS ============ */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pt-12"
          style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(to bottom right, #facc15, #f59e0b)'
              }}
            >
              <Star size={24} className="text-white fill-white" />
            </div>
            <div>
              <h2
                className="text-3xl font-black"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t('product.reviews')}
              </h2>
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {reviews.length}{' '}
                {locale === 'ar' ? 'تقييم' : 'reviews'}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* List */}
            <div className="lg:col-span-3 space-y-4">
              {reviews.length === 0 ? (
                <div
                  className="text-center py-16 rounded-3xl"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '2px dashed rgba(212, 175, 55, 0.2)'
                  }}
                >
                  <div
                    className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(212, 175, 55, 0.1)' }}
                  >
                    <Star
                      size={40}
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  </div>
                  <p
                    className="font-semibold"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {t('product.noReviews')}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {locale === 'ar'
                      ? 'كن أول من يقيّم المنتج'
                      : 'Be the first to review'}
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {reviews.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl p-5 transition-shadow hover:shadow-lg"
                      style={{
                        background: 'var(--color-bg-card)',
                        border: '1px solid rgba(212, 175, 55, 0.15)'
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black shadow-md"
                            style={{
                              background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-primary-500))`
                            }}
                          >
                            {r.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p
                              className="font-bold"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {r.userName}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              {formatDate(r.createdAt, locale)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < r.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-500'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p
                        className="leading-relaxed text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {r.comment}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={submitReview}
                className="rounded-3xl p-6 lg:sticky lg:top-24"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
                    }}
                  >
                    <Send size={18} style={{ color: '#0a1828' }} />
                  </div>
                  <h3
                    className="font-black text-lg"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {t('product.addReview')}
                  </h3>
                </div>

                {/* Rating stars */}
                <div className="mb-5">
                  <label className="label">{t('product.yourRating')}</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <motion.button
                        key={n}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(n)}
                      >
                        <Star
                          size={36}
                          className={
                            n <= (hoverRating || rating)
                              ? 'fill-yellow-400 text-yellow-400 drop-shadow-md'
                              : 'text-gray-500'
                          }
                        />
                      </motion.button>
                    ))}
                  </div>
                  <p
                    className="text-xs mt-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {rating === 5 &&
                      (locale === 'ar' ? 'ممتاز! 🌟' : 'Excellent! 🌟')}
                    {rating === 4 &&
                      (locale === 'ar' ? 'جيد جداً 😊' : 'Very good 😊')}
                    {rating === 3 && (locale === 'ar' ? 'جيد 🙂' : 'Good 🙂')}
                    {rating === 2 && (locale === 'ar' ? 'مقبول 😐' : 'Fair 😐')}
                    {rating === 1 && (locale === 'ar' ? 'سيء 😞' : 'Poor 😞')}
                  </p>
                </div>

                {/* Comment */}
                <div className="mb-5">
                  <label className="label">{t('product.yourComment')}</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="input resize-none"
                    required
                    placeholder={
                      locale === 'ar'
                        ? 'شاركنا تجربتك مع المنتج...'
                        : 'Share your experience...'
                    }
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting || !user}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full py-4"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {t('product.submitReview')}
                    </>
                  )}
                </motion.button>

                {!user && (
                  <p
                    className="text-sm mt-3 text-center font-semibold"
                    style={{ color: '#ef4444' }}
                  >
                    {t('checkout.loginRequired')}
                  </p>
                )}
              </form>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}