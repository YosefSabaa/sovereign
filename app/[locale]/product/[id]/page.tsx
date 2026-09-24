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
  Truck, ShieldCheck, Sparkles, ChevronLeft, ChevronRight,
  Send, ThumbsUp, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fadeInUp, staggerContainer } from '@/lib/animations';

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
  const [activeImage, setActiveImage] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const Arrow = locale === 'ar' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const id = params?.id as string;
    const info: any = {
      paramsId: id,
      locale,
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: new Date().toISOString()
    };

    if (!id || id === 'undefined' || id === 'null') {
      setError(
        locale === 'ar'
          ? `المعرّف (ID) غير صحيح: "${id}"`
          : `Invalid ID: "${id}"`
      );
      setDebugInfo(info);
      setLoading(false);
      return;
    }

    Promise.all([getProduct(id), getProductReviews(id)])
      .then(([p, r]) => {
        if (!p) {
          setError(
            locale === 'ar'
              ? `المنتج مش موجود في قاعدة البيانات (ID: ${id})`
              : `Product not found in database (ID: ${id})`
          );
          setDebugInfo({ ...info, productExists: false });
          setLoading(false);
          return;
        }
        setProduct(p);
        setReviews(r);
        setDebugInfo({ ...info, productExists: true });
      })
      .catch((err) => {
        console.error('❌ Firebase Error:', err);
        setError(
          locale === 'ar'
            ? `خطأ Firebase: ${err?.message || err?.code}`
            : `Firebase Error: ${err?.message || err?.code}`
        );
        setDebugInfo({
          ...info,
          errorCode: err?.code,
          errorMessage: err?.message
        });
      })
      .finally(() => setLoading(false));
  }, [params, locale]);

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl" />
          <div className="space-y-4 pt-4">
            <div className="h-10 bg-gray-200 rounded-full w-3/4" />
            <div className="h-6 bg-gray-200 rounded-full w-1/3" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-12 bg-gray-200 rounded-full w-2/3" />
            <div className="h-14 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // ==================== ERROR ====================
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-3xl p-8 shadow-xl"
        >
          <div className="flex items-start gap-4 mb-6">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-lg"
            >
              <AlertTriangle size={32} className="text-white" />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-red-700 mb-2">
                {locale === 'ar' ? 'حدث خطأ' : 'Something went wrong'}
              </h1>
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-red-200 mb-6">
            <h2 className="font-bold text-navy-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {locale === 'ar' ? 'معلومات التشخيص' : 'Debug Info'}
            </h2>
            <div className="space-y-2 text-sm">
              {Object.entries(debugInfo).map(([key, value]) => (
                <div key={key} className="flex gap-3 items-start">
                  <span className="font-bold text-navy-700 min-w-[130px]">
                    {key}:
                  </span>
                  <span className="text-gray-700 break-all flex-1 font-mono text-xs bg-gray-100 rounded px-2 py-1">
                    {typeof value === 'object'
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
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
        </motion.div>
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
      toast.success(locale === 'ar' ? 'تم إرسال التقييم ✓' : 'Review submitted ✓');
    } catch {
      toast.error(t('auth.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -left-20 w-96 h-96 bg-navy-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-gray-500 mb-6"
        >
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-1.5 text-navy-600 hover:text-teal-600 font-semibold transition-colors group"
          >
            <Arrow size={16} className="group-hover:-translate-x-1 transition-transform" />
            {t('common.back')}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium line-clamp-1">{name}</span>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 mb-16">
          {/* ============ IMAGE SECTION ============ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="relative">
              {/* Decorative glow */}
              <div className="absolute -inset-4 bg-gradient-to-br from-teal-400/20 to-navy-500/20 rounded-[2rem] blur-2xl" />

              {/* Main image */}
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-2xl border border-gray-100 group">
                <motion.img
                  key={activeImage}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src={product.image}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                  {onSale && (
                    <motion.span
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full font-bold shadow-xl flex items-center gap-1"
                    >
                      <Sparkles size={16} />
                      خصم {discountPercent}%
                    </motion.span>
                  )}
                  {product.stock > 0 && product.stock < 5 && (
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      آخر {product.stock} قطع!
                    </span>
                  )}
                </div>

                {/* Favorite button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm transition-colors ${
                    isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-gray-600 hover:bg-white'
                  }`}
                >
                  <Heart size={22} className={isFavorite ? 'fill-white' : ''} />
                </motion.button>

                {/* Out of stock overlay */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
                    <div className="bg-white px-8 py-6 rounded-2xl text-center shadow-2xl">
                      <Package size={48} className="text-gray-400 mx-auto mb-2" />
                      <p className="font-black text-navy-700 text-xl">
                        {t('product.outOfStock')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trust badges strip */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { icon: Truck, label: locale === 'ar' ? 'شحن سريع' : 'Fast Ship' },
                  { icon: ShieldCheck, label: locale === 'ar' ? 'دفع آمن' : 'Secure' },
                  { icon: Award, label: locale === 'ar' ? 'جودة عالية' : 'Premium' }
                ].map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all"
                  >
                    <Icon size={20} className="text-teal-600" />
                    <span className="text-xs font-bold text-navy-700">
                      {label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ============ INFO SECTION ============ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Category + Rating */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-200">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
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
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-semibold">
                    {avgRating.toFixed(1)} ({reviews.length})
                  </span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-navy-800 mb-4 leading-tight">
              {name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
                {formatPrice(product.price, locale)}
              </span>
              {onSale && (
                <span className="text-2xl text-gray-400 line-through">
                  {formatPrice(product.oldPrice!, locale)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold mb-6 ${
                product.stock > 0
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
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
            <div className="relative mb-8 p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
              <p className="text-gray-700 leading-relaxed">{desc}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-bold text-navy-700">
                {t('product.quantity')}:
              </span>
              <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden bg-white shadow-sm">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-30"
                >
                  <Minus size={18} />
                </motion.button>
                <span className="px-8 font-black text-xl min-w-[70px] text-center text-navy-700">
                  {qty}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  disabled={qty >= product.stock}
                  className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-30"
                >
                  <Plus size={18} />
                </motion.button>
              </div>
              <span className="text-sm text-gray-500">
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
          className="border-t border-gray-200 pt-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Star size={24} className="text-white fill-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-navy-800">
                {t('product.reviews')}
              </h2>
              <p className="text-gray-500 text-sm">
                {reviews.length}{' '}
                {locale === 'ar' ? 'تقييم' : 'reviews'}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-3 space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-200">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Star size={40} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-semibold">
                    {t('product.noReviews')}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
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
                      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-navy-500 flex items-center justify-center text-white font-black shadow-md">
                            {r.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-navy-700">
                              {r.userName}
                            </p>
                            <p className="text-xs text-gray-400">
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
                                  : 'text-gray-200'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {r.comment}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Add Review Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={submitReview}
                className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-100 shadow-lg lg:sticky lg:top-24"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                    <Send size={18} className="text-white" />
                  </div>
                  <h3 className="font-black text-navy-700 text-lg">
                    {t('product.addReview')}
                  </h3>
                </div>

                {/* Star rating */}
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
                              : 'text-gray-300'
                          }
                        />
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {rating === 5 && (locale === 'ar' ? 'ممتاز! 🌟' : 'Excellent! 🌟')}
                    {rating === 4 && (locale === 'ar' ? 'جيد جداً 😊' : 'Very good 😊')}
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
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                  <p className="text-sm text-red-500 mt-3 text-center font-semibold">
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