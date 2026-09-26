'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getProduct, getProductReviews, addReview, Product, Review,
  ProductVariant
} from '@/lib/firestore';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { useWishlist } from '@/components/WishlistProvider';
import { useCompare } from '@/components/CompareProvider';
import ImageGallery from '@/components/ImageGallery';
import VariantSelector from '@/components/VariantSelector';
import RelatedProducts from '@/components/RelatedProducts';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  ShoppingCart, Star, Minus, Plus, ArrowLeft, ArrowRight,
  Package, Check, AlertTriangle, RefreshCw, Heart,
  Truck, ShieldCheck, Sparkles, Send, Award, GitCompare
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const { add } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();
  const { isInCompare, toggle: toggleCompare, isFull: compareFull } =
    useCompare();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // 🎯 Variants متعددة
  const [selectedVariants, setSelectedVariants] = useState<ProductVariant[]>(
    []
  );
  const [effectiveStock, setEffectiveStock] = useState(0);
  const [variantsPriceAdjustment, setVariantsPriceAdjustment] = useState(0);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [inWishlist, setInWishlist] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const Arrow = locale === 'ar' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const id = params?.id as string;
    if (!id) {
      setError(locale === 'ar' ? 'معرّف غير صحيح' : 'Invalid ID');
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

  useEffect(() => {
    if (mounted && product?.id) {
      setInWishlist(isInWishlist(product.id));
      setInCompare(isInCompare(product.id));
    }
  }, [mounted, product?.id, isInWishlist, isInCompare]);

  // 🎯 استقبل التغييرات من VariantSelector
  const handleVariantsChange = useCallback(
    (
      selected: ProductVariant[],
      stock: number,
      adjustment: number
    ) => {
      setSelectedVariants(selected);
      setEffectiveStock(stock);
      setVariantsPriceAdjustment(adjustment);
      setQty(1);
    },
    []
  );

  // ==================== LOADING ====================
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ERROR ====================
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div
          className="max-w-md w-full rounded-3xl p-8 text-center"
          style={{
            background: 'var(--color-bg-card)',
            border: '2px solid rgba(239, 68, 68, 0.3)'
          }}
        >
          <AlertTriangle
            size={48}
            className="mx-auto mb-4"
            style={{ color: '#ef4444' }}
          />
          <h1
            className="text-2xl font-black mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {locale === 'ar' ? 'حدث خطأ' : 'Error'}
          </h1>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary inline-flex"
          >
            <RefreshCw size={18} />
            {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
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

  // 🎯 السعر النهائي والمخزون
  const finalPrice = product.price + variantsPriceAdjustment;
  const availableStock =
    selectedVariants.length > 0 ? effectiveStock : product.stock;
  const variantName = selectedVariants.map((v) => v.name).join(' - ');

  // 🎯 صور المنتج
  const allImages = [
    ...(product.images || []),
    product.image,
    ...(product.variants?.filter((v) => v.image).map((v) => v.image!) || [])
  ].filter(Boolean) as string[];

  const uniqueImages = Array.from(new Set(allImages));

  // 🎯 صورة الـ variant المختار
  const variantImage =
    selectedVariants.find((v) => v.image)?.image || null;

  const handleAdd = () => {
    if (!product.id) return;

    if (availableStock === 0) {
      toast.error(
        locale === 'ar'
          ? 'هذه التركيبة غير متوفرة'
          : 'This combination is not available'
      );
      return;
    }

    add({
      productId: product.id,
      name,
      price: finalPrice,
      image: variantImage || product.image,
      qty,
      variantId: selectedVariants.map((v) => v.id).join('|'),
      variantName: variantName
    });

    toast.success(locale === 'ar' ? 'تمت الإضافة للسلة ✓' : 'Added to cart ✓');
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push(`/${locale}/cart`);
  };

  const handleWishlist = async () => {
    if (!product.id) return;
    const wasIn = inWishlist;
    setInWishlist(!wasIn);
    await toggleWishlist(product.id);
    toast.success(
      wasIn
        ? locale === 'ar'
          ? 'تم الحذف من المفضلة'
          : 'Removed'
        : locale === 'ar'
          ? 'تمت الإضافة للمفضلة ❤️'
          : 'Added to wishlist ❤️'
    );
  };

  const handleCompare = () => {
    if (!product.id) return;
    if (!inCompare && compareFull) {
      toast.error(
        locale === 'ar' ? 'الحد الأقصى 3 منتجات' : 'Maximum 3 products'
      );
      return;
    }
    const wasIn = inCompare;
    setInCompare(!wasIn);
    toggleCompare(product.id);
    toast.success(
      wasIn
        ? locale === 'ar'
          ? 'تم الحذف من المقارنة'
          : 'Removed from compare'
        : locale === 'ar'
          ? 'تمت الإضافة للمقارنة'
          : 'Added to compare'
    );
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
          className="flex items-center gap-2 text-sm mb-6 flex-wrap"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-1.5 font-semibold group"
            style={{ color: 'var(--color-secondary-500)' }}
          >
            <Arrow
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            {t('common.back')}
          </Link>
          <span>/</span>
          <Link
            href={`/${locale}/products?category=${product.category}`}
            className="font-medium hover:opacity-80"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {product.category}
          </Link>
          <span>/</span>
          <span
            className="font-medium line-clamp-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {name}
          </span>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 mb-16">
          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <ImageGallery images={uniqueImages} alt={name} />

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
          </motion.div>

          {/* INFO */}
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
            <div className="flex items-baseline gap-3 mb-6 flex-wrap">
              <span
                className="text-4xl md:text-5xl font-black"
                style={{ color: 'var(--color-secondary-500)' }}
              >
                {formatPrice(finalPrice, locale)}
              </span>
              {onSale && (
                <span
                  className="text-2xl line-through"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {formatPrice(product.oldPrice!, locale)}
                </span>
              )}
              {onSale && (
                <span
                  className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{
                    background: 'linear-gradient(to right, #ef4444, #dc2626)',
                    color: '#fff'
                  }}
                >
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Stock */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold mb-6"
              style={
                availableStock > 0
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
              {availableStock > 0 ? (
                <>
                  <span className="w-2 h-2 bg-current rounded-full animate-pulse" />
                  <Check size={16} />
                  {t('product.inStock')} ({availableStock})
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
              className="relative mb-6 p-5 rounded-2xl"
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

            {/* 🎯 Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <VariantSelector
                variants={product.variants}
                combinations={product.combinations}
                onSelectionChange={handleVariantsChange}
              />
            )}

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
                  onClick={() => setQty(Math.min(availableStock, qty + 1))}
                  disabled={qty >= availableStock}
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
                = {formatPrice(finalPrice * qty, locale)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                disabled={availableStock === 0}
                className="btn-secondary flex-1 text-lg py-4"
              >
                <ShoppingCart size={22} />
                {t('product.addToCart')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={availableStock === 0}
                className="btn-primary flex-1 text-lg py-4"
              >
                {t('product.buyNow')}
              </motion.button>
            </div>

            {/* Secondary actions */}
            <div className="flex gap-3">
              <motion.button
                onClick={handleWishlist}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
                style={{
                  background: inWishlist
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'var(--color-bg-card)',
                  color: inWishlist
                    ? '#ef4444'
                    : 'var(--color-text-primary)',
                  border: `2px solid ${
                    inWishlist
                      ? 'rgba(239, 68, 68, 0.3)'
                      : 'rgba(212, 175, 55, 0.2)'
                  }`
                }}
              >
                <Heart
                  size={18}
                  className={inWishlist ? 'fill-current' : ''}
                />
                {inWishlist
                  ? locale === 'ar'
                    ? 'في المفضلة'
                    : 'In Wishlist'
                  : locale === 'ar'
                    ? 'أضف للمفضلة'
                    : 'Add to Wishlist'}
              </motion.button>

              <motion.button
                onClick={handleCompare}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
                style={{
                  background: inCompare
                    ? 'rgba(212, 175, 55, 0.15)'
                    : 'var(--color-bg-card)',
                  color: inCompare
                    ? 'var(--color-secondary-500)'
                    : 'var(--color-text-primary)',
                  border: `2px solid ${
                    inCompare
                      ? 'rgba(212, 175, 55, 0.5)'
                      : 'rgba(212, 175, 55, 0.2)'
                  }`
                }}
              >
                <GitCompare size={18} />
                {inCompare
                  ? locale === 'ar'
                    ? 'في المقارنة'
                    : 'In Compare'
                  : locale === 'ar'
                    ? 'أضف للمقارنة'
                    : 'Add to Compare'}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* REVIEWS */}
        <section
          className="pt-12"
          style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(to bottom right, #facc15, #f59e0b)`
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
                {reviews.length} {locale === 'ar' ? 'تقييم' : 'reviews'}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
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

            <div className="lg:col-span-2">
              <form
                onSubmit={submitReview}
                className="rounded-3xl p-6 lg:sticky lg:top-24"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
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
                </div>

                <div className="mb-5">
                  <label className="label">{t('product.yourComment')}</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="input resize-none"
                    required
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
        </section>

        {/* RELATED PRODUCTS */}
        <RelatedProducts
          category={product.category}
          excludeId={product.id!}
        />
      </div>
    </div>
  );
}
