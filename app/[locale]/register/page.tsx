'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { phoneToEmail, isValidEgyptianPhone } from '@/lib/phoneAuth';
import PageTransition from '@/components/PageTransition';
import {
  UserPlus, Lock, User as UserIcon, Phone,
  Eye, EyeOff, AlertCircle, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fadeInUp, staggerContainer, staggerItem, heartbeat } from '@/lib/animations';

export default function RegisterPage() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEgyptianPhone(phone)) {
      const msg = locale === 'ar'
        ? 'أدخل رقم هاتف مصري صحيح (01xxxxxxxxx)'
        : 'Enter a valid Egyptian phone';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      // 🎯 حوّل الرقم لإيميل داخلي (المستخدم مش هيشوفه)
      const email = phoneToEmail(phone);

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        phone: phone.replace(/[^0-9]/g, ''),
        createdAt: new Date()
      });

      toast.success(locale === 'ar' ? 'تم إنشاء الحساب ✓' : 'Account created ✓');
      router.push(`/${locale}`);
    } catch (err: any) {
      let msg = t('auth.error');

      if (err.code === 'auth/email-already-in-use') {
        msg = locale === 'ar'
          ? 'رقم الهاتف مسجّل بالفعل'
          : 'Phone already registered';
      } else if (err.code === 'auth/weak-password') {
        msg = locale === 'ar'
          ? 'كلمة المرور ضعيفة (6 أحرف على الأقل)'
          : 'Password too weak';
      }

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl opacity-20"
            style={{ background: 'var(--color-secondary-500)' }}
          />
          <div
            className="absolute bottom-20 left-20 w-72 h-72 rounded-full blur-3xl opacity-20"
            style={{ background: 'var(--color-primary-500)' }}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-md w-full relative z-10"
        >
          <motion.div
            variants={staggerItem}
            className="rounded-3xl shadow-2xl p-8"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                animate={heartbeat}
                className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5 shadow-xl"
                style={{
                  background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
                }}
              >
                <UserPlus size={36} style={{ color: '#0a1828' }} />
              </motion.div>
              <h1
                className="text-2xl font-black mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t('auth.register')}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {locale === 'ar'
                  ? 'سجّل برقم هاتفك في ثوانٍ'
                  : 'Register with your phone number'}
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl p-3 mb-5 flex items-start gap-2"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <AlertCircle
                    size={18}
                    style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }}
                  />
                  <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              {/* الاسم */}
              <motion.div variants={fadeInUp}>
                <label
                  className="label flex items-center gap-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <UserIcon size={14} style={{ color: 'var(--color-secondary-500)' }} />
                  {t('auth.name')}
                </label>
                <div className="relative">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input pl-11"
                    placeholder={locale === 'ar' ? 'اسمك الكامل' : 'Full name'}
                  />
                  <UserIcon
                    size={18}
                    className="absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                </div>
              </motion.div>

              {/* رقم الهاتف */}
              <motion.div variants={fadeInUp}>
                <label
                  className="label flex items-center gap-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <Phone size={14} style={{ color: 'var(--color-secondary-500)' }} />
                  {t('auth.phone')}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, '');
                      setPhone(cleaned.slice(0, 11));
                    }}
                    required
                    className="input pl-11"
                    dir="ltr"
                    placeholder="01XXXXXXXXX"
                    inputMode="numeric"
                    maxLength={11}
                  />
                  <Phone
                    size={18}
                    className="absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                </div>
              </motion.div>

              {/* كلمة المرور */}
              <motion.div variants={fadeInUp}>
                <label
                  className="label flex items-center gap-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <Lock size={14} style={{ color: 'var(--color-secondary-500)' }} />
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input pl-11 pr-11"
                    dir="ltr"
                    placeholder="••••••••"
                  />
                  <Lock
                    size={18}
                    className="absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 right-4"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.button
                variants={fadeInUp}
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full text-lg py-4 mt-6"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    {t('auth.submitRegister')}
                  </>
                )}
              </motion.button>
            </form>

            <div
              className="mt-6 p-3 rounded-xl flex items-start gap-2"
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <ShieldCheck size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
              <p className="text-xs font-medium" style={{ color: '#10b981' }}>
                {locale === 'ar'
                  ? 'رقمك آمن. لن نشاركه مع أي طرف.'
                  : 'Your number is safe.'}
              </p>
            </div>

            <p
              className="text-center text-sm mt-5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {t('auth.hasAccount')}{' '}
              <Link
                href={`/${locale}/login`}
                className="font-bold hover:underline"
                style={{ color: 'var(--color-secondary-500)' }}
              >
                {t('auth.login')}
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}