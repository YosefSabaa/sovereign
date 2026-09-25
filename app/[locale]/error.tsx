'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function LocaleError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('🔴 Locale error:', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: '#0a1828' }}
    >
      <div
        className="max-w-lg w-full rounded-3xl p-8 shadow-2xl text-center"
        style={{
          background: '#1a2f4d',
          border: '2px solid rgba(239, 68, 68, 0.4)'
        }}
      >
        <div
          className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(239, 68, 68, 0.15)' }}
        >
          <AlertTriangle size={40} style={{ color: '#ef4444' }} />
        </div>

        <h1
          className="text-2xl font-black mb-3"
          style={{ color: '#f8fafc' }}
        >
          حدث خطأ
        </h1>

        <p
          className="text-sm mb-6 break-all"
          style={{ color: '#cbd5e1' }}
          dir="ltr"
        >
          {error.message || 'Unknown error'}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-3 rounded-xl font-bold flex items-center gap-2"
            style={{
              background: 'linear-gradient(to right, #d4af37, #b8942e)',
              color: '#0a1828'
            }}
          >
            <RefreshCw size={18} />
            إعادة المحاولة
          </button>

          <a
            href="/ar"
            className="px-5 py-3 rounded-xl font-bold flex items-center gap-2"
            style={{
              background: 'rgba(212, 175, 55, 0.15)',
              color: '#d4af37',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            <Home size={18} />
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}