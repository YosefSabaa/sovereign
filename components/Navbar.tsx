'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, User, Menu, X, Globe, LogOut, LayoutDashboard, Heart
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';

const announcements = {
  ar: [
    '🚚 شحن مجاني للطلبات فوق 1000 ج.م',
    '✨ خصم 10% بكود SOVEREIGN10',
    '🏥 منتجات طبية معتمدة وجودة عالية',
    '💳 دفع آمن عبر فودافون كاش'
  ],
  en: [
    '🚚 Free shipping over 1000 EGP',
    '✨ 10% off with code SOVEREIGN10',
    '🏥 Certified medical-grade products',
    '💳 Secure payment via Vodafone Cash'
  ]
};

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const other = locale === 'ar' ? 'en' : 'ar';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex(
        prev => (prev + 1) % announcements[locale as 'ar' | 'en'].length
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [locale]);

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/products`, label: t('products') },
    ...(user ? [{ href: `/${locale}/orders`, label: t('orders') }] : [])
  ];

  const switchLocale = () => {
    const newPath = pathname.replace(`/${locale}`, `/${other}`);
    return newPath || `/${other}`;
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Announcement Bar - integrated with navbar */}
      <div className="relative bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500 text-white py-2 overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-32"
        />

        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="relative h-5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={announcementIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-xs md:text-sm font-semibold absolute inset-0 flex items-center justify-center"
              >
                {announcements[locale as 'ar' | 'en'][announcementIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`transition-all duration-500 ${
          scrolled
            ? 'bg-navy-500/95 backdrop-blur-xl shadow-2xl py-2'
            : 'bg-navy-500 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg glow-pulse"
            >
              <Heart size={20} className="text-white fill-white" />
            </motion.div>
            <span className="font-black text-xl tracking-wide text-white">
              Sovereign
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {links.map(l => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    active ? 'text-teal-300' : 'text-white/90 hover:text-teal-300'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-white/10 rounded-full"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link
                href={switchLocale()}
                className="p-2 hover:bg-white/10 rounded-full flex items-center gap-1 text-sm text-white transition-all"
              >
                <Globe size={18} />
                <span className="font-semibold">
                  {locale === 'ar' ? 'EN' : 'ع'}
                </span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link
                href={`/${locale}/cart`}
                className="relative p-2 hover:bg-white/10 rounded-full text-white transition-all"
              >
                <ShoppingCart size={22} />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-br from-teal-400 to-teal-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {isAdmin && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href={`/${locale}/admin`}
                  className="p-2 hover:bg-white/10 rounded-full text-white transition-all"
                >
                  <LayoutDashboard size={22} />
                </Link>
              </motion.div>
            )}

            {user ? (
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-white/10 rounded-full text-white transition-all"
                title={t('logout')}
              >
                <LogOut size={22} />
              </motion.button>
            ) : (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href={`/${locale}/login`}
                  className="p-2 hover:bg-white/10 rounded-full text-white transition-all"
                >
                  <User size={22} />
                </Link>
              </motion.div>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-white"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-navy-700 overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {links.map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="hover:text-teal-400 font-medium py-2 text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}