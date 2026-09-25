'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

const messages = {
  ar: [
    '🚚 شحن مجاني للطلبات فوق 1000 ج.م',
    '✨ خصم 10% بكود SOVEREIGN10',
    '🏥 منتجات طبية معتمدة وجودة عالية',
    '💳 دفع آمن عبر المحفظة الالكترونية - انستاباي - الدفع عند الاستلام'
  ],
  en: [
    '🚚 Free shipping on orders over 1000 EGP',
    '✨ 10% off with code SOVEREIGN10',
    '🏥 Certified medical-grade products',
    '💳 Secure payment via Vodafone Cash'
  ]
};

export default function AnnouncementBar() {
  const locale = useLocale();
  const [current, setCurrent] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (hidden) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % messages[locale as 'ar' | 'en'].length);
    }, 4000);
    return () => clearInterval(interval);
  }, [locale, hidden]);

  if (hidden) return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative bg-gradient-to-r from-navy-700 via-teal-600 to-navy-700 text-white py-2.5 overflow-hidden"
    >
      {/* Shimmer effect */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-32"
      />

      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
        <Truck size={16} className="flex-shrink-0" />
        <div className="relative h-5 overflow-hidden flex-1 max-w-lg mx-auto text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={current}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-sm font-semibold absolute inset-0 flex items-center justify-center"
            >
              {messages[locale as 'ar' | 'en'][current]}
            </motion.p>
          </AnimatePresence>
        </div>
        <button
          onClick={() => setHidden(true)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}