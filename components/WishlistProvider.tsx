'use client';
import {
  createContext, useContext, useEffect, useState, ReactNode, useCallback
} from 'react';
import { useAuth } from './AuthProvider';
import { getWishlist, toggleWishlist } from '@/lib/firestore';

type WishlistCtx = {
  items: string[];
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
};

const Ctx = createContext<WishlistCtx>({
  items: [],
  loading: true,
  isInWishlist: () => false,
  toggle: async () => {}
});

export const useWishlist = () => useContext(Ctx);

const STORAGE_KEY = 'sovereign_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadLocal = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const loadFromFirestore = useCallback(async () => {
    if (!user || typeof window === 'undefined') return;
    try {
      const list = await getWishlist(user.uid);
      const ids = list.map((i) => i.productId);
      setItems(ids);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    if (!mounted) return;
    loadLocal();
    setLoading(false);
  }, [mounted, loadLocal]);

  useEffect(() => {
    if (!mounted) return;
    if (user) loadFromFirestore();
  }, [user, mounted, loadFromFirestore]);

  const isInWishlist = (productId: string) => items.includes(productId);

  const toggle = async (productId: string) => {
    if (typeof window === 'undefined') return;

    const newItems = items.includes(productId)
      ? items.filter((id) => id !== productId)
      : [...items, productId];

    setItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));

    if (user) {
      try {
        await toggleWishlist(user.uid, productId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Ctx.Provider value={{ items, loading, isInWishlist, toggle }}>
      {children}
    </Ctx.Provider>
  );
}