'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ShoppingCart, User, Menu, X, Globe, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const other = locale === 'ar' ? 'en' : 'ar';

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
    <nav className="bg-navy-500 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-navy-500 font-black text-lg">
            S
          </div>
          <span className="font-bold text-xl tracking-wide">Sovereign</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className="hover:text-teal-400 transition-colors font-medium">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href={switchLocale()}
            className="p-2 hover:bg-navy-700 rounded-lg flex items-center gap-1 text-sm">
            <Globe size={18} />
            {locale === 'ar' ? 'EN' : 'ع'}
          </Link>

          <Link href={`/${locale}/cart`} className="relative p-2 hover:bg-navy-700 rounded-lg">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal-500 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>

          {isAdmin && (
            <Link href={`/${locale}/admin`} className="p-2 hover:bg-navy-700 rounded-lg">
              <LayoutDashboard size={22} />
            </Link>
          )}

          {user ? (
            <button onClick={logout}
              className="p-2 hover:bg-navy-700 rounded-lg" title={t('logout')}>
              <LogOut size={22} />
            </button>
          ) : (
            <Link href={`/${locale}/login`} className="p-2 hover:bg-navy-700 rounded-lg">
              <User size={22} />
            </Link>
          )}

          <button onClick={() => setOpen(!open)} className="md:hidden p-2">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-navy-700 px-4 py-3 flex flex-col gap-3">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="hover:text-teal-400 font-medium">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}