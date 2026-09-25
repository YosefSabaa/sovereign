'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { phoneToEmail, isValidEgyptianPhone } from '@/lib/phoneAuth';
import PageTransition from '@/components/PageTransition';
import {
  LogIn, Lock, Phone, Eye, EyeOff, AlertCircle, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fadeInUp, staggerContainer, staggerItem, heartbeat } from '@/lib/animations';

function LoginForm() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirect = params.get('redirect') || '';
  const target = `/${locale}${
    redirect ? '/' + redirect.replace(/^\//, '') : ''
  }`;

  useEffect(() => {
    if (user) router.replace(target);
  }, [user, router, target]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEgyptianPhone(phone)) {
      const msg = locale === 'ar'
        ? 'أدخل رقم هاتف مصري صحيح'
        : 'Enter a valid Egyptian phone';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const email = phoneToEmail(phone);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success(locale === 'ar' ? 'تم تسجيل الدخول ✓' : 'Logged in ✓');
      router.replace(target);
    } catch (err: any) {
      let msg = t('auth.error');

      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        msg = locale === 'ar'
          ? 'رقم الهاتف أو كلمة المرور غير صحيحة'
          : 'Invalid phone or password';
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
            className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl opacity-20"
            style={{ background: 'var(--color-secondary-500)' }}
          />
          <div
            className="absolute bottom-20 right-20 w-72 h-72 rounded-full blur-3xl opacity-20"
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
                className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5 shadow-xl glow-pulse"
                style={{
                  background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
                }}
              >
                <LogIn size={36} style={{ color: '#0a1828' }} />
              </motion.div>
              <h1
                className="text-2xl font-black mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t('auth.login')}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {locale === 'ar' ? 'أهلاً بك مجدداً' : 'Welcome back'}
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
            <form onSubmit={submit} className="space-y-5">
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
                className="btn-primary w-full text-lg py-4"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    {t('auth.submitLogin')}
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full"
                  style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}
                />
              </div>
              <div className="relative flex justify-center text-xs">
                <span
                  className="px-3 font-semibold"
                  style={{
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  {locale === 'ar' ? 'أو' : 'OR'}
                </span>
              </div>
            </div>

            <p
              className="text-center text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {t('auth.noAccount')}{' '}
              <Link
                href={`/${locale}/register`}
                className="font-bold hover:underline"
                style={{ color: 'var(--color-secondary-500)' }}
              >
                {t('auth.register')}
              </Link>
            </p>
          </motion.div>

          {/* Decorative */}
          <motion.div
            variants={staggerItem}
            className="flex justify-center gap-6 mt-8"
            style={{ color: 'var(--color-secondary-500)', opacity: 0.3 }}
          >
            {[Heart, Heart, Heart].map((Icon, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
              >
                <Icon size={24} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginForm />
    </Suspense>
  );
}