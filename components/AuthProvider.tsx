'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type AuthCtx = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  logout: async () => {},
  isAdmin: false
});

export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, 'users', u.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            email: u.email,
            name: u.displayName || '',
            createdAt: new Date()
          });
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <Ctx.Provider value={{ user, loading, logout, isAdmin }}>
      {children}
    </Ctx.Provider>
  );
}