'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.error(err.message || t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-navy-500 rounded-full flex items-center justify-center mb-4">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-navy-700">{t('auth.register')}</h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">{t('auth.name')}</label>
            <input value={name} onChange={e => setName(e.target.value)}
              required className="input" />
          </div>
          <div>
            <label className="label">{t('auth.email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required className="input" dir="ltr" />
          </div>
          <div>
            <label className="label">{t('auth.phone')}</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              required className="input" dir="ltr" placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <label className="label">{t('auth.password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required minLength={6} className="input" dir="ltr" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('common.loading') : t('auth.submitRegister')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t('auth.hasAccount')}{' '}
          <Link href={`/${locale}/login`}
            className="text-teal-600 font-bold hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}