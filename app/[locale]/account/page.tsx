'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import PageTransition from '@/components/PageTransition';
import {
  User, Mail, Phone, MapPin, Package, Heart, Save, LogOut,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  staggerContainer, staggerItem, heartbeat
} from '@/lib/animations';

export default function AccountPage() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/${locale}/login?redirect=/account`);
      return;
    }
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || user.displayName || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
        }
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, locale, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        phone,
        address
      });
      if (name && name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }
      toast.success(locale === 'ar' ? 'تم حفظ التغييرات ✓' : 'Saved ✓');
    } catch {
      toast.error(t('auth.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}`);
  };

  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div
          className="w-12 h-12 rounded-full animate-spin"
          style={{
            border: '4px solid var(--color-secondary-500)',
            borderTopColor: 'transparent'
          }}
        />
      </div>
    );
  }

  if (!user) return null;

  const menuLinks = [
    { href: `/${locale}/orders`, icon: Package, ar: 'طلباتي', en: 'My Orders' },
    { href: `/${locale}/wishlist`, icon: Heart, ar: 'المفضلة', en: 'Wishlist' },
    { href: `/${locale}/cart`, icon: ShoppingBag, ar: 'السلة', en: 'Cart' }
  ];

  return (
    <PageTransition>
      <div
        className="min-h-screen py-10 px-4 relative overflow-hidden"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: 'var(--color-secondary-500)' }}
          />
          <div
            className="absolute bottom-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: 'var(--color-primary-500)' }}
          />
        </div>

        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8 flex-wrap"
          >
            <motion.div
              animate={heartbeat}
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
              }}
            >
              <span className="text-3xl font-black" style={{ color: '#0a1828' }}>
                {user.displayName?.[0]?.toUpperCase() ||
                  user.email?.[0]?.toUpperCase() ||
                  'U'}
              </span>
            </motion.div>
            <div>
              <h1
                className="text-2xl md:text-3xl font-black"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {locale === 'ar' ? 'حسابي' : 'My Account'}
              </h1>
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
                dir="ltr"
              >
                {user.email}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {menuLinks.map((link) => (
              <motion.div key={link.href} variants={staggerItem}>
                <Link
                  href={link.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-105"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid rgba(212, 175, 55, 0.15)'
                  }}
                >
                  <link.icon
                    size={28}
                    style={{ color: 'var(--color-secondary-500)' }}
                  />
                  <span
                    className="font-bold text-sm text-center"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {locale === 'ar' ? link.ar : link.en}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSave}
            className="rounded-3xl p-6 shadow-lg"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}
          >
            <h2
              className="text-xl font-black mb-6 flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <User size={22} style={{ color: 'var(--color-secondary-500)' }} />
              {locale === 'ar' ? 'بياناتي الشخصية' : 'Personal Info'}
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  className="label flex items-center gap-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <User size={14} style={{ color: 'var(--color-secondary-500)' }} />
                  {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input"
                />
              </div>

              <div>
                <label
                  className="label flex items-center gap-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <Mail size={14} style={{ color: 'var(--color-secondary-500)' }} />
                  {t('auth.email')}
                </label>
                <input
                  value={user.email || ''}
                  disabled
                  className="input opacity-60 cursor-not-allowed"
                  dir="ltr"
                />
              </div>

              <div>
                <label
                  className="label flex items-center gap-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <Phone size={14} style={{ color: 'var(--color-secondary-500)' }} />
                  {t('auth.phone')}
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  className="input"
                  dir="ltr"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div>
                <label
                  className="label flex items-center gap-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <MapPin size={14} style={{ color: 'var(--color-secondary-500)' }} />
                  {locale === 'ar' ? 'العنوان الافتراضي' : 'Default Address'}
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="input resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex-1 py-4"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-4 rounded-full font-bold flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <LogOut size={18} />
                {t('nav.logout')}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>
    </PageTransition>
  );
}