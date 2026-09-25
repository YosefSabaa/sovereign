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
import { useWishlist } from './WishlistProvider';

const announcements = {
  ar: [
    '🚚 شحن مجاني للطلبات فوق 1000 ج.م',
    '✨ خصم 10% بكود SOVEREIGN10',
    '🏥 منتجات طبية معتمدة وجودة عالية',
    '💳 دفع آمن عبر المحفظة الالكترونية - انستاباي - الدفع عند الاستلام'
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
  const { items: wishlistItems } = useWishlist();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const other = locale === 'ar' ? 'en' : 'ar';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setAnnouncementIndex(
        (prev) => (prev + 1) % announcements[locale as 'ar' | 'en'].length
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [locale, mounted]);

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/products`, label: t('products') },
    ...(mounted && user
      ? [{ href: `/${locale}/orders`, label: t('orders') }]
      : []),
    {
      href: `/${locale}/contact`,
      label: locale === 'ar' ? 'تواصل معنا' : 'Contact'
    }
  ];

  const switchLocale = () => {
    const newPath = pathname.replace(`/${locale}`, `/${other}`);
    return newPath || `/${other}`;
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Announcement Bar */}
      <div
        className="relative py-2 overflow-hidden"
        style={{
          background: `linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-600), var(--color-secondary-500))`,
          color: '#0a1828'
        }}
      >
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
          className="absolute inset-0 w-32"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)'
          }}
        />
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="relative h-5 overflow-hidden">
            {mounted ? (
              <AnimatePresence mode="wait">
                <motion.p
                  key={announcementIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs md:text-sm font-bold absolute inset-0 flex items-center justify-center"
                >
                  {announcements[locale as 'ar' | 'en'][announcementIndex]}
                </motion.p>
              </AnimatePresence>
            ) : (
              <p className="text-xs md:text-sm font-bold absolute inset-0 flex items-center justify-center">
                {announcements[locale as 'ar' | 'en'][0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`transition-all duration-500 ${
          scrolled ? 'py-2 shadow-2xl' : 'py-3'
        }`}
        style={{
          background: scrolled
            ? 'rgba(15, 31, 54, 0.95)'
            : 'var(--color-primary-800)',
          backdropFilter: scrolled ? 'blur(20px)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <motion.img
              src="/logo.png"
              alt="Sovereign"
              className="h-12 w-auto object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              style={{
                filter:
                  'brightness(0) invert(1) drop-shadow(0 0 10px rgba(212, 175, 55, 0.3))'
              }}
            />
            <div className="hidden sm:flex flex-col">
              <span
                className="font-black text-lg leading-none"
                style={{
                  color: 'var(--color-text-primary)',
                  letterSpacing: '0.15em'
                }}
              >
                SOVEREIGN
              </span>
              <span
                className="text-[8px] leading-none mt-0.5 font-semibold"
                style={{
                  color: 'var(--color-secondary-500)',
                  letterSpacing: '0.3em'
                }}
              >
                MEDICAL
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    active ? '' : 'hover:opacity-80'
                  }`}
                  style={{
                    color: active
                      ? 'var(--color-secondary-500)'
                      : 'var(--color-text-primary)'
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(212, 175, 55, 0.1)' }}
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
                className="p-2 rounded-full flex items-center gap-1 text-sm transition-all hover:opacity-80"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Globe size={18} />
                <span className="font-semibold">
                  {locale === 'ar' ? 'EN' : 'ع'}
                </span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link
                href={`/${locale}/wishlist`}
                className="relative p-2 rounded-full transition-all hover:opacity-80"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Heart size={22} />
                {mounted && wishlistItems.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
                    style={{ background: '#ef4444', color: '#fff' }}
                  >
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link
                href={`/${locale}/cart`}
                className="relative p-2 rounded-full transition-all hover:opacity-80"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <ShoppingCart size={22} />
                {mounted && count > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
                    style={{
                      background: `linear-gradient(to bottom right, var(--color-secondary-400), var(--color-secondary-600))`,
                      color: '#0a1828'
                    }}
                  >
                    {count}
                  </span>
                )}
              </Link>
            </motion.div>

            {mounted && isAdmin && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href={`/${locale}/admin`}
                  className="p-2 rounded-full transition-all hover:opacity-80"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <LayoutDashboard size={22} />
                </Link>
              </motion.div>
            )}

            {mounted && user ? (
              <div className="flex items-center gap-1">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link
                    href={`/${locale}/account`}
                    className="p-2 rounded-full transition-all hover:opacity-80"
                    style={{ color: 'var(--color-text-primary)' }}
                    title={t('account')}
                  >
                    <User size={22} />
                  </Link>
                </motion.div>
                <motion.button
                  onClick={logout}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full transition-all hover:opacity-80"
                  style={{ color: 'var(--color-text-primary)' }}
                  title={t('logout')}
                >
                  <LogOut size={22} />
                </motion.button>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href={`/${locale}/login`}
                  className="p-2 rounded-full transition-all hover:opacity-80"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <User size={22} />
                </Link>
              </motion.div>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2"
              style={{ color: 'var(--color-text-primary)' }}
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
              className="md:hidden overflow-hidden"
              style={{ background: 'var(--color-primary-900)' }}
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="font-medium py-2 transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {l.label}
                  </Link>
                ))}
                {mounted && user && (
                  <Link
                    href={`/${locale}/account`}
                    onClick={() => setOpen(false)}
                    className="font-medium py-2 transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {t('account')}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}