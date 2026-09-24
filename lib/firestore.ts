import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, limit, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export type Product = {
  id?: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number;
  oldPrice?: number;
  image: string;
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
};

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
  receiptUrl: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: Timestamp;
};

export type Coupon = {
  id?: string;
  code: string;
  discountPercent: number;
  active: boolean;
};

export type Review = {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp;
};

// ==================== HELPERS ====================

/**
 * ✅ دالة تنظيف - تشيل الحقول الفاضية (undefined) لأن Firestore ما بيقبلهاش
 */
const cleanUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }

  if (obj && typeof obj === 'object') {
    // لو Timestamp من Firebase، رجعه زي ما هو
    if (obj?.toMillis || obj?.seconds !== undefined) {
      return obj;
    }

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

/**
 * ✅ ترتيب تنازلي حسب التاريخ (في الـ client)
 */
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
  const products = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  return sortByDateDesc(products);
};

export const getProduct = async (id: string): Promise<Product | null> => {
  const ref = doc(db, 'products', id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
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

// ==================== ORDERS ====================

export const createOrder = async (o: Omit<Order, 'id'>) => {
  return addDoc(collection(db, 'orders'), {
    ...cleanUndefined(o),
    createdAt: serverTimestamp()
  });
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
  return sortByDateDesc(orders);
};

export const getAllOrders = async (): Promise<Order[]> => {
  const snap = await getDocs(collection(db, 'orders'));
  const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
  return sortByDateDesc(orders).slice(0, 200);
};

export const updateOrderStatus = async (id: string, status: Order['status']) => {
  return updateDoc(doc(db, 'orders', id), { status });
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
  return coupon;
};

export const getAllCoupons = async (): Promise<Coupon[]> => {
  const snap = await getDocs(collection(db, 'coupons'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon));
};

export const addCoupon = async (c: Omit<Coupon, 'id'>) => {
  return addDoc(collection(db, 'coupons'), {
    ...cleanUndefined(c),
    code: c.code.toUpperCase()
  });
};

export const deleteCoupon = async (id: string) => {
  return deleteDoc(doc(db, 'coupons', id));
};

// ==================== REVIEWS ====================

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const q = query(
    collection(db, 'reviews'),
    where('productId', '==', productId)
  );
  const snap = await getDocs(q);
  const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
  return sortByDateDesc(reviews);
};

export const addReview = async (r: Omit<Review, 'id'>) => {
  return addDoc(collection(db, 'reviews'), {
    ...cleanUndefined(r),
    createdAt: serverTimestamp()
  });
};