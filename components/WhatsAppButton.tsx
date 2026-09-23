'use client';
import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const t = useTranslations('whatsapp');
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201012345678';
  const msg = encodeURIComponent('مرحباً، أريد الاستفسار عن منتجات Sovereign');
  const url = `https://wa.me/${phone}?text=${msg}`;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      title={t('tooltip')}
      className="fixed bottom-6 left-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110">
      <MessageCircle size={28} />
    </a>
  );
}