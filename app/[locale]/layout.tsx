'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthProvider';
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Palette,
  Sparkles, Menu, X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error(t('admin.notAuthorized'));
    }
  }, [loading, user, isAdmin, t]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div
        className="text-center py-20"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {t('common.loading')}
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1
          className="text-2xl font-bold mb-4"
          style={{ color: '#ef4444' }}
        >
          {t('admin.notAuthorized')}
        </h1>
        <Link
          href={`/${locale}/login?redirect=/admin`}
          className="btn-primary inline-flex"
        >
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  const links = [
    {
      href: `/${locale}/admin`,
      label: t('admin.dashboard'),
      icon: LayoutDashboard,
      exact: true
    },
    {
      href: `/${locale}/admin/products`,
      label: t('admin.products'),
      icon: Package
    },
    {
      href: `/${locale}/admin/orders`,
      label: t('admin.orders'),
      icon: ShoppingCart
    },
    {
      href: `/${locale}/admin/coupons`,
      label: t('admin.coupons'),
      icon: Tag
    },
    {
      href: `/${locale}/admin/announcements`,
      label: locale === 'ar' ? 'الشريط الإعلاني' : 'Announcements',
      icon: Sparkles
    },
    {
      href: `/${locale}/admin/theme`,
      label: t('admin.theme'),
      icon: Palette
    }
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <h1
        className="text-2xl md:text-3xl font-black mb-6 flex items-center justify-between gap-3"
        style={{ color: 'var(--color-text-primary)' }}
      >
        <span>{t('admin.title')}</span>

        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2.5 rounded-xl"
          style={{
            background: 'var(--color-bg-card)',
            color: 'var(--color-secondary-500)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </h1>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <aside
          className={`
            lg:sticky lg:top-24 h-fit
            ${sidebarOpen ? 'block' : 'hidden lg:block'}
          `}
        >
          <nav
            className="rounded-2xl p-3 flex flex-col gap-1.5"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid rgba(212, 175, 55, 0.15)'
            }}
          >
            {links.map((l) => {
              const active = isActive(l.href, l.exact);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all"
                  style={
                    active
                      ? {
                          background: `linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-600))`,
                          color: '#0a1828'
                        }
                      : {
                          color: 'var(--color-text-primary)',
                          background: 'transparent'
                        }
                  }
                >
                  <l.icon size={18} />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}