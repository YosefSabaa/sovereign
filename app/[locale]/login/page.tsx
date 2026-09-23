'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginForm() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = params.get('redirect') || '';
  const target = `/${locale}${redirect ? '/' + redirect.replace(/^\//, '') : ''}`;

  useEffect(() => {
    if (user) router.replace(target);
  }, [user, router, target]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success(t('auth.loginSuccess'));
      router.replace(target);
    } catch (err: any) {
      toast.error(err.message || t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-teal-500 rounded-full flex items-center justify-center mb-4">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-navy-700">{t('auth.login')}</h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">{t('auth.email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required className="input" dir="ltr" />
          </div>
          <div>
            <label className="label">{t('auth.password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required minLength={6} className="input" dir="ltr" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('common.loading') : t('auth.submitLogin')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t('auth.noAccount')}{' '}
          <Link href={`/${locale}/register`}
            className="text-teal-600 font-bold hover:underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}