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
import PageTransition from '@/components/PageTransition';
import {
  LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, Stethoscope, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fadeInUp, staggerContainer, staggerItem, heartbeat } from '@/lib/animations';

function LoginForm() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
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
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success(t('auth.loginSuccess'));
      router.replace(target);
    } catch (err: any) {
      const msg =
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
          ? locale === 'ar'
            ? 'الإيميل أو كلمة المرور غير صحيحة'
            : 'Invalid email or password'
          : err.message || t('auth.error');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-navy-200/30 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(to right, #1e3a5f 1px, transparent 1px),
                linear-gradient(to bottom, #1e3a5f 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
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
            className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                animate={heartbeat}
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-5 shadow-xl glow-pulse"
              >
                <LogIn size={36} className="text-white" />
              </motion.div>
              <h1 className="text-2xl font-black text-navy-700 mb-2">
                {t('auth.login')}
              </h1>
              <p className="text-gray-500 text-sm">
                {locale === 'ar'
                  ? 'أهلاً بك مجدداً في Sovereign'
                  : 'Welcome back to Sovereign'}
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-5 flex items-start gap-2"
                >
                  <AlertCircle
                    size={18}
                    className="text-red-600 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={submit} className="space-y-5">
              <motion.div variants={fadeInUp}>
                <label className="label flex items-center gap-2">
                  <Mail size={14} className="text-teal-500" />
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="input pl-11"
                    dir="ltr"
                    placeholder="you@example.com"
                  />
                  <Mail
                    size={18}
                    className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 pointer-events-none"
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <label className="label flex items-center gap-2">
                  <Lock size={14} className="text-teal-500" />
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input pl-11 pr-11"
                    dir="ltr"
                    placeholder="••••••••"
                  />
                  <Lock
                    size={18}
                    className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-teal-500 transition-colors"
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
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 font-semibold">
                  {locale === 'ar' ? 'أو' : 'OR'}
                </span>
              </div>
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-gray-600">
              {t('auth.noAccount')}{' '}
              <Link
                href={`/${locale}/register`}
                className="text-teal-600 hover:text-teal-700 font-bold hover:underline transition-colors"
              >
                {t('auth.register')}
              </Link>
            </p>
          </motion.div>

          {/* Decorative medical icons */}
          <motion.div
            variants={staggerItem}
            className="flex justify-center gap-6 mt-8 text-teal-500/40"
          >
            {[Stethoscope, Heart, Stethoscope].map((Icon, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}