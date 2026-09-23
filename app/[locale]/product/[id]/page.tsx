'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  getProduct, getProductReviews, addReview, Product, Review
} from '@/lib/firestore';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  ShoppingCart, Star, Minus, Plus, ArrowLeft, ArrowRight, Package, Check
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
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const Arrow = locale === 'ar' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const id = params.id as string;
    Promise.all([getProduct(id), getProductReviews(id)])
      .then(([p, r]) => {
        if (!p) return router.push(`/${locale}/products`);
        setProduct(p);
        setReviews(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id, locale, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const desc = locale === 'ar' ? product.descAr : product.descEn;
  const onSale = product.oldPrice && product.oldPrice > product.price;

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href={`/${locale}/products`}
        className="inline-flex items-center gap-2 text-navy-500 hover:text-teal-500 mb-6 font-semibold">
        <Arrow size={18} />
        {t('common.back')}
      </Link>

      <div className="grid md:grid-cols-2 gap-10 mb-16">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
          <img src={product.image} alt={name}
            className="w-full h-full object-cover" />
          {onSale && (
            <span className="absolute top-4 right-4 bg-red-500 text-white badge text-base">
              -{Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)}%
            </span>
          )}
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-black text-navy-700 mb-4">{name}</h1>

          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18}
                    className={i < Math.round(product.rating!)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating.toFixed(1)} ({product.ratingCount || 0})
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black text-teal-600">
              {formatPrice(product.price, locale)}
            </span>
            {onSale && (
              <span className="text-xl text-gray-400 line-through">
                {formatPrice(product.oldPrice!, locale)}
              </span>
            )}
          </div>

          <div className={`inline-flex items-center gap-2 badge mb-6 ${
            product.stock > 0
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {product.stock > 0 ? <Check size={16} /> : <Package size={16} />}
            {product.stock > 0
              ? `${t('product.inStock')} (${product.stock})`
              : t('product.outOfStock')}
          </div>

          <p className="text-gray-700 leading-relaxed mb-8">{desc}</p>

          <div className="flex items-center gap-4 mb-6">
            <span className="font-semibold text-navy-700">{t('product.quantity')}:</span>
            <div className="flex items-center border-2 border-gray-300 rounded-lg">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-3 hover:bg-gray-100">
                <Minus size={18} />
              </button>
              <span className="px-6 font-bold text-lg">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="p-3 hover:bg-gray-100">
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="btn-secondary flex-1">
              <ShoppingCart size={20} />
              {t('product.addToCart')}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn-primary flex-1">
              {t('product.buyNow')}
            </button>
          </div>
        </div>
      </div>

      <section className="border-t pt-10">
        <h2 className="text-2xl font-bold text-navy-700 mb-6">
          {t('product.reviews')} ({reviews.length})
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {reviews.length === 0 ? (
              <p className="text-gray-500">{t('product.noReviews')}</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="card p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-navy-700">{r.userName}</p>
                        <p className="text-xs text-gray-500">{formatDate(r.createdAt, locale)}</p>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14}
                            className={i < r.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <form onSubmit={submitReview} className="card p-6 sticky top-24">
              <h3 className="font-bold text-navy-700 mb-4">{t('product.addReview')}</h3>

              <div className="mb-4">
                <label className="label">{t('product.yourRating')}</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setRating(n)}>
                      <Star size={28}
                        className={n <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="label">{t('product.yourComment')}</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                  className="input resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !user}
                className="btn-primary w-full">
                {submitting ? t('common.loading') : t('product.submitReview')}
              </button>

              {!user && (
                <p className="text-sm text-red-500 mt-3 text-center">
                  {t('checkout.loginRequired')}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}