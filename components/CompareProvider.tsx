'use client';
import {
  createContext, useContext, useEffect, useState, ReactNode
} from 'react';

type CompareCtx = {
  items: string[];
  isInCompare: (productId: string) => boolean;
  toggle: (productId: string) => void;
  clear: () => void;
  isFull: boolean;
};

const Ctx = createContext<CompareCtx>({
  items: [],
  isInCompare: () => false,
  toggle: () => {},
  clear: () => {},
  isFull: false
});

export const useCompare = () => useContext(Ctx);

const STORAGE_KEY = 'sovereign_compare';
const MAX_ITEMS = 3;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, [mounted]);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const isInCompare = (productId: string) => items.includes(productId);

  const toggle = (productId: string) => {
    setItems((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= MAX_ITEMS) {
        return prev;
      }
      return [...prev, productId];
    });
  };

  const clear = () => setItems([]);

  return (
    <Ctx.Provider
      value={{
        items,
        isInCompare,
        toggle,
        clear,
        isFull: items.length >= MAX_ITEMS
      }}
    >
      {children}
    </Ctx.Provider>
  );
}