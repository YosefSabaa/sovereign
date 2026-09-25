'use client';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0 }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: '#0a1828',
            fontFamily: 'system-ui'
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              width: '100%',
              background: '#1a2f4d',
              borderRadius: '24px',
              padding: '32px',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              textAlign: 'center',
              color: '#f8fafc'
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 20px',
                borderRadius: '16px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={40} style={{ color: '#ef4444' }} />
            </div>

            <h1
              style={{
                fontSize: '24px',
                fontWeight: 900,
                marginBottom: '12px'
              }}
            >
              خطأ في التطبيق
            </h1>

            <p
              style={{
                fontSize: '14px',
                color: '#cbd5e1',
                marginBottom: '24px',
                wordBreak: 'break-all'
              }}
              dir="ltr"
            >
              {error.message}
            </p>

            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 700,
                background: 'linear-gradient(to right, #d4af37, #b8942e)',
                color: '#0a1828',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={18} />
              إعادة تحميل
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}