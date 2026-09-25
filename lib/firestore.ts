import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, limit, serverTimestamp, Timestamp, increment, setDoc
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== TYPES ====================

export type ProductVariant = {
  id: string;
  name: string;
  type: 'size' | 'color' | 'other';
  priceAdjustment?: number;
  stock: number;
  image?: string;
  hexColor?: string;
};

export type Product = {
  id?: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  variants?: ProductVariant[];
  flashSale?: {
    enabled: boolean;
    discountPercent: number;
    endsAt: Timestamp;
  };
  category: string;
  stock: number;
  rating?: number;
  ratingCount?: number;
  createdAt?: Timestamp;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  variantId?: string;
  variantName?: string;
};

export type PaymentMethod = 'cod' | 'e_wallet' | 'instapay';

export type Order = {
  id?: string;
  userId: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  receiptUrl?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  timeline?: Array<{
    status: Order['status'];
    note?: string;
    timestamp: Timestamp;
  }>;
  trackingNumber?: string;
  createdAt?: Timestamp;
};

export type Coupon = {
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  active: boolean;
  minOrder?: number;
  expiresAt?: Timestamp;
  usageLimit?: number;
  usageCount?: number;
};

export type Review = {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt?: Timestamp;
};

export type WishlistItem = {
  id?: string;
  userId: string;
  productId: string;
  createdAt?: Timestamp;
};

// ==================== HELPERS ====================

const cleanUndefined = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(cleanUndefined);
  if (obj && typeof obj === 'object') {
    if (obj?.toMillis || obj?.seconds !== undefined) return obj;
    const cleaned: any = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleaned[key] = cleanUndefined(value);
      }
    });
    return cleaned;
  }
  return obj;
};

const sortByDateDesc = <T extends { createdAt?: Timestamp }>(arr: T[]): T[] => {
  return arr.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
};

// ==================== PRODUCTS ====================

export const getProducts = async (): Promise<Product[]> => {
  const snap = await getDocs(collection(db, 'products'));
  const products = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  return sortByDateDesc(products);
};

export const getProduct = async (id: string): Promise<Product | null> => {
  const ref = doc(db, 'products', id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
};

export const getProductsByCategory = async (
  category: string
): Promise<Product[]> => {
  const q = query(
    collection(db, 'products'),
    where('category', '==', category)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
};

export const getRelatedProducts = async (
  category: string,
  excludeId: string,
  limitCount: number = 4
): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'products'),
      where('category', '==', category)
    );
    const snap = await getDocs(q);
    const products = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Product))
      .filter((p) => p.id !== excludeId)
      .slice(0, limitCount);
    return products;
  } catch {
    return [];
  }
};

export const addProduct = async (p: Omit<Product, 'id'>) => {
  return addDoc(collection(db, 'products'), {
    ...cleanUndefined(p),
    createdAt: serverTimestamp()
  });
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  return updateDoc(doc(db, 'products', id), cleanUndefined(data));
};

export const deleteProduct = async (id: string) => {
  return deleteDoc(doc(db, 'products', id));
};

export const decrementStock = async (
  productId: string,
  qty: number,
  variantId?: string
) => {
  const ref = doc(db, 'products', productId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const product = snap.data() as Product;

  if (variantId && product.variants) {
    const updatedVariants = product.variants.map((v) =>
      v.id === variantId ? { ...v, stock: Math.max(0, v.stock - qty) } : v
    );
    const newStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
    await updateDoc(ref, { variants: updatedVariants, stock: newStock });
  } else {
    await updateDoc(ref, {
      stock: Math.max(0, (product.stock || 0) - qty)
    });
  }
};

// ==================== ORDERS ====================

export const createOrder = async (o: Omit<Order, 'id'>) => {
  const initialTimeline = [
    {
      status: 'pending' as const,
      note: 'Order placed',
      timestamp: Timestamp.now()
    }
  ];

  for (const item of o.items) {
    await decrementStock(item.productId, item.qty, item.variantId);
  }

  return addDoc(collection(db, 'orders'), {
    ...cleanUndefined(o),
    timeline: initialTimeline,
    createdAt: serverTimestamp()
  });
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
  return sortByDateDesc(orders);
};

export const getAllOrders = async (): Promise<Order[]> => {
  const snap = await getDocs(collection(db, 'orders'));
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
  return sortByDateDesc(orders).slice(0, 200);
};

export const updateOrderStatus = async (
  id: string,
  status: Order['status'],
  note?: string
) => {
  const ref = doc(db, 'orders', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const order = snap.data() as Order;
  const newTimeline = [
    ...(order.timeline || []),
    {
      status,
      note: note || '',
      timestamp: Timestamp.now()
    }
  ];

  return updateDoc(ref, { status, timeline: newTimeline });
};

// ==================== COUPONS ====================

export const getCoupon = async (code: string): Promise<Coupon | null> => {
  const q = query(
    collection(db, 'coupons'),
    where('code', '==', code.toUpperCase()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const coupon = { id: d.id, ...d.data() } as Coupon;

  if (!coupon.active) return null;

  if (coupon.expiresAt) {
    const now = Date.now();
    const expiry = coupon.expiresAt.toMillis?.() || 0;
    if (now > expiry) return null;
  }

  if (coupon.usageLimit && coupon.usageCount) {
    if (coupon.usageCount >= coupon.usageLimit) return null;
  }

  return coupon;
};

export const getAllCoupons = async (): Promise<Coupon[]> => {
  const snap = await getDocs(collection(db, 'coupons'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
};

export const addCoupon = async (c: Omit<Coupon, 'id'>) => {
  return addDoc(collection(db, 'coupons'), {
    ...cleanUndefined(c),
    code: c.code.toUpperCase(),
    usageCount: 0
  });
};

export const deleteCoupon = async (id: string) => {
  return deleteDoc(doc(db, 'coupons', id));
};

export const incrementCouponUsage = async (id: string) => {
  return updateDoc(doc(db, 'coupons', id), {
    usageCount: increment(1)
  });
};

// ==================== REVIEWS ====================

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const q = query(
    collection(db, 'reviews'),
    where('productId', '==', productId)
  );
  const snap = await getDocs(q);
  const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
  return sortByDateDesc(reviews);
};

export const addReview = async (r: Omit<Review, 'id'>) => {
  return addDoc(collection(db, 'reviews'), {
    ...cleanUndefined(r),
    createdAt: serverTimestamp()
  });
};

// ==================== WISHLIST ====================

export const getWishlist = async (userId: string): Promise<WishlistItem[]> => {
  const q = query(collection(db, 'wishlist'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WishlistItem));
};

export const toggleWishlist = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  const q = query(
    collection(db, 'wishlist'),
    where('userId', '==', userId),
    where('productId', '==', productId),
    limit(1)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    await deleteDoc(doc(db, 'wishlist', snap.docs[0].id));
    return false;
  } else {
    await addDoc(collection(db, 'wishlist'), {
      userId,
      productId,
      createdAt: serverTimestamp()
    });
    return true;
  }
};

export const isInWishlist = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  const q = query(
    collection(db, 'wishlist'),
    where('userId', '==', userId),
    where('productId', '==', productId),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
};

// ==================== ANNOUNCEMENTS ====================

export type Announcement = {
  id: string;
  textAr: string;
  textEn: string;
  active: boolean;
  order: number;
  emoji?: string;
  createdAt?: Timestamp;
};

export type AnnouncementsSettings = {
  enabled: boolean;
  speed: number;
  backgroundColor: string;
  textColor: string;
  announcements: Announcement[];
};

export const DEFAULT_ANNOUNCEMENTS: AnnouncementsSettings = {
  enabled: true,
  speed: 4,
  backgroundColor: '#d4af37',
  textColor: '#0a1828',
  announcements: [
    {
      id: '1',
      textAr: 'شحن مجاني للطلبات فوق 1000 ج.م',
      textEn: 'Free shipping over 1000 EGP',
      emoji: '🚚',
      active: true,
      order: 0
    },
    {
      id: '2',
      textAr: 'خصم 10% بكود SOVEREIGN10',
      textEn: '10% off with code SOVEREIGN10',
      emoji: '✨',
      active: true,
      order: 1
    },
    {
      id: '3',
      textAr: 'منتجات طبية معتمدة وجودة عالية',
      textEn: 'Certified medical-grade products',
      emoji: '🏥',
      active: true,
      order: 2
    },
    {
      id: '4',
      textAr: 'دفع آمن عبر المحفظة الإلكترونية',
      textEn: 'Secure payment via e-wallet',
      emoji: '💳',
      active: true,
      order: 3
    }
  ]
};

export const getAnnouncements = async (): Promise<AnnouncementsSettings> => {
  try {
    const ref = doc(db, 'settings', 'announcements');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...DEFAULT_ANNOUNCEMENTS,
        ...data,
        announcements:
          data.announcements || DEFAULT_ANNOUNCEMENTS.announcements
      } as AnnouncementsSettings;
    }
    return DEFAULT_ANNOUNCEMENTS;
  } catch {
    return DEFAULT_ANNOUNCEMENTS;
  }
};

export const saveAnnouncements = async (
  settings: AnnouncementsSettings
) => {
  const ref = doc(db, 'settings', 'announcements');
  await setDoc(
    ref,
    {
      ...cleanUndefined(settings),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
};