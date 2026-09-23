import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, Timestamp
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

export const getProducts = async (): Promise<Product[]> => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
};

export const getProduct = async (id: string): Promise<Product | null> => {
  const ref = doc(db, 'products', id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
};

export const addProduct = async (p: Omit<Product, 'id'>) => {
  return addDoc(collection(db, 'products'), { ...p, createdAt: serverTimestamp() });
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  return updateDoc(doc(db, 'products', id), data);
};

export const deleteProduct = async (id: string) => {
  return deleteDoc(doc(db, 'products', id));
};

export const createOrder = async (o: Omit<Order, 'id'>) => {
  return addDoc(collection(db, 'orders'), { ...o, createdAt: serverTimestamp() });
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
};

export const getAllOrders = async (): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(200));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
};

export const updateOrderStatus = async (id: string, status: Order['status']) => {
  return updateDoc(doc(db, 'orders', id), { status });
};

export const getCoupon = async (code: string): Promise<Coupon | null> => {
  const q = query(
    collection(db, 'coupons'),
    where('code', '==', code.toUpperCase()),
    where('active', '==', true),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Coupon;
};

export const getAllCoupons = async (): Promise<Coupon[]> => {
  const snap = await getDocs(collection(db, 'coupons'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon));
};

export const addCoupon = async (c: Omit<Coupon, 'id'>) => {
  return addDoc(collection(db, 'coupons'), { ...c, code: c.code.toUpperCase() });
};

export const deleteCoupon = async (id: string) => deleteDoc(doc(db, 'coupons', id));

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const q = query(
    collection(db, 'reviews'),
    where('productId', '==', productId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
};

export const addReview = async (r: Omit<Review, 'id'>) => {
  return addDoc(collection(db, 'reviews'), { ...r, createdAt: serverTimestamp() });
};