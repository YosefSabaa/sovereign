'use client';
import {
  createContext, useContext, useEffect, useState, ReactNode
} from 'react';
import { CartItem } from '@/lib/firestore';

type CartCtx = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const Ctx = createContext<CartCtx>({} as CartCtx);
export const useCart = () => useContext(Ctx);

const KEY = 'sovereign_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {}
    }
    setLoaded(true);
  }, [mounted]);

  useEffect(() => {
    if (loaded && mounted && typeof window !== 'undefined') {
      localStorage.setItem(KEY, JSON.stringify(items));
    }
  }, [items, loaded, mounted]);

  const add = (item: CartItem) => {
    setItems((prev) => {
      const found = prev.find((i) => i.productId === item.productId);
      if (found) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [...prev, item];
    });
  };

  const remove = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) return remove(productId);
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  };

  const clear = () => setItems([]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, updateQty, clear, subtotal, count }}>
      {children}
    </Ctx.Provider>
  );
}