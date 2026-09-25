'use client';
import { useEffect, useState } from 'react';

export default function HydrationFix() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add('hydrated');
    return () => {
      document.documentElement.classList.remove('hydrated');
    };
  }, []);

  return null;
}