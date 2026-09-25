'use client';
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  debugInfo: any;
};

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      debugInfo: {}
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🔴 Error Boundary caught:', error, errorInfo);

    const debugInfo: any = {
      message: error.message,
      name: error.name,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
      stack: error.stack?.split('\n').slice(0, 8).join('\n')
    };

    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      debugInfo.hasExtensions = html.innerHTML.includes('chrome-extension');
      debugInfo.bodyClasses = document.body.className;
      debugInfo.htmlClasses = html.className;

      try {
        debugInfo.localStorageKeys = Object.keys(localStorage).filter((k) =>
          k.startsWith('sovereign')
        );
      } catch {}
    }

    this.setState({ errorInfo, debugInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/ar';
  };

  handleClearStorage = () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('sovereign_cart');
      localStorage.removeItem('sovereign_wishlist');
      window.location.reload();
    } catch {}
  };

  render() {
    if (this.state.hasError) {
      const { error, debugInfo } = this.state;

      const isHydrationError =
        error?.message?.toLowerCase().includes('hydration') ||
        error?.message?.toLowerCase().includes('text content');

      const isExtensionError =
        error?.stack?.includes('chrome-extension') ||
        debugInfo?.hasExtensions;

      return (
        <div
          className="min-h-screen flex items-center justify-center px-4 py-10"
          style={{ background: '#0a1828' }}
        >
          <div className="max-w-3xl w-full">
            <div
              className="rounded-3xl p-8 shadow-2xl mb-4"
              style={{
                background: '#1a2f4d',
                border: '2px solid rgba(239, 68, 68, 0.4)'
              }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(239, 68, 68, 0.15)' }}
                >
                  <AlertTriangle size={32} style={{ color: '#ef4444' }} />
                </div>
                <div className="flex-1">
                  <h1
                    className="text-2xl font-black mb-2"
                    style={{ color: '#f8fafc' }}
                  >
                    حدث خطأ في الصفحة
                  </h1>
                  <p
                    className="text-sm"
                    style={{ color: '#cbd5e1' }}
                    dir="ltr"
                  >
                    {error?.name || 'Error'} : {error?.message?.slice(0, 200)}
                  </p>
                </div>
              </div>

              {isHydrationError && (
                <div
                  className="rounded-xl p-4 mb-4"
                  style={{
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.3)'
                  }}
                >
                  <p
                    className="text-sm font-bold mb-1"
                    style={{ color: '#eab308' }}
                  >
                    🔄 مشكلة Hydration
                  </p>
                  <p className="text-xs" style={{ color: '#eab308' }}>
                    عادةً السبب: إضافة Chrome (Extension)، أو استخدام
                    Date.now()، أو localStorage بدون useEffect.
                  </p>
                </div>
              )}

              {isExtensionError && (
                <div
                  className="rounded-xl p-4 mb-4"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <p
                    className="text-sm font-bold mb-1"
                    style={{ color: '#8b5cf6' }}
                  >
                    🔌 إضافة Chrome مكتشفة
                  </p>
                  <p className="text-xs" style={{ color: '#8b5cf6' }}>
                    في Chrome Extension بيتفاعل مع الصفحة. جرّب Incognito Mode
                    (Ctrl+Shift+N) عشان تتأكد.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={this.handleReload}
                  className="px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(to right, #d4af37, #b8942e)',
                    color: '#0a1828'
                  }}
                >
                  <RefreshCw size={18} />
                  إعادة تحميل
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105"
                  style={{
                    background: 'rgba(212, 175, 55, 0.15)',
                    color: '#d4af37',
                    border: '1px solid rgba(212, 175, 55, 0.3)'
                  }}
                >
                  <Home size={18} />
                  الرئيسية
                </button>
                <button
                  onClick={this.handleClearStorage}
                  className="px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  🗑️ مسح البيانات
                </button>
              </div>
            </div>

            <details
              className="rounded-2xl p-5 shadow-lg"
              style={{
                background: '#0f1f36',
                border: '1px solid rgba(212, 175, 55, 0.15)'
              }}
            >
              <summary
                className="cursor-pointer font-bold flex items-center gap-2 select-none"
                style={{ color: '#d4af37' }}
              >
                <Bug size={18} />
                معلومات التشخيص (اضغط للعرض)
              </summary>

              <div className="mt-4 space-y-3 text-xs font-mono" dir="ltr">
                {Object.entries(debugInfo || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg p-3"
                    style={{ background: '#0a1828' }}
                  >
                    <div
                      className="font-bold mb-1"
                      style={{ color: '#d4af37' }}
                    >
                      {key}:
                    </div>
                    <pre
                      className="whitespace-pre-wrap break-all"
                      style={{ color: '#cbd5e1' }}
                    >
                      {typeof value === 'object'
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </pre>
                  </div>
                ))}
              </div>

              <div
                className="mt-4 p-3 rounded-lg text-xs"
                style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  color: '#d4af37'
                }}
              >
                <p className="font-bold mb-1">🔍 خطوات التشخيص:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>جرّب في Incognito Mode (Ctrl+Shift+N)</li>
                  <li>عطّل الإضافات من chrome://extensions</li>
                  <li>امسح الكاش: Ctrl+Shift+Delete</li>
                  <li>لو المشكلة مستمرة، ابعت Screenshot من Console</li>
                </ol>
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}