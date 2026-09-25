'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthProvider';
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Palette
} from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error(t('admin.notAuthorized'));
    }
  }, [loading, user, isAdmin, t]);

  if (loading) return <div className="text-center py-20">{t('common.loading')}</div>;

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          {t('admin.notAuthorized')}
        </h1>
        <Link href={`/${locale}/login?redirect=/admin`} className="btn-primary inline-flex">
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  const links = [
    { href: `/${locale}/admin`, label: t('admin.dashboard'), icon: LayoutDashboard, exact: true },
    { href: `/${locale}/admin/products`, label: t('admin.products'), icon: Package },
    { href: `/${locale}/admin/orders`, label: t('admin.orders'), icon: ShoppingCart },
    { href: `/${locale}/admin/coupons`, label: t('admin.coupons'), icon: Tag },
    {
      href: `/${locale}/admin/theme`,
      label: locale === 'ar' ? 'الألوان' : 'Theme',
      icon: Palette
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-navy-800 mb-6">{t('admin.title')}</h1>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="lg:sticky lg:top-24 h-fit">
          <nav className="card p-3 flex lg:flex-col gap-2 overflow-x-auto">
            {links.map(l => {
              const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
              return (
                <Link key={l.href} href={l.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-teal-500 text-white'
                      : 'text-navy-700 hover:bg-gray-100'
                  }`}>
                  <l.icon size={20} />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}