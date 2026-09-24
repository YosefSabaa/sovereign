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
import PageTransition from '@/components/PageTransition';
import {
  UserPlus, Mail, Lock, User as UserIcon, Phone,
  Eye, EyeOff, AlertCircle, Heart, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fadeInUp, staggerContainer, staggerItem, heartbeat } from '@/lib/animations';

export default function RegisterPage() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        email,
        phone,
        createdAt: new Date()
      });
      toast.success(t('auth.registerSuccess'));
      router.push(`/${locale}`);
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? locale === 'ar'
            ? 'هذا الإيميل مستخدم بالفعل'
            : 'Email already in use'
          : err.code === 'auth/weak-password'
          ? locale === 'ar'
            ? 'كلمة المرور ضعيفة جداً (6 أحرف على الأقل)'
            : 'Password too weak (min 6 chars)'
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
          <div className="absolute top-20 right-20 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-navy-200/30 rounded-full blur-3xl" />
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
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center mb-5 shadow-xl"
              >
                <UserPlus size={36} className="text-white" />
              </motion.div>
              <h1 className="text-2xl font-black text-navy-700 mb-2">
                {t('auth.register')}
              </h1>
              <p className="text-gray-500 text-sm">
                {locale === 'ar'
                  ? 'انضم إلى عائلة Sovereign'
                  : 'Join the Sovereign family'}
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
            <form onSubmit={submit} className="space-y-4">
              <motion.div variants={fadeInUp}>
                <label className="label flex items-center gap-2">
                  <UserIcon size={14} className="text-teal-500" />
                  {t('auth.name')}
                </label>
                <div className="relative">
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="input pl-11"
                    placeholder={locale === 'ar' ? 'اسمك الكامل' : 'Full name'}
                  />
                  <UserIcon
                    size={18}
                    className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 pointer-events-none"
                  />
                </div>
              </motion.div>

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
                  <Phone size={14} className="text-teal-500" />
                  {t('auth.phone')}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    className="input pl-11"
                    dir="ltr"
                    placeholder="01XXXXXXXXX"
                  />
                  <Phone
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
                className="btn-primary w-full text-lg py-4 mt-6"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

            {/* Trust note */}
            <div className="mt-6 p-3 rounded-xl bg-teal-50 border border-teal-100 flex items-start gap-2">
              <ShieldCheck size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-teal-800 font-medium">
                {locale === 'ar'
                  ? 'بياناتك آمنة ومشفرة. لن نشاركها مع أي طرف ثالث.'
                  : 'Your data is safe and encrypted. We never share it.'}
              </p>
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-gray-600 mt-5">
              {t('auth.hasAccount')}{' '}
              <Link
                href={`/${locale}/login`}
                className="text-teal-600 hover:text-teal-700 font-bold hover:underline transition-colors"
              >
                {t('auth.login')}
              </Link>
            </p>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="flex justify-center gap-6 mt-8 text-teal-500/40"
          >
            {[Heart, ShieldCheck, Heart].map((Icon, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
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